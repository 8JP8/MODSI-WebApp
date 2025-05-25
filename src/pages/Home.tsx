
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Settings } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { HelpButton } from '@/components/HelpButton';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-border">
        <h1 className="text-2xl font-bold vr-gradient-text">MODSIVR</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 vr-gradient-text">
            Bem-vindo ao MODSIVR
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Sistema integrado de visualização de dados em Realidade Virtual para análise imersiva de dados empresariais
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Dashboard Card */}
          <Card className="text-center hover:border-primary transition-colors">
            <CardHeader>
              <Settings className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Painel de Gestão</CardTitle>
              <CardDescription>
                Aceda ao painel de gestão para configurar e monitorizar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gerencie utilizadores, configurações do sistema e visualize estatísticas de utilização
              </p>
              <Link to="/dashboard">
                <Button className="w-full vr-button">
                  Aceder ao Painel de Gestão
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* VR Visualization Card */}
          <Card className="text-center hover:border-primary transition-colors">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Visualizações VR</CardTitle>
              <CardDescription>
                Configure e execute visualizações de dados em Realidade Virtual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Crie experiências imersivas de visualização de dados utilizando tecnologia VR avançada
              </p>
              <Link to="/visualization-hub">
                <Button className="w-full vr-button">
                  Explorar Visualizações
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto py-6 px-4 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <HelpButton />
          </div>
          <a href="https://isep.ipp.pt" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img 
              src="https://www.isep.ipp.pt/images/ISEP_marca_cor.png" 
              alt="ISEP Logo" 
              className="h-8"
            />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
