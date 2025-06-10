import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import forge from "node-forge";

// --- TYPE DEFINITIONS ---
interface UserData {
  name: string | null;
  email: string | null;
  username: string | null;
  role: string | null;
  group: string | null;
  tel: string | null;
  photo: string | null;
}

interface AuthTokenData {
  token: string;
  expiry: number;
  username: string;
  userData: UserData;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  userData: UserData | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  checkEmail: (email: string) => Promise<boolean>;
  validateToken: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (code: string, password: string) => Promise<boolean>;
}

// --- CONSTANTS ---
const API_BASE_URL = "https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api";
const API_CODE = "z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==";

// --- CONTEXT CREATION ---
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  userData: null,
  isInitialized: false,
  login: () => Promise.resolve(false),
  logout: () => {},
  checkAuth: () => false,
  checkEmail: () => Promise.resolve(false),
  validateToken: () => Promise.resolve(false),
  requestPasswordReset: () => Promise.resolve(false),
  resetPassword: () => Promise.resolve(false)
});

// --- AUTH PROVIDER COMPONENT ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // New function to handle session expiry with toast and delayed redirect
  const handleSessionExpired = useCallback(() => {
    console.log('Session expired, showing notification and scheduling logout...');
    
    // Clear auth data immediately
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUsername(null);
    setUserData(null);
    
    // Show toast notification
    toast.error("Sessão expirada, a redirecionar em 3s", {
      duration: 3000,
      description: "A sua sessão expirou. Será redirecionado para a página de login."
    });
    
    // Redirect after 3 seconds
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  }, []);

  // Update the logout function to use immediate redirect for manual logout
  const logout = useCallback(() => {
    console.log('Manual logout - immediate redirect...');
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUsername(null);
    setUserData(null);
    // Immediate redirect for manual logout
    window.location.href = "/login";
  }, []);

  // Improved validateToken function with better error handling and delayed logout
  const validateToken = useCallback(async (): Promise<boolean> => {
    const tokenData = localStorage.getItem("authToken");
    if (!tokenData) {
      return false;
    }

    try {
      const parsedToken = JSON.parse(tokenData) as AuthTokenData;
      
      // Check local expiry first
      if (new Date().getTime() >= parsedToken.expiry) {
        console.log("Token expired locally. Logging out.");
        handleSessionExpired();
        return false;
      }

      console.log("Validating token with server...");
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/User/CheckToken?code=${API_CODE}`,
          {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${parsedToken.token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        // Handle different HTTP status codes
        if (response.status === 401 || response.status === 403) {
          console.log("Token rejected by server (401/403). Logging out.");
          handleSessionExpired();
          return false;
        }

        if (!response.ok) {
          console.error("Server validation failed with status:", response.status);
          // Don't log out on server errors (5xx), only on auth errors
          if (response.status >= 500) {
            console.log("Server error - keeping user logged in for now");
            return true; // Assume token is still valid during server issues
          }
          handleSessionExpired();
          return false;
        }

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse response JSON:", jsonError);
          handleSessionExpired();
          return false;
        }

        // Log response for debugging (without toast)
        console.log("CheckToken API Response:", data);

        // Check for multiple possible response formats
        const isValid = data?.IsValid === true || 
                       data?.isValid === true || 
                       data?.valid === true ||
                       (data?.status === 'valid') ||
                       (data?.success === true && data?.valid !== false);

        if (isValid) {
          console.log("Token validation successful.");
          return true;
        } else {
          console.log("Server reported token as invalid. Response:", data);
          handleSessionExpired();
          return false;
        }

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error("Token validation request timed out");
          toast.error("Timeout na verificação de sessão");
          return true; // Don't log out on timeout, assume token is still valid
        }
        
        console.error("Network error during token validation:", fetchError);
        // Don't log out on network errors - keep user logged in
        return true;
      }

    } catch (error) {
      console.error("An error occurred during token validation:", error);
      handleSessionExpired();
      return false;
    }
  }, [handleSessionExpired]);
  
  const checkAuth = useCallback(() => {
    const tokenData = localStorage.getItem("authToken");
    if (!tokenData) {
      setIsAuthenticated(false);
      return false;
    }
    try {
      const parsedToken = JSON.parse(tokenData) as AuthTokenData;
      if (new Date().getTime() >= parsedToken.expiry) {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        return false;
      }
      setIsAuthenticated(true);
      setUsername(parsedToken.username);
      setUserData(parsedToken.userData);
      return true;
    } catch (error) {
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('Initializing auth state...');
    checkAuth();
    setIsInitialized(true);
  }, [checkAuth]);
  
  // Updated useEffect that handles periodic validation to be more robust
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) {
      return; 
    }

    let isValidating = false; // Prevent concurrent validations

    const performValidation = async () => {
      if (isValidating) {
        console.log("Validation already in progress, skipping...");
        return;
      }
      
      isValidating = true;
      console.log("Performing scheduled token validation...");
      
      try {
        const isValid = await validateToken();
        if (!isValid) {
          // handleSessionExpired is already called within validateToken
          console.log("Scheduled validation failed - user will be logged out");
        } else {
          console.log("Scheduled validation successful.");
        }
      } catch (error) {
        console.error("Error during scheduled validation:", error);
      } finally {
        isValidating = false;
      }
    };

    // Initial check after 5 seconds (give time for app to load)
    const initialCheckTimeoutId = setTimeout(performValidation, 5 * 1000);
    
    // Then check every 15 minutes
    const intervalCheckId = setInterval(performValidation, 15 * 60 * 1000);

    return () => {
      clearTimeout(initialCheckTimeoutId);
      clearInterval(intervalCheckId);
    };
  }, [isInitialized, isAuthenticated, validateToken]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!validateEmail(email)) { 
      toast.error("Formato de email inválido"); 
      return false; 
    }
    if (!validatePassword(password)) { 
      toast.error("A password deve ter pelo menos 5 caracteres"); 
      return false; 
    }

    try {
      const emailExists = await checkEmail(email);
      if (!emailExists) { 
        toast.error("Email não registado no sistema"); 
        return false; 
      }

      const salt = await getSaltForUser(email);
      if (!salt) { 
        toast.error("Erro ao obter dados de autenticação"); 
        return false; 
      }

      const hashedPassword = hashPassword(password, salt);
      const loginResponse = await fetch(`${API_BASE_URL}/User/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: hashedPassword, Code: API_CODE })
      });

      if (!loginResponse.ok) { 
        toast.error(loginResponse.status === 401 ? "Password incorreta" : `Erro no login`); 
        return false; 
      }

      const loginData = await loginResponse.json();
      if (loginData && loginData.Token) {
        const userDetails = await getUserDetails(email, loginData.Token);
        if (!userDetails) { 
          toast.error("Não foi possível obter os detalhes do utilizador"); 
          return false; 
        }

        const tokenData: AuthTokenData = {
          token: loginData.Token,
          expiry: new Date().getTime() + 8 * 60 * 60 * 1000,
          username: userDetails.username || email,
          userData: userDetails
        };

        localStorage.setItem("authToken", JSON.stringify(tokenData));
        setIsAuthenticated(true);
        setUsername(userDetails.username || email);
        setUserData(userDetails);
        toast.success("Login efetuado com sucesso");
        return true;
      } else {
        toast.error("Falha no login: Resposta da API inválida");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(`Erro no login: ${(error as Error).message || "Erro desconhecido"}`);
      return false;
    }
  };
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?!.*(?:--|;|\/\*|\*\/|xp_|union|select|insert|update|delete|drop|alter|create|truncate|exec|declare)).{5,}$/;
    return passwordRegex.test(password);
  };
  
  const hashPassword = (password: string, salt: string): string => {
    const combined = password + salt;
    const md = forge.md.sha256.create();
    md.update(combined);
    return forge.util.encode64(md.digest().bytes());
  };

  const checkEmail = async (email: string): Promise<boolean> => {
    if (!validateEmail(email)) {
      return false;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/User/EmailExists?email=${encodeURIComponent(email)}&code=${API_CODE}`);
      if (!response.ok) {
        console.error("Server error checking email:", response.status);
        return false;
      }
      const data = await response.json();
      return data.Exists === true;
    } catch (error) {
      console.error("Network error checking email:", error);
      return false;
    }
  };

  const getSaltForUser = async (email: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/GetUserSalt?identifier=${encodeURIComponent(email)}&code=${API_CODE}`);
      if (!response.ok) {
        console.error("Server error getting salt:", response.status);
        return null;
      }
      const data = await response.json();
      return data.Salt || null;
    } catch (error) {
      console.error("Network error getting salt:", error);
      return null;
    }
  };

  const getUserDetails = async (email: string, token: string): Promise<UserData | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/GetByEmail?email=${encodeURIComponent(email)}&code=${API_CODE}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        console.error("Server error getting user details:", response.status);
        return null;
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
      console.error("Network error getting user details:", error);
      return null;
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    if (!validateEmail(email)) {
      toast.error("Formato de email inválido");
      return false;
    }
    
    const emailExists = await checkEmail(email);
    if (!emailExists) {
      toast.error("Email não registado no sistema");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/User/RequestPasswordReset?code=${API_CODE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email })
      });
      if (!response.ok) {
        console.error("Server error requesting password reset:", response.status);
        toast.error("Erro ao solicitar recuperação.");
        return false;
      }
      toast.success("Email de recuperação de password enviado com sucesso");
      return true;
    } catch (error) {
      console.error("Network error requesting password reset:", error);
      toast.error("Erro ao solicitar recuperação de password");
      return false;
    }
  };

  const generateSalt = (): string => {
    return forge.util.encode64(forge.random.getBytesSync(16));
  };

  const resetPassword = async (code: string, password: string): Promise<boolean> => {
    if (!validatePassword(password)) {
      toast.error("Deve inserir uma password válida com pelo menos 5 caracteres");
      return false;
    }
    try {
      const salt = generateSalt();
      const hashedPassword = hashPassword(password, salt);
      const response = await fetch(`${API_BASE_URL}/User/SetPasswordByResetCode?code=${API_CODE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, password: hashedPassword, salt: salt })
      });
      if (!response.ok) {
        toast.error(response.status === 400 ? "Código inválido ou expirado" : `Erro ao alterar password`);
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
    <AuthContext.Provider value={{ isAuthenticated, username, userData, isInitialized, login, logout, checkAuth, checkEmail, validateToken, requestPasswordReset, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);