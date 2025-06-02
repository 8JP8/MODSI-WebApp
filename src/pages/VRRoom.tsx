
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const VRRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomVerified, setRoomVerified] = useState(false);

  useEffect(() => {
    if (!roomCode) {
      console.error("No room code provided");
      setError("Código da sala não encontrado");
      setLoading(false);
      return;
    }

    console.log("Verifying VR room with code:", roomCode);

    // Verify the room exists by calling the API
    fetch(`https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api/Room/Get/${roomCode}?code=z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Room not found: ${response.status}`);
        }
        return response.json();
      })
      .then(roomData => {
        console.log("Room data verified successfully:", roomData);
        setRoomVerified(true);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error verifying room:", error);
        setError("Sala não encontrada ou erro ao carregar dados");
        setLoading(false);
      });
  }, [roomCode]);

  const handleIframeLoad = () => {
    console.log("VR iframe loaded successfully");
  };

  const handleIframeError = () => {
    console.error("Error loading VR iframe");
    setError("Erro ao carregar visualização VR");
  };

  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Erro</h1>
          <p className="text-muted-foreground">Código da sala não encontrado</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verificando Sala VR</h1>
          <p className="text-muted-foreground">A verificar sala {roomCode}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Erro</h1>
          <p className="text-muted-foreground mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Sala: {roomCode}</p>
          <button 
            onClick={() => window.location.href = '/configurator'}
            className="mt-4 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            Voltar ao Configurador
          </button>
        </div>
      </div>
    );
  }

  if (roomVerified) {
    return (
      <div className="h-screen w-screen bg-background relative">
        <iframe
          src={`https://modsi-vr.pt/${roomCode}`}
          className="w-full h-full border-0"
          title={`VR Visualization - Room ${roomCode}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    );
  }

  return null;
};

export default VRRoom;
