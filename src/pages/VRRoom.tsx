
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold text-red-400">Erro</h1>
          <p className="text-blue-200">Código da sala não encontrado</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <div className="text-center text-white">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verificando Sala VR</h1>
          <p className="text-blue-200">A verificar sala {roomCode}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro</h1>
          <p className="text-blue-200 mb-2">{error}</p>
          <p className="text-sm text-gray-400">Sala: {roomCode}</p>
          <button 
            onClick={() => window.location.href = '/configurator'}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Voltar ao Configurador
          </button>
        </div>
      </div>
    );
  }

  if (roomVerified) {
    return (
      <div className="h-screen w-screen bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black opacity-20 z-10 pointer-events-none"></div>
        <iframe
          src={`https://modsi-vr.pt?room=${roomCode}`}
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
