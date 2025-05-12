import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  apiRequest, 
  queryClient, 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken 
} from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  name?: string;
  email: string;
  subscription: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  loginMutation: ReturnType<typeof useMutation>;
  registerMutation: ReturnType<typeof useMutation>;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  // Check for token on initial load
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Token exists, so we'll try to fetch the user
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    }
  }, []);

  // Fetch the current user on initial load if token exists
  const { isLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      if (!getAuthToken()) {
        return null;
      }
      
      try {
        const response = await apiRequest("GET", "/api/user");
        const userData = await response.json();
        setUser(userData);
        return userData;
      } catch (error) {
        setUser(null);
        removeAuthToken();
        return null;
      }
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      // Store the JWT token
      if (data.token) {
        setAuthToken(data.token);
        // Remove token from user data before storing
        const { token, ...userData } = data;
        setUser(userData);
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/register", userData);
      return response.json();
    },
    onSuccess: (data) => {
      // Store the JWT token
      if (data.token) {
        setAuthToken(data.token);
        // Remove token from user data before storing
        const { token, ...userData } = data;
        setUser(userData);
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    }
  });

  const login = (credentials: { email: string; password: string }) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      removeAuthToken();
      queryClient.invalidateQueries();
      setUser(null);
      setLocation("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the server logout fails, remove the token
      removeAuthToken();
      setUser(null);
      setLocation("/auth");
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  // Register function
  const register = (userData: RegisterCredentials) => {
    return registerMutation.mutateAsync(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        loginMutation,
        registerMutation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};