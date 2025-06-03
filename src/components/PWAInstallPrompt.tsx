
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const webkitStandalone = (window.navigator as any).standalone === true;
      const isInWebAppMode = standalone || webkitStandalone;
      setIsStandalone(isInWebAppMode);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt only if not already installed and not dismissed in this session
      if (!isStandalone && sessionStorage.getItem('pwa-prompt-dismissed') !== 'true') {
        setTimeout(() => {
          setShowPrompt(true);
          setTimeout(() => setIsAnimating(true), 100);
        }, 2000); // Delay prompt by 2 seconds for better UX
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
    };
  }, [isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    handleDismiss();
  };

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowPrompt(false);
    }, 300);
    
    // Store in session storage to avoid showing again in current session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt || isStandalone) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-xs bg-background border border-border rounded-lg shadow-lg p-3 z-50 transition-all duration-300 ease-out ${
      isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Instalar App</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-5 w-5 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">
        Instale o MODSI VR para acesso rápido e melhor experiência.
      </p>
      
      <div className="flex gap-2">
        <Button onClick={handleInstall} size="sm" className="flex-1 text-xs h-8">
          <Download className="h-3 w-3 mr-1" />
          Instalar
        </Button>
        <Button variant="outline" onClick={handleDismiss} size="sm" className="text-xs h-8">
          Mais tarde
        </Button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
