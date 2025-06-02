
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Search, Zap } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const NotFound = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 dark:from-background dark:to-slate-900/50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse ${
          theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-400/20'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
          theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-2xl animate-pulse delay-500 ${
          theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-400/20'
        }`}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full animate-pulse ${
              theme === 'dark' ? 'bg-white/20' : 'bg-slate-600/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className={`text-center space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* VR-themed 404 */}
          <div className="relative">
            <div className={`text-8xl md:text-9xl font-bold text-transparent bg-clip-text animate-pulse ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400'
                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600'
            }`}>
              404
            </div>
            <div className={`absolute inset-0 text-8xl md:text-9xl font-bold blur-sm ${
              theme === 'dark' ? 'text-blue-500/20' : 'text-blue-600/20'
            }`}>
              404
            </div>
          </div>

          {/* VR Headset Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`w-24 h-16 rounded-xl relative animate-bounce ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                <div className="absolute top-3 left-3 w-4 h-4 bg-white/30 rounded-full"></div>
                <div className="absolute top-3 right-3 w-4 h-4 bg-white/30 rounded-full"></div>
                <div className={`absolute -left-2 top-1/2 transform -translate-y-1/2 w-6 h-8 rounded-l-full ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-gradient-to-r from-blue-700 to-purple-700'
                }`}></div>
                <div className={`absolute -right-2 top-1/2 transform -translate-y-1/2 w-6 h-8 rounded-r-full ${
                  theme === 'dark'
                    ? 'bg-gradient-to-l from-blue-600 to-purple-600'
                    : 'bg-gradient-to-l from-blue-700 to-purple-700'
                }`}></div>
              </div>
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-8 ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-purple-500 to-transparent'
                  : 'bg-gradient-to-b from-purple-600 to-transparent'
              }`}></div>
            </div>
          </div>

          {/* Error message */}
          <div className="space-y-4">
            <h1 className={`text-3xl md:text-4xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Página Não Encontrada
            </h1>
            <p className={`text-lg md:text-xl max-w-md mx-auto ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>
              Parece que esta página não existe no sistema
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
            }`}>
              Rota: <code className={`px-2 py-1 rounded ${
                theme === 'dark' ? 'bg-white/10' : 'bg-slate-800/10'
              }`}>{location.pathname}</code>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => handleNavigate('/')}
              className="group flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 hover:shadow-blue-500/25"
            >
              <Home className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
              Voltar ao Início
            </button>
            
            <button
              onClick={() => handleNavigate('/configurator')}
              className="group flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 hover:shadow-purple-500/25"
            >
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
              Configurador VR
            </button>
          </div>

          {/* Footer */}
          <div className="pt-8 text-center">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-500' : 'text-slate-500'
            }`}>
              Se este erro persistir, contacte o suporte técnico
            </p>
          </div>
        </div>
      </div>

      {/* Glitch effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 transform skew-x-12 animate-pulse opacity-30 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-transparent via-white/5 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-600/10 to-transparent'
        }`}></div>
      </div>
    </div>
  );
};

export default NotFound;
