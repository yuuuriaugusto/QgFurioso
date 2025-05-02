import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Menu, X, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsManager } from "@/components/ui/notifications";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Determine if the current page is active
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary font-rajdhani">QG FURIOSO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              Início
            </Link>
            <Link 
              href="/conteudo" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/conteudo") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              Conteúdo
            </Link>
            <Link 
              href="/agenda" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/agenda") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              Agenda
            </Link>
            <Link 
              href="/ao-vivo" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/ao-vivo") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              Ao Vivo
              {/* Live indicator dot */}
              <span className="relative inline-flex ml-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </span>
            </Link>
            <Link 
              href="/furia-coins" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/furia-coins") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              FURIA Coins
            </Link>
          </nav>

          {/* User menu (desktop) */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Notification component */}
              <NotificationsManager />

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {user.profile?.avatarUrl ? (
                      <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold">
                        {user.profile?.firstName?.charAt(0) || user.primaryIdentity.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden lg:inline-block">
                    {user.profile?.firstName || user.primaryIdentity}
                  </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{user.profile?.firstName} {user.profile?.lastName}</div>
                    <div className="text-muted-foreground text-xs truncate">{user.primaryIdentity}</div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/meu-qg" className="w-full cursor-pointer">
                      Meu perfil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/pesquisas" className="w-full cursor-pointer">
                      Pesquisas
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/configuracoes" className="w-full cursor-pointer">
                      Configurações
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem 
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-2" />
                    )}
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user.coinBalance && (
                <div className="hidden lg:flex items-center space-x-1 bg-muted rounded-full py-1 px-3">
                  <span className="font-medium text-sm">{user.coinBalance.balance}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:block">
              <Link 
                href="/auth"
                className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
              >
                Entrar
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-foreground p-2 rounded-md hover:bg-muted"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="container mx-auto px-4 py-2">
            <div className="text-center mb-3">
              <h3 className="font-bold text-primary">Menu Rápido</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Navegação principal disponível na barra inferior
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              <Link 
                href="/pesquisas"
                className="px-4 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary/80 flex items-center gap-1"
                onClick={closeMenu}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18"></path>
                  <path d="M18.4 7.79a9.986 9.986 0 0 0-8.61-3.57 10.024 10.024 0 0 0-7.58 5.28A10 10 0 0 0 3.35 19.4"></path>
                  <path d="m7 10 5 5"></path>
                  <path d="m12 15 5-5"></path>
                </svg>
                Pesquisas
              </Link>
              
              <div 
                className="px-4 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary/80 flex items-center gap-1"
                onClick={closeMenu}
              >
                <NotificationsManager />
              </div>
              
              <Link 
                href="/configuracoes"
                className="px-4 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary/80 flex items-center gap-1"
                onClick={closeMenu}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Ajustes
              </Link>
            </div>

            {user ? (
              <>
                <div className="pt-4 pb-3 border-t border-border">
                  <div className="flex items-center px-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user.profile?.avatarUrl ? (
                          <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-semibold">
                            {user.profile?.firstName?.charAt(0) || user.primaryIdentity.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium">
                        {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : user.primaryIdentity}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.primaryIdentity}</div>
                    </div>
                    {user.coinBalance && (
                      <div className="ml-auto flex items-center space-x-1 bg-muted rounded-full py-1 px-3">
                        <span className="font-medium text-sm">{user.coinBalance.balance}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v12" />
                          <path d="M8 12h8" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    <Link 
                      href="/meu-qg"
                      className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
                      onClick={closeMenu}
                    >
                      Meu perfil
                    </Link>
                    <Link 
                      href="/pesquisas"
                      className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
                      onClick={closeMenu}
                    >
                      Pesquisas
                    </Link>
                    <Link 
                      href="/configuracoes"
                      className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
                      onClick={closeMenu}
                    >
                      Configurações
                    </Link>
                    <button
                      className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-muted"
                      onClick={() => {
                        closeMenu();
                        handleLogout();
                      }}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-4 pb-3 border-t border-border">
                <Link 
                  href="/auth"
                  className="block w-full text-center bg-primary text-white px-4 py-2 rounded-md text-base font-medium hover:bg-primary/90"
                  onClick={closeMenu}
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}