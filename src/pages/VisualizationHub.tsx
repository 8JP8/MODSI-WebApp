
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, Layers, User } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [visualizationId, setVisualizationId] = useState("");

  const handleJoinVisualization = () => {
    if (!visualizationId.trim()) {
      toast.error("Please enter a visualization ID");
      return;
    }
    
    // In a real app, this would validate the ID against an API
    toast.success(`Joining visualization ${visualizationId}`);
    // Navigate to configurator with the visualization ID
    navigate(`/configurator?room=${visualizationId}`);
  };

  const navigateToConfigurator = () => {
    navigate("/configurator");
  };

  const navigateToUserVisualizations = () => {
    window.open("https://modsivr.pt", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-900/50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2 vr-gradient-text">
            VR Data Visualization Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Create, share, and explore data in virtual reality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Join Visualization */}
          <Card className="shadow-lg border border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Layers className="mr-2 h-5 w-5 text-primary" />
                Join Visualization
              </CardTitle>
              <CardDescription>
                Enter a visualization code to join an existing VR data experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Enter visualization code"
                  value={visualizationId}
                  onChange={(e) => setVisualizationId(e.target.value)}
                  className="text-base p-4"
                />
                <Button 
                  className="w-full text-base py-5" 
                  onClick={handleJoinVisualization}
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create Visualization */}
          <Card className="shadow-lg border border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Visualization Configurator
              </CardTitle>
              <CardDescription>
                Create and customize your own VR data visualization experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Design interactive VR visualizations with multiple chart types, 
                  position controls, and advanced settings.
                </p>
                <Button 
                  className="w-full text-base py-5" 
                  variant="outline"
                  onClick={navigateToConfigurator}
                >
                  Launch Configurator
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Visualizations */}
          <Card className="shadow-lg border border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                My Visualizations
              </CardTitle>
              <CardDescription>
                Access your saved VR data visualizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  View, manage and share your previously created VR data visualization experiences.
                </p>
                <Button 
                  className="w-full text-base py-5" 
                  variant="outline"
                  onClick={navigateToUserVisualizations}
                >
                  View My Visualizations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Built with A-Frame and BabiaXR for immersive data visualization experiences
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;