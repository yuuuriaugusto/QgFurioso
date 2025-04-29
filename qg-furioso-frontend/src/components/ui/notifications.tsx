import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebSocketEvent } from '@/contexts/websocket-provider';
import { EventType } from '@/lib/websocket';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Tipo de notificação
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
  metadata?: Record<string, any>;
}

export const NotificationsManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Atualizar contador de não lidas quando as notificações mudarem
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Adicionar notificação
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Limite de 50 notificações
    
    // Mostrar toast somente se o dropdown não estiver aberto
    if (!open) {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    }
  };

  // Marcar notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Remover notificação
  const removeNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  // Limpar todas as notificações
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Ouvir eventos WebSocket
  useWebSocketEvent(EventType.CONTENT_PUBLISHED, (payload) => {
    addNotification({
      title: 'Novo conteúdo',
      message: `${payload.title} acabou de ser publicado`,
      type: 'info',
      metadata: payload
    });
  });

  useWebSocketEvent(EventType.MATCH_UPDATED, (payload) => {
    addNotification({
      title: 'Partida atualizada',
      message: `${payload.homeTeam} ${payload.score.home} x ${payload.score.away} ${payload.awayTeam}`,
      type: 'info',
      metadata: payload
    });
  });

  useWebSocketEvent(EventType.STREAM_ONLINE, (payload) => {
    addNotification({
      title: 'Transmissão ao vivo',
      message: `${payload.title} começou agora`,
      type: 'info',
      metadata: payload
    });
  });

  useWebSocketEvent(EventType.SHOP_ITEM_ADDED, (payload) => {
    addNotification({
      title: 'Novo item na loja',
      message: `${payload.name} está disponível por ${payload.coinPrice} moedas`,
      type: 'info',
      metadata: payload
    });
  });

  useWebSocketEvent(EventType.REWARD_EARNED, (payload) => {
    addNotification({
      title: 'Recompensa recebida',
      message: `Você recebeu ${payload.amount} moedas: ${payload.reason}`,
      type: 'success',
      metadata: payload
    });
  });

  useWebSocketEvent(EventType.REDEMPTION_STATUS_CHANGED, (payload) => {
    addNotification({
      title: 'Status de resgate atualizado',
      message: `${payload.itemName}: ${formatStatus(payload.status)}`,
      type: 'info',
      metadata: payload
    });
  });

  // Formatador de status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'processing': 'Em processamento',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado',
    };
    return statusMap[status] || status;
  };

  // Formatador de data
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 md:w-96"
          onCloseAutoFocus={() => markAllAsRead()}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Notificações</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Marcar como lidas
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
              >
                Limpar
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[300px] p-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-40" />
                <p>Sem notificações</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "relative rounded-md border p-3 transition-colors",
                      notification.read ? "bg-background" : "bg-muted/50",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={cn(
                          "font-medium",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(notification.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {!notification.read && (
                      <span className="absolute top-3 right-10 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default NotificationsManager;