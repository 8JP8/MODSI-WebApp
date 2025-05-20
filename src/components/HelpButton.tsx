
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export function HelpButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Ajuda</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="vr-gradient-text">Sobre o MODSiVR</DialogTitle>
          <DialogDescription>
            Plataforma de Gestão e Visualização de Indicadores em Realidade Virtual
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            O MODSiVR é uma ferramenta avançada de visualização de dados e KPIs empresariais em realidade virtual 
            desenvolvida para análise de dados internos complexos para investidores e gestores.
          </p>
          <p className="text-sm text-muted-foreground">
            Esta plataforma permite a visualização interativa de indicadores-chave de desempenho em ambientes imersivos, 
            facilitando a tomada de decisões estratégicas através de uma melhor compreensão de dados complexos.
          </p>
          <p className="text-sm text-muted-foreground">
            Ideal para reuniões de investidores, análise financeira, monitorização de performance e apresentação 
            de resultados, o MODSiVR transforma dados em experiências visuais ricas e intuitivas.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
