import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  checkEmail: (email: string) => Promise<boolean>;
  validateToken: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (code: string, password: string) => Promise<boolean>;
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
  resetPassword: () => Promise.resolve(false)
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const periodicValidationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memoized logout function to prevent recreation on every render
  const logout = useCallback(() => {
    console.log('Logging out user');
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUsername(null);
    setUserData(null);
    
    // Clear periodic validation
    if (periodicValidationRef.current) {
      clearInterval(periodicValidationRef.current);
      periodicValidationRef.current = null;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    console.log('Initializing auth state...');
    const hasToken = checkAuth();
    setIsInitialized(true);
    
    // Set up periodic validation only if we have a token
    if (hasToken) {
      setupPeriodicValidation();
    }
  }, []);

  // Setup periodic validation
  const setupPeriodicValidation = useCallback(() => {
    // Clear existing interval if any
    if (periodicValidationRef.current) {
      clearInterval(periodicValidationRef.current);
    }

    console.log('Setting up periodic token validation');
    periodicValidationRef.current = setInterval(async () => {
      console.log("Performing periodic token validation...");
      
      // Double check we still have a token before validating
      const tokenData = localStorage.getItem("authToken");
      if (!tokenData) {
        console.log("No token found during periodic check");
        logout();
        return;
      }
      
      const isValid = await validateToken();
      if (!isValid) {
        console.log("Periodic validation failed, logging out");
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        logout();
        // Force redirect to login
        window.location.href = "/login";
      } else {
        console.log("Periodic validation successful");
      }
    }, 30 * 60 * 1000); // 30 minutes
  }, [logout]);

  // Validate token with server
  const validateToken = async (): Promise<boolean> => {
    const tokenData = localStorage.getItem("authToken");
    
    if (!tokenData) {
      console.log("No token found in localStorage for validation");
      return false;
    }
    
    try {
      const parsedToken = JSON.parse(tokenData) as AuthTokenData;
      
      // Check if token is expired locally first
      if (new Date().getTime() >= parsedToken.expiry) {
        console.log("Token expired locally");
        logout();
        return false;
      }
      
      console.log("Validating token with server...");
      // Validate token with server - use Bearer authorization header
      const response = await fetch(
        `${API_BASE_URL}/User/CheckToken?code=${API_CODE}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${parsedToken.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error("Token validation failed:", response.status, response.statusText);
        logout();
        return false;
      }
      
      const data = await response.json();
      console.log("Server validation response:", data);
      
      if (data && data.IsValid === true) {
        console.log("Token validation successful");
        // Update local state to ensure consistency
        setIsAuthenticated(true);
        setUsername(parsedToken.username);
        setUserData(parsedToken.userData);
        return true;
      } else {
        console.log("Server reported token as invalid");
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
  
  // Get user details from API using token
  const getUserDetails = async (email: string, token: string): Promise<UserData | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/User/GetByEmail?email=${encodeURIComponent(email)}&code=${API_CODE}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
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
    console.log('Starting login process for:', email);
    
    // Validate input
    if (!validateEmail(email)) {
      toast.error("Formato de email inválido");
      return false;
    }
    
    if (!validatePassword(password)) {
      toast.error("A password deve ter pelo menos 5 caracteres");
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
        // Now get user details using the received token
        const userDetails = await getUserDetails(email, loginData.Token);
        if (!userDetails) {
          toast.error("Não foi possível obter os detalhes do utilizador");
          return false;
        }
        
        // Store token with expiry (8 hours)
        const tokenData: AuthTokenData = {
          token: loginData.Token,
          expiry: new Date().getTime() + 8 * 60 * 60 * 1000, // 8 hours
          username: userDetails.username || email,
          userData: userDetails
        };
        
        console.log('Storing authentication token in localStorage');
        localStorage.setItem("authToken", JSON.stringify(tokenData));
        
        // Update state immediately after storing token
        setIsAuthenticated(true);
        setUsername(userDetails.username || email);
        setUserData(userDetails);
        
        // Setup periodic validation after successful login
        setupPeriodicValidation();
        
        console.log('Login successful, user authenticated');
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

  const checkAuth = (): boolean => {
    const tokenData = localStorage.getItem("authToken");
    
    if (!tokenData) {
      setIsAuthenticated(false);
      setUsername(null);
      setUserData(null);
      return false;
    }
    
    try {
      const parsedToken = JSON.parse(tokenData) as AuthTokenData;
      
      // Only check local expiry - don't validate with server on every check
      const isValid = new Date().getTime() < parsedToken.expiry;
      
      if (!isValid) {
        console.log('Token expired locally');
        logout();
        return false;
      }
      
      // Update state if token is valid
      setIsAuthenticated(true);
      setUsername(parsedToken.username);
      setUserData(parsedToken.userData);
      return true;
    } catch (error) {
      console.error("Error parsing auth token:", error);
      logout();
      return false;
    }
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (periodicValidationRef.current) {
        clearInterval(periodicValidationRef.current);
      }
    };
  }, []);

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
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);