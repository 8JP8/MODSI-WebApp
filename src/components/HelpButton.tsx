
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
            Plataforma de Modelação e Simulação Interativa em VR para Treino em Redes de Comunicação
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            O MODSiVR é uma plataforma de visualização de dados em realidade virtual desenvolvida
            no Instituto Superior de Engenharia do Porto (ISEP).
          </p>
          <p className="text-sm text-muted-foreground">
            Esta ferramenta permite a visualização interativa de dados de redes de comunicação
            em ambientes imersivos, facilitando a análise e compreensão de dados complexos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
