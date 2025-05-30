import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, loginSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Helper to get Replit user data from request headers
function getReplitUser(req: express.Request) {
  if (req.headers && req.headers["x-replit-user-id"]) {
    return {
      id: req.headers["x-replit-user-id"] as string,
      name: req.headers["x-replit-user-name"] as string,
      profileImage: req.headers["x-replit-user-profile-image"] as string,
      bio: req.headers["x-replit-user-bio"] as string,
      url: req.headers["x-replit-user-url"] as string,
      roles: req.headers["x-replit-user-roles"] ? 
        (req.headers["x-replit-user-roles"] as string).split(',') : 
        undefined,
      teams: req.headers["x-replit-user-teams"] ? 
        (req.headers["x-replit-user-teams"] as string).split(',') : 
        undefined,
    };
  }
  return null;
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "auto-content-flow-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { 
        usernameField: 'email',
        passwordField: 'password' 
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check both email and username
      const [existingEmail, existingUsername] = await Promise.all([
        storage.getUserByEmail(req.body.email),
        storage.getUserByUsername(req.body.username)
      ]);
      
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        subscription: "free"
      });

      // Remove password from the response
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Check for Replit Auth first
      const replitUser = getReplitUser(req);
      if (replitUser) {
        // Check if user exists in our system, if not create one
        storage.getUserByReplitId(replitUser.id)
          .then(async (user) => {
            // Check if the Replit user is an admin based on roles or other criteria
            const isAdmin = replitUser.roles && replitUser.roles.includes('admin');
            
            if (!user) {
              // Create a new user with Replit credentials
              user = await storage.createUser({
                name: replitUser.name,
                username: replitUser.name.toLowerCase().replace(/\s+/g, '_'),
                email: `${replitUser.id}@replit.user`,
                password: randomBytes(32).toString('hex'),
                subscription: isAdmin ? "business" : "free", // Admins get business tier
                replitId: replitUser.id,
                profileImage: replitUser.profileImage,
                isAdmin: isAdmin
              });
            } else if (isAdmin && user.subscription !== "business") {
              // Update existing user to admin status if they weren't before
              user = await storage.updateUserSubscription(user.id, "business");
              
              // Update admin status if not already set
              if (!user.isAdmin) {
                user = await storage.updateUser(user.id, { isAdmin: true });
              }
            }
            
            req.login(user, (err) => {
              if (err) return next(err);
              
              // Remove password from the response
              const { password, ...userWithoutPassword } = user;
              return res.status(200).json(userWithoutPassword);
            });
          })
          .catch(next);
        return;
      }
      
      // Fallback to regular login
      try {
        loginSchema.parse(req.body);
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          return res.status(400).json({ message: fromZodError(validationError).message });
        }
        throw validationError;
      }
      
      passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
        
        req.login(user, (err) => {
          if (err) return next(err);
          
          // Remove password from the response
          const { password, ...userWithoutPassword } = user;
          return res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Remove password from the response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}
