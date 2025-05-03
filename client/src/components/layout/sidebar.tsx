import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { User, BarChart2, ShoppingBag, Calendar, Play, FileText, Settings } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Determine if the current page is active
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="hidden md:block w-56 shrink-0">
      <div className="sticky top-20 space-y-4">
        {/* User Card (if logged in) */}
        {user && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-3">
                {user.profile?.avatarUrl ? (
                  <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold">
                    {user.profile?.firstName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="font-semibold">{user.profile?.firstName || "Membro"}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[120px]">{user.username}</div>
              </div>
            </div>
            {user.coinBalance && (
              <div className="bg-muted rounded-lg p-2 text-center">
                <div className="text-xs text-muted-foreground mb-1">Saldo de FURIA Coins</div>
                <div className="font-semibold flex items-center justify-center">
                  {user.coinBalance.balance}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="bg-card rounded-xl overflow-hidden border border-border">
          <ul>
            <li>
              <a 
                href="/" 
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActive("/") ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted"
                }`}
              >
                <BarChart2 className="h-5 w-5 mr-3" />
                Dashboard
              </a>
            </li>
            <li>
              <a 
                href="/meu-qg" 
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActive("/meu-qg") ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted"
                }`}
              >
                <User className="h-5 w-5 mr-3" />
                Meu Perfil
              </a>
            </li>
            <li>
              <a 
                href="/furia-coins" 
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActive("/furia-coins") ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted"
                }`}
              >
                <ShoppingBag className="h-5 w-5 mr-3" />
                FURIA Coins
              </a>
            </li>
            <li>
              <a 
                href="/conteudo" 
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActive("/conteudo") ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted"
                }`}
              >
                <FileText className="h-5 w-5 mr-3" />
                Conteúdo
              </a>
            </li>
            <li>
              <a 
                href="/agenda" 
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActive("/agenda") ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted"
                }`}
              >
                <Calendar className="h-5 w-5 mr-3" />
                Agenda
              </a>
            </li>
            <li>
              <a 
                href="/ao-vivo" 
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActive("/ao-vivo") ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted"
                }`}
              >
                <Play className="h-5 w-5 mr-3" />
                Ao Vivo
                <span className="ml-auto relative">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </span>
              </a>
            </li>
            <li>
              <a 
                href="/configuracoes" 
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActive("/configuracoes") ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted"
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Configurações
              </a>
            </li>
          </ul>
        </nav>

        {/* App Version */}
        <div className="text-xs text-muted-foreground text-center">
          QG FURIOSO v1.0.0
        </div>
      </div>
    </aside>
  );
}