import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser, LoginData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";


interface ReplitUser { // Added ReplitUser interface
  id: string;
  name: string;
  // Add other necessary fields from Replit Auth
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean; // Added isAuthenticated
  loginMutation: UseMutationResult<User, Error, LoginData & { useReplitAuth?: boolean }>; // Modified to include useReplitAuth
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  loginWithReplit: (replitUser: ReplitUser) => Promise<void>; // Added loginWithReplit
  logout: () => void; // Added logout function
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [userFromReplit, setUserFromReplit] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null); // Added user state

  const {
    data: userDataFromQuery,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (userDataFromQuery !== undefined) {
      setUser(userDataFromQuery); // Update user state from query data
    }
  }, [userDataFromQuery]);

  const isAuthenticated = !!user; // Added isAuthenticated logic

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData & { useReplitAuth?: boolean }) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      setUser(user); // Update user state after successful login
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name || user.username}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      setUser(user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.name || user.username}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      setUser(null); // Clear user state after logout
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      setLocation("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  const logout = () => logoutMutation.mutate(); // Added logout function


  const loginWithReplit = async (replitUser: ReplitUser) => {
    try {
      // Use loginMutation instead to ensure consistency
      loginMutation.mutate({ 
        username: replitUser.id, 
        password: 'replit-auth', 
        useReplitAuth: true 
      });
    } catch (error) {
      console.error("Replit Auth login error:", error);
      toast({
        title: "Login Failed",
        description: "Failed to log in with Replit. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || userFromReplit || null,
        isLoading,
        isAuthenticated,
        loginMutation,
        logoutMutation,
        registerMutation,
        loginWithReplit,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}