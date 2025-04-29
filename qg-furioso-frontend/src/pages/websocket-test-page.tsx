import React, { useState } from 'react';
import { useWebSocketContext } from '@/contexts/websocket-provider';
import { EventType } from '@/lib/websocket';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

const WebSocketTestPage = () => {
  const { isConnected, isAuthenticated, connect, authenticate, disconnect } = useWebSocketContext();
  const [selectedTab, setSelectedTab] = useState('broadcast');
  const [requestStatus, setRequestStatus] = useState<Record<string, RequestStatus>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: 'Conexão estabelecida',
        description: 'WebSocket conectado com sucesso',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erro de conexão',
        description: 'Falha ao conectar ao WebSocket',
        variant: 'destructive',
      });
    }
  };

  const handleAuthenticate = async () => {
    try {
      const success = await authenticate();
      if (success) {
        toast({
          title: 'Autenticado',
          description: 'WebSocket autenticado com sucesso',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Falha na autenticação',
          description: 'Não foi possível autenticar o WebSocket',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro de autenticação',
        description: 'Falha ao autenticar o WebSocket',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: 'Desconectado',
      description: 'WebSocket desconectado',
      variant: 'default',
    });
  };

  const simulateEvent = async (eventType: string, userId?: number) => {
    try {
      const key = eventType + (userId ? `-${userId}` : '');
      setRequestStatus(prev => ({ ...prev, [key]: 'loading' }));
      
      let endpoint = `/api/ws-test/simulate/${eventType}`;
      if (userId) {
        endpoint += `/${userId}`;
      }
      
      const response = await apiRequest('POST', endpoint);
      
      if (response.ok) {
        setRequestStatus(prev => ({ ...prev, [key]: 'success' }));
        toast({
          title: 'Evento simulado',
          description: `Evento ${eventType} simulado com sucesso`,
          variant: 'default',
        });
        
        // Resetar status após 2 segundos
        setTimeout(() => {
          setRequestStatus(prev => ({ ...prev, [key]: 'idle' }));
        }, 2000);
      } else {
        setRequestStatus(prev => ({ ...prev, [key]: 'error' }));
        toast({
          title: 'Falha na simulação',
          description: `Não foi possível simular o evento ${eventType}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setRequestStatus(prev => ({ ...prev, [eventType]: 'error' }));
      toast({
        title: 'Erro na simulação',
        description: 'Ocorreu um erro ao tentar simular o evento',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (eventType: string, userId?: number) => {
    const key = eventType + (userId ? `-${userId}` : '');
    const status = requestStatus[key] || 'idle';
    
    switch (status) {
      case 'loading':
        return <Loader2 className="ml-2 h-4 w-4 animate-spin" />;
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Sucesso</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Erro</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold">Testes de WebSocket</h1>
        <p className="text-muted-foreground">
          Esta página permite testar as funcionalidades do sistema de WebSockets e notificações em tempo real.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
          <CardDescription>
            Estado atual da conexão WebSocket
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estado da Conexão</Label>
              <div className="mt-1 flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
              </div>
            </div>
            <div>
              <Label>Autenticação</Label>
              <div className="mt-1 flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isAuthenticated ? 'Autenticado' : 'Não autenticado'}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-start space-x-2">
          <Button onClick={handleConnect} disabled={isConnected}>Conectar</Button>
          <Button onClick={handleAuthenticate} disabled={!isConnected || isAuthenticated}>Autenticar</Button>
          <Button variant="outline" onClick={handleDisconnect} disabled={!isConnected}>Desconectar</Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="broadcast" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="user">Usuário Específico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulação de Eventos de Broadcast</CardTitle>
              <CardDescription>
                Envie eventos para todos os usuários conectados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="justify-between"
                  onClick={() => simulateEvent('content')}
                  disabled={requestStatus['content'] === 'loading'}
                >
                  <span>Novo Conteúdo</span>
                  {getStatusIcon('content')}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-between"
                  onClick={() => simulateEvent('match')}
                  disabled={requestStatus['match'] === 'loading'}
                >
                  <span>Atualização de Partida</span>
                  {getStatusIcon('match')}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-between"
                  onClick={() => simulateEvent('stream')}
                  disabled={requestStatus['stream'] === 'loading'}
                >
                  <span>Transmissão ao Vivo</span>
                  {getStatusIcon('stream')}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-between"
                  onClick={() => simulateEvent('shop-item')}
                  disabled={requestStatus['shop-item'] === 'loading'}
                >
                  <span>Novo Item na Loja</span>
                  {getStatusIcon('shop-item')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulação de Eventos de Usuário</CardTitle>
              <CardDescription>
                Envie eventos específicos para um usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label>ID do Usuário:</Label>
                    <Badge variant="secondary">{user.id}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-between"
                      onClick={() => simulateEvent('reward', user.id)}
                      disabled={requestStatus[`reward-${user.id}`] === 'loading'}
                    >
                      <span>Recompensa Recebida</span>
                      {getStatusIcon('reward', user.id)}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-between"
                      onClick={() => simulateEvent('redemption', user.id)}
                      disabled={requestStatus[`redemption-${user.id}`] === 'loading'}
                    >
                      <span>Status de Resgate</span>
                      {getStatusIcon('redemption', user.id)}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Você precisa estar logado para testar eventos específicos de usuário.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebSocketTestPage;