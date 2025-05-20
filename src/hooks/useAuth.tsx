
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  logout: () => {},
  checkAuth: () => false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = (): boolean => {
    const tokenData = localStorage.getItem("authToken");
    
    if (!tokenData) {
      setIsAuthenticated(false);
      setUsername(null);
      return false;
    }
    
    try {
      const { expiry, username } = JSON.parse(tokenData);
      const isValid = new Date().getTime() < expiry;
      
      if (!isValid) {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUsername(null);
        return false;
      }
      
      setIsAuthenticated(true);
      setUsername(username);
      return true;
    } catch (error) {
      console.error("Error parsing auth token:", error);
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      setUsername(null);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
