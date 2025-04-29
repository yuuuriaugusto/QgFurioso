import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/use-websocket';
import { EventType } from '../../lib/websocket';
import { useToast } from './toast';
import { Bell, BellOff, Zap, Award, ShoppingBag, Calendar, Radio, FileText, BarChart } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';
import { Badge } from './badge';
import { Switch } from './switch';
import { Label } from './label';
import { Card } from './card';

// Interface para notificações
interface Notification {
  id: string;
  type: EventType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

export function NotificationsManager() {
  const { toast } = useToast();
  const { isConnected, isAuthenticated, subscribe, unsubscribe } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Processar a adição de uma nova notificação
  const addNotification = (type: EventType, title: string, message: string, data?: any) => {
    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      data
    };
    
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Manter apenas as 50 notificações mais recentes
    setUnreadCount(prev => prev + 1);
    
    // Mostrar toast se notificações estiverem habilitadas
    if (enabled) {
      toast({
        title,
        description: message,
        variant: "default",
      });
    }
    
    return notification;
  };
  
  // Marcar todas as notificações como lidas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  
  // Marcar uma notificação específica como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Remover uma notificação
  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      const newNotifications = prev.filter(n => n.id !== id);
      
      // Se a notificação removida não estava lida, atualizar contador
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      
      return newNotifications;
    });
  };
  
  // Limpar todas as notificações
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  // Handler para mensagens de diferentes tipos
  const handleContentPublished = (payload: any) => {
    addNotification(
      EventType.CONTENT_PUBLISHED,
      'Novo Conteúdo',
      `${payload.title} - ${payload.summary || 'Novo artigo publicado'}`,
      payload
    );
  };
  
  const handleMatchUpdated = (payload: any) => {
    const message = payload.status === 'live' 
      ? `Partida em andamento: ${payload.homeTeam} vs ${payload.awayTeam}`
      : `Atualização da partida: ${payload.homeTeam} vs ${payload.awayTeam}`;
      
    addNotification(
      EventType.MATCH_UPDATED,
      'Atualização de Partida',
      message,
      payload
    );
  };
  
  const handleStreamOnline = (payload: any) => {
    addNotification(
      EventType.STREAM_ONLINE,
      'Transmissão Iniciada',
      `${payload.title} - ${payload.streamerName} está ao vivo!`,
      payload
    );
  };
  
  const handleShopItemAdded = (payload: any) => {
    addNotification(
      EventType.SHOP_ITEM_ADDED,
      'Novo Item na Loja',
      `${payload.name} - ${payload.coinPrice} Moedas`,
      payload
    );
  };
  
  const handleSurveyPublished = (payload: any) => {
    addNotification(
      EventType.SURVEY_PUBLISHED,
      'Nova Pesquisa',
      `${payload.title} - Ganhe moedas participando!`,
      payload
    );
  };
  
  const handleRewardEarned = (payload: any) => {
    addNotification(
      EventType.REWARD_EARNED,
      'Recompensa Recebida',
      `Você ganhou ${payload.amount} moedas: ${payload.reason}`,
      payload
    );
  };
  
  const handleRedemptionStatusChanged = (payload: any) => {
    const statusMessages: Record<string, string> = {
      'pending': 'Aguardando processamento',
      'processing': 'Em processamento',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'canceled': 'Cancelado',
      'rejected': 'Rejeitado'
    };
    
    const status = statusMessages[payload.status] || payload.status;
    
    addNotification(
      EventType.REDEMPTION_STATUS_CHANGED,
      'Status de Resgate Atualizado',
      `${payload.itemName}: ${status}`,
      payload
    );
  };
  
  // Efeito para configurar os listeners de eventos
  useEffect(() => {
    if (!isConnected || !isAuthenticated || !enabled) return;
    
    // Adicionar listeners para todos os eventos relevantes
    subscribe(EventType.CONTENT_PUBLISHED, handleContentPublished);
    subscribe(EventType.MATCH_UPDATED, handleMatchUpdated);
    subscribe(EventType.MATCH_STARTED, handleMatchUpdated);
    subscribe(EventType.MATCH_ENDED, handleMatchUpdated);
    subscribe(EventType.STREAM_ONLINE, handleStreamOnline);
    subscribe(EventType.SHOP_ITEM_ADDED, handleShopItemAdded);
    subscribe(EventType.SHOP_ITEM_UPDATED, handleShopItemAdded);
    subscribe(EventType.SURVEY_PUBLISHED, handleSurveyPublished);
    subscribe(EventType.REWARD_EARNED, handleRewardEarned);
    subscribe(EventType.REDEMPTION_STATUS_CHANGED, handleRedemptionStatusChanged);
    
    // Limpar listeners ao desmontar
    return () => {
      unsubscribe(EventType.CONTENT_PUBLISHED, handleContentPublished);
      unsubscribe(EventType.MATCH_UPDATED, handleMatchUpdated);
      unsubscribe(EventType.MATCH_STARTED, handleMatchUpdated);
      unsubscribe(EventType.MATCH_ENDED, handleMatchUpdated);
      unsubscribe(EventType.STREAM_ONLINE, handleStreamOnline);
      unsubscribe(EventType.SHOP_ITEM_ADDED, handleShopItemAdded);
      unsubscribe(EventType.SHOP_ITEM_UPDATED, handleShopItemAdded);
      unsubscribe(EventType.SURVEY_PUBLISHED, handleSurveyPublished);
      unsubscribe(EventType.REWARD_EARNED, handleRewardEarned);
      unsubscribe(EventType.REDEMPTION_STATUS_CHANGED, handleRedemptionStatusChanged);
    };
  }, [isConnected, isAuthenticated, enabled, subscribe, unsubscribe]);
  
  // Ícone com base no tipo de notificação
  const getNotificationIcon = (type: EventType) => {
    switch (type) {
      case EventType.CONTENT_PUBLISHED:
        return <FileText className="h-4 w-4" />;
      case EventType.MATCH_CREATED:
      case EventType.MATCH_UPDATED:
      case EventType.MATCH_STARTED:
      case EventType.MATCH_ENDED:
        return <Calendar className="h-4 w-4" />;
      case EventType.STREAM_ONLINE:
      case EventType.STREAM_OFFLINE:
        return <Radio className="h-4 w-4" />;
      case EventType.SHOP_ITEM_ADDED:
      case EventType.SHOP_ITEM_UPDATED:
        return <ShoppingBag className="h-4 w-4" />;
      case EventType.SURVEY_PUBLISHED:
        return <BarChart className="h-4 w-4" />;
      case EventType.REWARD_EARNED:
        return <Award className="h-4 w-4" />;
      case EventType.REDEMPTION_STATUS_CHANGED:
        return <Zap className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  // Formatar timestamp como string relativa (ex: "há 5 minutos")
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) return `há ${diffSec} segundos`;
    if (diffMin < 60) return `há ${diffMin} minutos`;
    if (diffHour < 24) return `há ${diffHour} horas`;
    return `há ${diffDay} dias`;
  };
  
  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            {enabled ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Notificações</h3>
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount} não lidas</Badge>}
            </div>
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="notifications-enabled" className="sr-only">
                Ativar notificações
              </Label>
              <Switch
                id="notifications-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>
          
          {notifications.length > 0 ? (
            <>
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`flex cursor-pointer gap-3 p-3 ${
                        notification.read ? 'opacity-80' : 'bg-accent/50'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.timestamp)}
                          </p>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex items-center justify-between border-t p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Marcar todas como lidas
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  disabled={notifications.length === 0}
                >
                  Limpar todas
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Nenhuma notificação</p>
              <p className="text-xs text-muted-foreground/70">
                As notificações em tempo real aparecerão aqui
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}