import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Menu, X, Bell, LogOut, Coins, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Interface para notificações
interface Notification {
  id: string;
  type: 'info' | 'survey' | 'coin' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'survey',
      title: 'Nova pesquisa disponível',
      message: 'Participe da nossa nova pesquisa e ganhe FURIA Coins!',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'coin',
      title: 'Moedas recebidas!',
      message: 'Você recebeu 50 FURIA Coins pela sua participação na pesquisa anterior.',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    }
  ]);
  
  // Buscar saldo de moedas do usuário
  const { data: coinBalance, isLoading: isLoadingCoins } = useQuery({
    queryKey: ['/api/users/me/coin-balance'],
    queryFn: async () => {
      if (!user) return null;
      try {
        const response = await fetch('/api/users/me/coin-balance');
        if (!response.ok) throw new Error('Erro ao buscar saldo de moedas');
        return await response.json();
      } catch (error) {
        console.error('Erro ao carregar saldo de moedas:', error);
        return null;
      }
    },
    enabled: !!user
  });
  
  // Marcar uma notificação como lida
  const markNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  };
  
  // Marcar todas notificações como lidas
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(n => ({ ...n, read: true }))
    );
  };
  
  // Contagem de notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;



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
              {/* FURIA Coins button */}
              <Link href="/furia-coins" className="p-2 hover:bg-muted flex items-center gap-1 rounded-full">
                <Coins className="h-5 w-5 text-primary" />
                {!isLoadingCoins ? (
                  <span className="font-medium text-sm">
                    {coinBalance?.balance || (user?.coinBalance?.balance || 0)}
                  </span>
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </Link>

              {/* Notification button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-muted relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="h-4 w-4 p-0 flex items-center justify-center absolute -top-0.5 -right-0.5"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <div className="flex justify-between items-center mb-2 px-2 pt-2">
                    <h4 className="font-medium">Notificações</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto px-2 pb-2">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`mb-2 p-2 rounded-md border ${notification.read ? 'bg-card' : 'bg-muted border-border'}`}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium text-sm flex items-center gap-1">
                              {notification.type === 'info' && <Bell className="h-3 w-3" />}
                              {notification.type === 'survey' && <Bell className="h-3 w-3 text-primary" />}
                              {notification.type === 'coin' && <Coins className="h-3 w-3 text-primary" />}
                              {notification.type === 'warning' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                              {notification.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-xs mt-1">{notification.message}</p>
                          {!notification.read && (
                            <button 
                              onClick={() => markNotificationAsRead(notification.id)}
                              className="text-xs text-primary mt-1"
                            >
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>Sem notificações no momento</p>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile?.avatarUrl || undefined} />
                    <AvatarFallback>
                      {user.profile?.firstName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden lg:inline-block">
                    {user.profile?.firstName || user.username}
                  </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{user.profile?.firstName} {user.profile?.lastName}</div>
                    <div className="text-muted-foreground text-xs truncate">{user.username}</div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/meu-qg" className="w-full cursor-pointer">
                      Meu perfil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/furia-coins" className="w-full cursor-pointer">
                      <Coins className="h-4 w-4 mr-2" />
                      FURIA Coins
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/pesquisas" className="w-full cursor-pointer">
                      <Bell className="h-4 w-4 mr-2" />
                      Pesquisas
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/configuracoes" className="w-full cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
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

          {/* Mobile notification button */}
          <div className="md:hidden flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-full hover:bg-muted relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="h-4 w-4 p-0 flex items-center justify-center absolute -top-0.5 -right-0.5"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex justify-between items-center mb-2 px-3 pt-3">
                  <h4 className="font-medium">Notificações</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
                
                <div className="max-h-[300px] overflow-y-auto px-3 pb-3">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`mb-2 p-2 rounded-md border ${notification.read ? 'bg-card' : 'bg-muted border-border'}`}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-sm flex items-center gap-1">
                            {notification.type === 'info' && <Bell className="h-3 w-3" />}
                            {notification.type === 'survey' && <Bell className="h-3 w-3 text-primary" />}
                            {notification.type === 'coin' && <Coins className="h-3 w-3 text-primary" />}
                            {notification.type === 'warning' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                            {notification.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-xs mt-1">{notification.message}</p>
                        {!notification.read && (
                          <button 
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="text-xs text-primary mt-1"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Sem notificações no momento</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>


    </header>
  );
}