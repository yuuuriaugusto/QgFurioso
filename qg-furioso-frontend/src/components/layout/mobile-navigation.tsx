import { useLocation } from "wouter";
import { Home, Calendar, Play, FileText, User, Coins } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  // Determine if the current page is active
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        <a
          href="/"
          className={`flex flex-col items-center justify-center h-full w-full ${
            isActive("/") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Início</span>
        </a>
        <a
          href="/conteudo"
          className={`flex flex-col items-center justify-center h-full w-full ${
            isActive("/conteudo") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">Conteúdo</span>
        </a>
        <a
          href="/furia-coins"
          className={`flex flex-col items-center justify-center h-full w-full ${
            isActive("/furia-coins") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Coins className="h-5 w-5" />
          <span className="text-xs mt-1">Coins</span>
        </a>
        <a
          href="/ao-vivo"
          className={`flex flex-col items-center justify-center h-full w-full ${
            isActive("/ao-vivo") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            <Play className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          <span className="text-xs mt-1">Ao Vivo</span>
        </a>
        <a
          href="/meu-qg"
          className={`flex flex-col items-center justify-center h-full w-full ${
            isActive("/meu-qg") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Perfil</span>
        </a>
      </div>
    </div>
  );
}