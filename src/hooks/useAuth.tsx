
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  
  useEffect(() => {
    checkAuth();
  }, []);

  // Validate token with server
  const validateToken = async (): Promise<boolean> => {
    const tokenData = localStorage.getItem("authToken");
    
    if (!tokenData) {
      return false;
    }
    
    try {
      const parsedToken = JSON.parse(tokenData) as AuthTokenData;
      
      // Check if token is expired locally first
      if (new Date().getTime() >= parsedToken.expiry) {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUsername(null);
        setUserData(null);
        return false;
      }
      
      // Validate token with server
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
        console.error("Token validation failed:", response.statusText);
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUsername(null);
        setUserData(null);
        return false;
      }
      
      const data = await response.json();
      
      if (data && data.IsValid === true) {
        setIsAuthenticated(true);
        setUsername(parsedToken.username);
        setUserData(parsedToken.userData);
        return true;
      } else {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUsername(null);
        setUserData(null);
        return false;
      }
    } catch (error) {
      console.error("Error validating token:", error);
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      setUsername(null);
      setUserData(null);
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
    // Reset state
    setIsAuthenticated(false);
    setUsername(null);
    setUserData(null);
    
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
      
      // Get user details first to store
      const userDetails = await getUserDetails(email);
      if (!userDetails) {
        toast.error("Não foi possível obter os detalhes do utilizador");
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
        // Store token with expiry (1 hour)
        const tokenData: AuthTokenData = {
          token: loginData.Token,
          expiry: new Date().getTime() + 60 * 60 * 1000, // 1 hour
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
      const isValid = new Date().getTime() < parsedToken.expiry;
      
      if (!isValid) {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUsername(null);
        setUserData(null);
        return false;
      }
      
      setIsAuthenticated(true);
      setUsername(parsedToken.username);
      setUserData(parsedToken.userData);
      return true;
    } catch (error) {
      console.error("Error parsing auth token:", error);
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
      setUsername(null);
      setUserData(null);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUsername(null);
    setUserData(null);
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
