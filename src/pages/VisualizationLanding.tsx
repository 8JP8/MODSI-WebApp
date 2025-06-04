
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, PieChart, LineChart, GanttChart } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { HelpButton } from '@/components/HelpButton';

interface VisualizationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  link: string;
}

const VisualizationCard = ({ title, description, icon, buttonText, link }: VisualizationCardProps) => (
  <Card className="flex flex-col">
    <CardHeader>
      <div className="flex items-center justify-between">
        {icon}
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-sm text-muted-foreground">
        Visualize os seus dados de forma imersiva utilizando técnicas avançadas de visualização VR.
      </p>
    </CardContent>
    <CardFooter>
      <Link to={link} className="w-full">
        <Button className="w-full vr-button">{buttonText}</Button>
      </Link>
    </CardFooter>
  </Card>
);

const VisualizationLanding = () => {
  const [recentVisualizations] = useState([
    {
      id: 'viz-1',
      title: 'Análise de Desempenho da Rede',
      type: 'Gráfico de barras',
      date: '12 de Maio, 2023',
      charts: 3
    },
    {
      id: 'viz-2',
      title: 'Comparação de Protocolos',
      type: 'Gráfico de dispersão',
      date: '5 de Maio, 2023',
      charts: 2
    }
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-border">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon" className="h-10 w-10 group">
              <ArrowLeft className="h-4 w-4 group-hover:rotate-12" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold vr-gradient-text">Visualizações de Dados VR</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <VisualizationCard 
            title="Visualização de Gráficos 3D"
            description="Configure e visualize gráficos em ambiente VR"
            icon={<BarChart3 className="h-8 w-8 text-primary" />}
            buttonText="Configurar Visualização"
            link="/configurator"
          />
          
          <VisualizationCard 
            title="Visualização de Redes"
            description="Analise topologias de rede em VR"
            icon={<GanttChart className="h-8 w-8 text-primary" />}
            buttonText="Ver Demonstração"
            link="/configurator"
          />
          
          <VisualizationCard 
            title="Análise de Séries Temporais"
            description="Visualize dados ao longo do tempo"
            icon={<LineChart className="h-8 w-8 text-primary" />}
            buttonText="Explorar"
            link="/configurator"
          />
          
          <VisualizationCard 
            title="Comparações Estatísticas"
            description="Compare estatísticas em ambiente imersivo"
            icon={<PieChart className="h-8 w-8 text-primary" />}
            buttonText="Analisar Dados"
            link="/configurator"
          />
        </div>
        
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Visualizações Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVisualizations.map(viz => (
              <Card key={viz.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle>{viz.title}</CardTitle>
                  <CardDescription>{viz.type} • {viz.date}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{viz.charts} gráficos</span>
                  <Button variant="ghost" size="sm">Abrir</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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

export default VisualizationLanding;
