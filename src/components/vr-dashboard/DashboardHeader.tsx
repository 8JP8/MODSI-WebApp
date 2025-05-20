
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, LogOut, Play } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { HelpButton } from "@/components/HelpButton";

interface DashboardHeaderProps {
  onLaunch: () => void;
  configSaved: boolean;
  onSave?: () => void; // Make onSave optional
}

const DashboardHeader = ({ onLaunch, configSaved, onSave }: DashboardHeaderProps) => {
  const { logout, username, userData } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    toast.success("Sessão terminada com sucesso");
    navigate("/login");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <Link to="/visualization-hub">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="max-w-full">
          <h1 className="text-xl md:text-3xl font-bold vr-gradient-text truncate">
            Configurador de Visualização de Dados VR
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Configure a sua experiência de visualização de dados VR
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <HelpButton />
        </div>
        
        {!isMobile && (
          <Button variant="secondary" size={isMobile ? "sm" : "default"} onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Terminar Sessão
          </Button>
        )}
        
        <Button 
          className="vr-button" 
          size={isMobile ? "sm" : "default"}
          onClick={onLaunch} 
          disabled={!configSaved}
        >
          <Play className="mr-2 h-4 w-4" />
          {isMobile ? "Iniciar VR" : "Iniciar Experiência VR"}
        </Button>
        
        <div className="flex items-center gap-2 ml-2 border-l pl-3 border-gray-600">
          <Avatar>
            <AvatarImage src={userData?.photo || ""} />
            <AvatarFallback>{username ? username[0].toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground hidden md:inline">
            Ligado como <span className="font-medium text-foreground">{username || "Utilizador"}</span>
          </span>
        </div>
        
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-auto">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Terminar Sessão</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
