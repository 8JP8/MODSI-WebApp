
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const VRRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      console.error("No room code provided");
      setError("Código da sala não encontrado");
      setLoading(false);
      return;
    }

    console.log("Loading VR room with code:", roomCode);

    // First verify the room exists by calling the API
    fetch(`https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api/Room/Get/${roomCode}?code=z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Room not found: ${response.status}`);
        }
        return response.json();
      })
      .then(roomData => {
        console.log("Room data loaded successfully:", roomData);
        setLoading(false);
        
        // Load the VR visualization after confirming room exists
        setTimeout(() => {
          const iframe = document.getElementById('vr-iframe') as HTMLIFrameElement;
          if (iframe) {
            // Pass the room code in the URL hash so the VR visualization can access it
            iframe.src = `/vr-visualization/index.html#${roomCode}`;
            console.log("VR iframe src set to:", iframe.src);
          }
        }, 100);
      })
      .catch(error => {
        console.error("Error loading room:", error);
        setError("Sala não encontrada ou erro ao carregar dados");
        setLoading(false);
      });
  }, [roomCode]);

  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="text-muted-foreground">Código da sala não encontrado</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
          <p className="text-muted-foreground">A carregar visualização VR da sala {roomCode}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">Sala: {roomCode}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <iframe
        id="vr-iframe"
        className="w-full h-full border-0"
        title={`VR Visualization - Room ${roomCode}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

export default VRRoom;
