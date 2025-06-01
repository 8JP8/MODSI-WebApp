
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const VRRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();

  useEffect(() => {
    if (!roomCode) {
      console.error("No room code provided");
      return;
    }

    // Load the VR visualization HTML file in an iframe
    const iframe = document.getElementById('vr-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `/vr-visualization/index.html`;
    }
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

  return (
    <div className="h-screen w-screen">
      <iframe
        id="vr-iframe"
        src="/vr-visualization/index.html"
        className="w-full h-full border-0"
        title={`VR Visualization - Room ${roomCode}`}
      />
    </div>
  );
};

export default VRRoom;
