import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

// Define ReplitAuth Context type
type ReplitAuthContextType = {
  user: ReplitUser | null;
  isLoading: boolean;
};

// Replit User type
type ReplitUser = {
  id: string;
  name: string;
  bio: string;
  url: string;
  profileImage: string;
};

// Create ReplitAuth Context with default values
const ReplitAuthContext = createContext<ReplitAuthContextType>({
  user: null,
  isLoading: false,
});

// ReplitAuth Provider props
type ReplitAuthProviderProps = {
  children: React.ReactNode;
};

// ReplitAuth Provider component
export const ReplitAuthProvider: React.FC<ReplitAuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [replitUser, setReplitUser] = useState<ReplitUser | null>(null);

  // Fetch Replit user
  useEffect(() => {
    const fetchReplitUser = async () => {
      try {
        const response = await fetch("/__replauthuser");
        if (response.ok) {
          const userData = await response.json();
          setReplitUser(userData);
        } else {
          // User not authenticated with Replit
          setReplitUser(null);
        }
      } catch (error) {
        console.error("Replit Auth login error:", error);
        setReplitUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplitUser();
  }, []);

  // Create memoized context value
  const contextValue = useMemo(
    () => ({
      user: replitUser,
      isLoading,
    }),
    [replitUser, isLoading]
  );

  return <ReplitAuthContext.Provider value={contextValue}>{children}</ReplitAuthContext.Provider>;
};

// Custom hook to use ReplitAuth context
export const useReplitAuth = () => {
  const context = useContext(ReplitAuthContext);
  if (!context) {
    throw new Error("useReplitAuth must be used within a ReplitAuthProvider");
  }
  return context;
};