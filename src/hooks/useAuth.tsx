
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import forge from "node-forge";

interface UserData {
  name: string | null;
  email: string | null;
  username: string | null;
  role: string | null;
  group: string | null;
  tel: string | null;
  photo: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  checkEmail: (email: string) => Promise<boolean>;
  validateToken: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (code: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const API_BASE_URL = "https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api";
const API_CODE = "z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==";

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  userData: null,
  login: () => Promise.resolve(false),
  logout: () => {},
  checkAuth: () => false,
  checkEmail: () => Promise.resolve(false),
  validateToken: () => Promise.resolve(false),
  requestPasswordReset: () => Promise.resolve(false),
  resetPassword: () => Promise.resolve(false),
  isLoading: true
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  // Decode JWT token to extract user information
  const decodeToken = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Extract user data from token payload
  const extractUserDataFromToken = async (token: string): Promise<UserData | null> => {
    const payload = decodeToken(token);
    if (!payload) return null;

    // Get additional user details from API if needed
    try {
      const userDetails = await getUserDetails(payload.email);
      return userDetails || {
        name: null,
        email: payload.email || null,
        username: payload.sub || null,
        role: payload.role || null,
        group: payload.group || null,
        tel: null,
        photo: null
      };
    } catch (error) {
      // Fallback to token data if API call fails
      return {
        name: null,
        email: payload.email || null,
        username: payload.sub || null,
        role: payload.role || null,
        group: payload.group || null,
        tel: null,
        photo: null
      };
    }
  };

  // Initialize auth state only once
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      const initAuth = async () => {
        try {
          await checkAuthAsync();
        } finally {
          setIsLoading(false);
        }
      };
      initAuth();
    }
  }, [initialized]);

  // Async version of checkAuth to handle initial load properly
  const checkAuthAsync = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setIsAuthenticated(false);
      setUsername(null);
      setUserData(null);
      return false;
    }
    
    try {
      // Always validate token with server on page refresh/initialization
      console.log("Validating token with server...");
      const isServerValid = await validateTokenSilently(token);
      
      if (isServerValid) {
        console.log("Token is valid");
        
        // Extract user data from token
        const userDataFromToken = await extractUserDataFromToken(token);
        const payload = decodeToken(token);
        
        setIsAuthenticated(true);
        setUsername(payload?.sub || userDataFromToken?.username || null);
        setUserData(userDataFromToken);
        return true;
      } else {
        console.log("Token is invalid or expired");
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUsername(null);
        setUserData(null);
        return false;
      }
    } catch (error) {
      console.error("Error validating auth token:", error);
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      setUsername(null);
      setUserData(null);
      return false;
    }
  }, []);

  // Silent token validation (no state updates on failure)
  const validateTokenSilently = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/User/CheckToken?code=${API_CODE}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.log("Silent token validation failed with status:", response.status);
        return false;
      }
      
      const data = await response.json();
      const isValid = data && data.IsValid === true;
      console.log("Silent token validation result:", isValid);
      return isValid;
    } catch (error) {
      console.error("Silent token validation error:", error);
      return false;
    }
  };

  // Validate token with server (with state updates)
  const validateToken = async (): Promise<boolean> => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      return false;
    }
    
    try {
      // Validate token with server
      const response = await fetch(
        `${API_BASE_URL}/User/CheckToken?code=${API_CODE}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error("Token validation failed:", response.statusText);
        logout();
        return false;
      }
      
      const data = await response.json();
      
      if (data && data.IsValid === true) {
        // Extract user data from token
        const userDataFromToken = await extractUserDataFromToken(token);
        const payload = decodeToken(token);
        
        setIsAuthenticated(true);
        setUsername(payload?.sub || userDataFromToken?.username || null);
        setUserData(userDataFromToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error("Error validating token:", error);
      logout();
      return false;
    }
  };

  // Check if email exists in the system
  const checkEmail = async (email: string): Promise<boolean> => {
    if (!validateEmail(email)) return false;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/User/EmailExists?email=${encodeURIComponent(email)}&code=${API_CODE}`
      );
      
      if (!response.ok) {
        throw new Error(`Error checking email: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.Exists === true;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };
  
  // Get salt for the user
  const getSaltForUser = async (email: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/User/GetUserSalt?identifier=${encodeURIComponent(email)}&code=${API_CODE}`
      );
      
      if (!response.ok) {
        throw new Error(`Error getting salt: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.Salt || null;
    } catch (error) {
      console.error("Error getting salt:", error);
      return null;
    }
  };
  
  // Hash password with salt
  const hashPassword = (password: string, salt: string): string => {
    const combined = password + salt;
    const md = forge.md.sha256.create();
    md.update(combined);
    const hash = md.digest().bytes();
    return forge.util.encode64(hash);
  };
  
  // Get user details from API
  const getUserDetails = async (email: string): Promise<UserData | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/User/GetByEmail?email=${encodeURIComponent(email)}&code=${API_CODE}`
      );
      
      if (!response.ok) {
        throw new Error(`Error getting user details: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        name: data.Name || null,
        email: data.Email || null,
        username: data.Username || null,
        role: data.Role || null,
        group: data.Group || null,
        tel: data.Tel || null,
        photo: data.Photo || null
      };
    } catch (error) {
      console.error("Error getting user details:", error);
      return null;
    }
  };
  
  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };
  
  // Validate password format
  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?!.*(?:--|;|\/\*|\*\/|xp_|union|select|insert|update|delete|drop|alter|create|truncate|exec|declare)).{5,}$/;
    return passwordRegex.test(password);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Validate input
    if (!validateEmail(email)) {
      toast.error("Formato de email inválido");
      return false;
    }
    
    if (!validatePassword(password)) {
      toast.error("Deve inserir uma password válida com pelo menos 5 caracteres");
      return false;
    }
    
    try {
      // First check if email exists
      const emailExists = await checkEmail(email);
      if (!emailExists) {
        toast.error("Email não registado no sistema");
        return false;
      }
      
      // Get salt for hashing
      const salt = await getSaltForUser(email);
      if (!salt) {
        toast.error("Erro ao obter dados de autenticação");
        return false;
      }
      
      // Hash the password
      const hashedPassword = hashPassword(password, salt);
      
      // Attempt login
      const loginResponse = await fetch(`${API_BASE_URL}/User/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Email: email,
          Password: hashedPassword,
          Code: API_CODE
        })
      });
      
      if (!loginResponse.ok) {
        if (loginResponse.status === 401) {
          toast.error("Password incorreta");
        } else {
          toast.error(`Erro no login: ${loginResponse.statusText}`);
        }
        return false;
      }
      
      const loginData = await loginResponse.json();
      
      if (loginData && loginData.Token) {
        // Store only the token string
        localStorage.setItem("authToken", loginData.Token);
        
        // Extract user data from token
        const userDataFromToken = await extractUserDataFromToken(loginData.Token);
        const payload = decodeToken(loginData.Token);
        
        // Update state synchronously to prevent race conditions
        const finalUsername = payload?.sub || userDataFromToken?.username || email;
        
        // Use React's batching by wrapping in a single update
        setIsAuthenticated(true);
        setUsername(finalUsername);
        setUserData(userDataFromToken);
        
        console.log("Login successful, token stored and state updated");
        console.log("Auth state:", { isAuthenticated: true, username: finalUsername, userData: userDataFromToken });
        
        toast.success("Login efetuado com sucesso");
        
        // Add a small delay to ensure state is updated before returning
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
      } else {
        console.error("Invalid login response:", loginData);
        toast.error("Falha no login: Token não recebido");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(`Erro no login: ${(error as Error).message || "Erro desconhecido"}`);
      return false;
    }
  };

  // Synchronous checkAuth for immediate state checking
  const checkAuth = useCallback((): boolean => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      console.log("No token found in localStorage");
      return false;
    }
    
    try {
      // Check if token is a valid JWT format
      const payload = decodeToken(token);
      if (payload && payload.exp) {
        // Check if token is not expired (basic client-side check)
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp > currentTime) {
          console.log("Token exists and is not expired (client-side check)");
          return true;
        } else {
          console.log("Token is expired (client-side check)");
          localStorage.removeItem("authToken");
          return false;
        }
      } else {
        console.log("Invalid token payload");
        localStorage.removeItem("authToken");
        return false;
      }
    } catch (error) {
      console.error("Error parsing auth token:", error);
      localStorage.removeItem("authToken");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUsername(null);
    setUserData(null);
  }, []);

  // Request password reset
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    if (!validateEmail(email)) {
      toast.error("Formato de email inválido");
      return false;
    }

    try {
      // First check if email exists
      const emailExists = await checkEmail(email);
      if (!emailExists) {
        toast.error("Email não registado no sistema");
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/User/RequestPasswordReset?code=${API_CODE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Email: email
        })
      });

      if (!response.ok) {
        throw new Error(`Error requesting password reset: ${response.statusText}`);
      }

      toast.success("Email de recuperação de password enviado com sucesso");
      return true;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error("Erro ao solicitar recuperação de password");
      return false;
    }
  };

  // Generate salt
  const generateSalt = (): string => {
    const randomBytes = forge.random.getBytesSync(16);
    return forge.util.encode64(randomBytes);
  };

  // Reset password with code
  const resetPassword = async (code: string, password: string): Promise<boolean> => {
    if (!validatePassword(password)) {
      toast.error("Deve inserir uma password válida com pelo menos 5 caracteres");
      return false;
    }

    try {
      // Generate new salt and hash password
      const salt = generateSalt();
      const hashedPassword = hashPassword(password, salt);

      const response = await fetch(`${API_BASE_URL}/User/SetPasswordByResetCode?code=${API_CODE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          password: hashedPassword,
          salt: salt
        })
      });

      if (!response.ok) {
        if (response.status === 400) {
          toast.error("Código inválido ou expirado");
        } else {
          toast.error(`Erro ao alterar password: ${response.statusText}`);
        }
        return false;
      }

      toast.success("Password alterada com sucesso");
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Erro ao alterar password");
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      username, 
      userData,
      login, 
      logout, 
      checkAuth,
      checkEmail,
      validateToken,
      requestPasswordReset,
      resetPassword,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
