import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, Smartphone, Share, PlusSquare, MoreVertical, 
  Check, Wifi, WifiOff, Bell, Zap 
} from 'lucide-react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

export default function Instalar() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <ModuleHeader 
        title="Instalar App" 
        subtitle="Tenha o Manual sempre à mão"
        icon={Download}
        gradientClass="gradient-primary"
      />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Status */}
        <div className="flex gap-3 mb-6">
          <Badge variant={isOnline ? 'default' : 'secondary'} className="flex items-center gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {isInstalled && (
            <Badge variant="default" className="bg-success flex items-center gap-1">
              <Check className="h-3 w-3" /> Instalado
            </Badge>
          )}
        </div>

        {isInstalled ? (
          <Card className="p-6 text-center border-success/50 bg-success/5">
            <Check className="h-16 w-16 mx-auto text-success mb-4" />
            <h2 className="text-xl font-bold mb-2">App Instalado!</h2>
            <p className="text-muted-foreground">
              O Manual da Mulher Independente está instalado no seu dispositivo. 
              Você pode acessá-lo pela tela inicial.
            </p>
          </Card>
        ) : (
          <>
            {/* Benefits */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Por que instalar?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Acesso Rápido</h4>
                    <p className="text-sm text-muted-foreground">
                      Abra o app direto da tela inicial, como qualquer outro app
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <WifiOff className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Funciona Offline</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesse suas notas, listas e lembretes mesmo sem internet
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Notificações</h4>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes de medicamentos, água e tarefas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Install Instructions */}
            {deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full mb-6" size="lg">
                <Download className="h-5 w-5 mr-2" /> Instalar Agora
              </Button>
            ) : isIOS ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Como instalar no iPhone/iPad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Toque no ícone de Compartilhar</p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Share className="h-5 w-5" />
                        <span className="text-sm">Na barra inferior do Safari</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Role e toque em "Adicionar à Tela de Início"</p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <PlusSquare className="h-5 w-5" />
                        <span className="text-sm">Na lista de opções</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Confirme tocando em "Adicionar"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        O app será adicionado à sua tela inicial
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Como instalar no Android</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Toque no menu do navegador</p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <MoreVertical className="h-5 w-5" />
                        <span className="text-sm">Os três pontinhos no canto superior</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Toque em "Instalar aplicativo" ou "Adicionar à tela inicial"</p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Download className="h-5 w-5" />
                        <span className="text-sm">Na lista de opções</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Confirme a instalação</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        O app será instalado e aparecerá na sua tela inicial
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Offline indicator */}
        {!isOnline && (
          <Card className="p-4 bg-warning/10 border-warning/50">
            <div className="flex gap-3 items-center">
              <WifiOff className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-warning-foreground">Você está offline</p>
                <p className="text-sm text-muted-foreground">
                  Algumas funcionalidades podem estar limitadas
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
