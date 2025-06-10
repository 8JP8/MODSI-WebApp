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

  const logout = useCallback(() => {
    console.log('Logging out user and forcing redirect...');
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUsername(null);
    setUserData(null);
    // Use window.location.href for a hard redirect. This is the most reliable
    // way to handle a redirect from a background task like a timer, as it
    // clears all application state and ensures a clean start on the login page.
    window.location.href = "/login";
  }, []);

  const validateToken = useCallback(async (): Promise<boolean> => {
    const tokenData = localStorage.getItem("authToken");
    if (!tokenData) {
      // Don't trigger a full logout if there's no token to begin with.
      // This prevents redirect loops if this function is ever called on a public page.
      return false;
    }

    try {
      const parsedToken = JSON.parse(tokenData) as AuthTokenData;
      if (new Date().getTime() >= parsedToken.expiry) {
        console.log("Token expired locally. Logging out.");
        logout();
        return false;
      }

      console.log("Validating token with server...");
      const response = await fetch(
        `${API_BASE_URL}/User/CheckToken?code=${API_CODE}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${parsedToken.token}` }
        }
      );

      if (!response.ok) {
        console.error("Server validation failed, logging out:", response.status);
        logout();
        return false;
      }
      
      const data = await response.json();
      if (data?.IsValid === true) {
        console.log("Token validation successful.");
        return true;
      } else {
        console.log("Server reported token as invalid, logging out.");
        logout();
        return false;
      }
    } catch (error) {
      console.error("Error during token validation, logging out:", error);
      logout();
      return false;
    }
  }, [logout]);
  
  const checkAuth = useCallback(() => {
    const tokenData = localStorage.getItem("authToken");
    if (!tokenData) {
      setIsAuthenticated(false);
      return false;
    }
    try {
      const parsedToken = JSON.parse(tokenData) as AuthTokenData;
      if (new Date().getTime() >= parsedToken.expiry) {
        console.log('Token expired locally during initial check.');
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        return false;
      }
      setIsAuthenticated(true);
      setUsername(parsedToken.username);
      setUserData(parsedToken.userData);
      return true;
    } catch (error) {
      console.error("Error parsing auth token on initial check:", error);
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Effect 1: Initialize auth state on first application load.
  useEffect(() => {
    console.log('Initializing auth state...');
    checkAuth();
    setIsInitialized(true);
  }, [checkAuth]);
  
  // Effect 2: Manage periodic token validation when the user is authenticated.
  useEffect(() => {
    // This effect should only run if the context is initialized and the user is authenticated.
    if (!isInitialized || !isAuthenticated) {
      return; 
    }

    // This function will be called by the timers.
    const performValidation = async () => {
      console.log("Performing scheduled token validation...");
      const isValid = await validateToken();
      if (!isValid) {
        // The `logout` function, which is called inside `validateToken` on failure,
        // handles the redirect. We only need to show the toast message here.
        toast.error("Sessão expirada. Por favor, faça login novamente.");
      } else {
        console.log("Scheduled validation successful.");
      }
    };
    
    // 1. Initial check: 5 seconds after authentication is confirmed.
    console.log('User is authenticated. Setting up initial check in 5 seconds.');
    const initialCheckTimeoutId = setTimeout(performValidation, 5 * 1000); // 5 seconds
    
    // 2. Interval check: Every 15 minutes thereafter.
    console.log('Setting up recurring 15-minute check.');
    const intervalCheckId = setInterval(performValidation, 15 * 60 * 1000); // 15 minutes

    // **CRITICAL**: Cleanup function. This runs when the component unmounts
    // or when a dependency changes (e.g., user logs out, isAuthenticated becomes false).
    // It prevents memory leaks and multiple timers from running simultaneously.
    return () => {
      console.log('Cleaning up validation timers.');
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
        toast.error(loginResponse.status === 401 ? "Password incorreta" : `Erro no login: ${loginResponse.statusText}`);
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
          expiry: new Date().getTime() + 8 * 60 * 60 * 1000, // 8 hours
          username: userDetails.username || email,
          userData: userDetails
        };
        
        localStorage.setItem("authToken", JSON.stringify(tokenData));
        
        // Update React state to reflect the new authenticated status
        setIsAuthenticated(true);
        setUsername(userDetails.username || email);
        setUserData(userDetails);
        
        toast.success("Login efetuado com sucesso");
        // Return true to signal success to the LoginPage component.
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
  
  // --- HELPER & UTILITY FUNCTIONS ---

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
    if (!validateEmail(email)) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/User/EmailExists?email=${encodeURIComponent(email)}&code=${API_CODE}`);
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();
      return data.Exists === true;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const getSaltForUser = async (email: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/GetUserSalt?identifier=${encodeURIComponent(email)}&code=${API_CODE}`);
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();
      return data.Salt || null;
    } catch (error) {
      console.error("Error getting salt:", error);
      return null;
    }
  };

  const getUserDetails = async (email: string, token: string): Promise<UserData | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/GetByEmail?email=${encodeURIComponent(email)}&code=${API_CODE}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
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
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      toast.success("Email de recuperação de password enviado com sucesso");
      return true;
    } catch (error) {
      console.error("Error requesting password reset:", error);
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


  // --- PROVIDER VALUE & RENDER ---
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      username, 
      userData,
      isInitialized,
      login, 
      logout, 
      checkAuth,
      checkEmail,
      validateToken,
      requestPasswordReset,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- CUSTOM HOOK ---
export const useAuth = () => useContext(AuthContext);