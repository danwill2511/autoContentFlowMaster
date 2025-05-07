import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useReplitAuth } from "@/hooks/use-replit-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [_, navigate] = useLocation();
  const { replitAuthAvailable, loginWithReplit } = useReplitAuth();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(data.username, data.email, data.password);
      toast({
        title: "Registration successful",
        description: "You can now log in with your credentials",
      });
      setActiveTab("login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplitLogin = async () => {
    try {
      await loginWithReplit();
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Could not login with Replit",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">AutoContentFlow</CardTitle>
          <CardDescription>
            Sign in to manage your automated content workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          At least 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          {replitAuthAvailable && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-500">Or continue with</span>
              </div>
            </div>
          )}

          {replitAuthAvailable && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReplitLogin}
              className="w-full"
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                  fill="#F26207"
                ></path>
                <path
                  d="M9.77764 14.9346L8.24764 16.4646C8.14764 16.5646 8.05764 16.6646 7.94764 16.7246C7.35764 17.1146 6.57764 17.0246 6.07764 16.5246L4.57764 15.0246C4.07764 14.5246 3.99764 13.7446 4.38764 13.1546C4.45764 13.0446 4.55764 12.9546 4.65764 12.8546L6.18764 11.3246L9.77764 14.9346ZM15.8476 6.78457L17.3476 5.28457C17.4476 5.18457 17.5476 5.08457 17.6576 5.02457C18.2476 4.63457 19.0276 4.71457 19.5276 5.21457L21.0276 6.71457C21.5276 7.21457 21.6076 7.99457 21.2176 8.58457C21.1476 8.69457 21.0476 8.79457 20.9476 8.89457L19.4176 10.4246L15.8476 6.78457ZM19.4176 11.3246L15.8176 14.9246L12.2176 11.3246L15.8176 7.72457L19.4176 11.3246ZM14.9176 15.8246L11.3176 19.4246L7.71764 15.8246L11.3176 12.2246L14.9176 15.8246ZM11.3176 6.78457L14.9176 3.18457C15.1976 2.90457 15.1976 2.46457 14.9176 2.18457L13.5576 0.824572C13.2776 0.544572 12.8376 0.544572 12.5576 0.824572L8.95764 4.42457L11.3176 6.78457ZM8.95764 5.28457L5.35764 8.88457L7.71764 11.2446L11.3176 7.64457L8.95764 5.28457ZM10.4176 19.4246L8.05764 21.7846L9.41764 23.1446C9.69764 23.4246 10.1376 23.4246 10.4176 23.1446L12.7776 20.7846L10.4176 19.4246ZM14.9176 16.4646L13.5576 17.8246L16.7776 21.0446C17.0576 21.3246 17.4976 21.3246 17.7776 21.0446L19.1376 19.6846C19.4176 19.4046 19.4176 18.9646 19.1376 18.6846L14.9176 16.4646ZM4.68764 7.68457L3.32764 9.04457C3.04764 9.32457 3.04764 9.76457 3.32764 10.0446L4.68764 11.4046L7.04764 9.04457L4.68764 7.68457Z"
                  fill="white"
                ></path>
              </svg>
              Login with Replit
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}