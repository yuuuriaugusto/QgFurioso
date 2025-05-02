import { useLocation } from "wouter";
import { Home, BookOpen, Calendar, Play, ShoppingBag } from "lucide-react";
import { OptimizedLink } from "@/components/ui/optimized-link";

export default function BottomNav() {
  const [location] = useLocation();

  // Determine if the current page is active
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border md:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        <OptimizedLink
          href="/"
          className={`flex flex-col items-center justify-center ${
            isActive("/") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Início</span>
        </OptimizedLink>
        
        <OptimizedLink
          href="/conteudo"
          className={`flex flex-col items-center justify-center ${
            isActive("/conteudo") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">Conteúdo</span>
        </OptimizedLink>
        
        <OptimizedLink
          href="/agenda"
          className={`flex flex-col items-center justify-center ${
            isActive("/agenda") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Agenda</span>
        </OptimizedLink>
        
        <OptimizedLink
          href="/ao-vivo"
          className={`flex flex-col items-center justify-center ${
            isActive("/ao-vivo") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            <Play className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          <span className="text-xs mt-1">Ao Vivo</span>
        </OptimizedLink>
        
        <OptimizedLink
          href="/furia-coins"
          className={`flex flex-col items-center justify-center ${
            isActive("/furia-coins") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-xs mt-1">Coins</span>
        </OptimizedLink>
      </div>
    </div>
  );
}