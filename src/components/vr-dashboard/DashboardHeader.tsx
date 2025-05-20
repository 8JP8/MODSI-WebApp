
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, LogOut, Play } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  onLaunch: () => void;
  configSaved: boolean;
}

const DashboardHeader = ({ onLaunch, configSaved }: DashboardHeaderProps) => {
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Sessão terminada com sucesso");
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to="/visualization-hub">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold vr-gradient-text">Configurador de Visualização de Dados VR</h1>
          <p className="text-muted-foreground mt-2">
            Configure a sua experiência de visualização de dados VR
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Terminar Sessão
        </Button>
        <Button 
          className="vr-button" 
          onClick={onLaunch} 
          disabled={!configSaved}
        >
          <Play className="mr-2 h-4 w-4" />
          Iniciar Experiência VR
        </Button>
        <div className="flex items-center gap-2 ml-2 border-l pl-3 border-gray-600">
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1535268647677-300dbf3d78d1" />
            <AvatarFallback>{username ? username[0].toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground hidden md:inline">Ligado como <span className="font-medium text-foreground">{username || "Utilizador"}</span></span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
