
import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";

declare global {
  interface Window {
    replitAuth?: {
      login: () => void;
    };
  }
}

interface ReplitUser {
  id: string;
  name: string;
  profileImage: string;
  bio?: string;
  url?: string;
  roles?: string[];
  teams?: string[];
}

interface ReplitAuthContextType {
  user: ReplitUser | null;
  loading: boolean;
  error: string | null;
  login: () => void;
}

const ReplitAuthContext = createContext<ReplitAuthContextType | null>(null);

export const ReplitAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ReplitUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { loginWithReplit } = useAuth();

  const fetchUser = async () => {
    try {
      const res = await fetch('/__replauthuser');
      if (res.status === 200) {
        const userData = await res.json();
        setUser(userData);
        
        // Auto login with Replit credentials
        if (userData && userData.id) {
          // Only attempt login if we have valid user data
          await loginWithReplit(userData);
        }
      }
    } catch (err) {
      console.error('Error fetching Replit user:', err);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    
    // Initialize login function globally
    if (typeof window !== 'undefined') {
      window.replitAuth = {
        login: login
      };
    }
  }, []);

  const login = () => {
    window.addEventListener('message', authComplete);
    const h = 500;
    const w = 350;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;

    const authWindow = window.open(
      `https://replit.com/auth_with_repl_site?domain=${location.host}`,
      '_blank',
      `modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`
    );

    function authComplete(e: MessageEvent) {
      if (e.data !== 'auth_complete') return;
      
      window.removeEventListener('message', authComplete);
      if (authWindow) {
        authWindow.close();
      }
      
      fetchUser();
      toast({
        title: "Authentication successful",
        description: "You've been logged in with Replit",
      });
    }
  };

  return (
    <ReplitAuthContext.Provider value={{ user, loading, error, login }}>
      {children}
    </ReplitAuthContext.Provider>
  );
};

export const useReplitAuth = () => {
  const context = useContext(ReplitAuthContext);
  if (!context) {
    throw new Error('useReplitAuth must be used within a ReplitAuthProvider');
  }
  return context;
};
