import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import forge from "node-forge";
import { useNavigate } from "react-router-dom"; // Import useNavigate for programmatic navigation

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
  logout: (options?: { navigate?: boolean }) => void; // Allow disabling navigation on logout
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
  isInitialized: false,
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
  // Use a stable navigate function from a wrapper component
  const navigate = useNavigate();

  const logout = useCallback((options?: { navigate?: boolean }) => {
    const { navigate: shouldNavigate = true } = options || {};

    console.log('Logging out user...');
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUsername(null);
    setUserData(null);
    if (shouldNavigate) {
      console.log('Redirecting to /login');
      // Use window.location.href for a full page reload to clear all state
      window.location.href = "/login"; 
    }
  }, []);
  
  const validateToken = useCallback(async (): Promise<boolean> => {
    const tokenData = localStorage.getItem("authToken");

    if (!tokenData) {
      console.log("No token found in localStorage for validation");
      return false;
    }

    try {
      const parsedToken = JSON.parse(tokenData) as AuthTokenData;

      if (new Date().getTime() >= parsedToken.expiry) {
        console.log("Token expired locally");
        logout();
        return false;
      }

      console.log("Validating token with server...");
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
  }, [logout]);

  const checkAuth = useCallback((): boolean => {
    const tokenData = localStorage.getItem("authToken");

    if (!tokenData) {
      if(isAuthenticated) logout({ navigate: false }); // clear state if it's somehow out of sync
      return false;
    }

    try {
      const parsedToken = JSON.parse(tokenData) as AuthTokenData;
      const isValid = new Date().getTime() < parsedToken.expiry;

      if (!isValid) {
        console.log('Token expired locally during checkAuth');
        logout({ navigate: false }); // Don't navigate here, let components decide
        return false;
      }

      setIsAuthenticated(true);
      setUsername(parsedToken.username);
      setUserData(parsedToken.userData);
      return true;
    } catch (error) {
      console.error("Error parsing auth token:", error);
      logout({ navigate: false });
      return false;
    }
  }, [logout, isAuthenticated]);
  
  // Initialize auth state on component mount
  useEffect(() => {
    console.log('Initializing auth state...');
    checkAuth();
    setIsInitialized(true);
  }, [checkAuth]);
  
  // *** NEW: EFFECT FOR PERIODIC TOKEN VALIDATION ***
  useEffect(() => {
    // Do nothing if not initialized or not authenticated
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    console.log('User is authenticated, setting up validation timers.');

    // Function to perform the check
    const performValidation = async () => {
      console.log("Performing scheduled token validation...");
      const isValid = await validateToken();
      if (!isValid) {
        console.log("Scheduled validation failed, user has been logged out.");
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        // The logout() function inside validateToken will handle the redirect.
      } else {
        console.log("Scheduled validation successful.");
      }
    };
    
    // 1. Initial check 5 seconds after authentication is confirmed
    const initialCheckTimeoutId = setTimeout(performValidation, 5 * 1000); // 5 seconds
    
    // 2. Then, set up checks every 15 minutes
    const intervalCheckId = setInterval(performValidation, 15 * 60 * 1000); // 15 minutes

    // Cleanup function to clear timers when the user logs out or component unmounts
    return () => {
      console.log('Clearing validation timers.');
      clearTimeout(initialCheckTimeoutId);
      clearInterval(intervalCheckId);
    };
    
  }, [isInitialized, isAuthenticated, validateToken]);

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
          expiry: new Date().getTime() + 8 * 60 * 60 * 1000,
          username: userDetails.username || email,
          userData: userDetails
        };

        localStorage.setItem("authToken", JSON.stringify(tokenData));
        setIsAuthenticated(true);
        setUsername(userDetails.username || email);
        setUserData(userDetails);

        toast.success("Login efetuado com sucesso");
        // Navigate to dashboard on successful login
        navigate('/configurator'); 
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

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    if (!validateEmail(email)) {
      toast.error("Formato de email inválido");
      return false;
    }

    try {
      const emailExists = await checkEmail(email);
      if (!emailExists) {
        toast.error("Email não registado no sistema");
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/User/RequestPasswordReset?code=${API_CODE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email })
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
  
  const generateSalt = (): string => {
    const randomBytes = forge.random.getBytesSync(16);
    return forge.util.encode64(randomBytes);
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
        body: JSON.stringify({ code, password: hashedPassword, salt })
      });

      if (!response.ok) {
        toast.error(response.status === 400 ? "Código inválido ou expirado" : `Erro ao alterar password: ${response.statusText}`);
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

export const useAuth = () => useContext(AuthContext);

// A simple wrapper to provide the navigate function to the context
// This should wrap your AuthProvider in your App.tsx or main entry file.
// Example:
// <BrowserRouter>
//   <AuthProviderWithNavigation>
//     <App />
//   </AuthProviderWithNavigation>
// </BrowserRouter>
export const AuthProviderWithNavigation = ({ children }: { children: ReactNode }) => {
  return (
      <AuthProvider>{children}</AuthProvider>
  );
};