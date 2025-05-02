import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocketContext } from "@/contexts/websocket-provider";
import { EventType } from "@/lib/websocket";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { WebSocketStatus } from "@/components/ui/websocket-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Send, ZapIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function WebSocketTestPage() {
  const { user } = useAuth();
  const { client, isConnected, isAuthenticated, lastEvent } = useWebSocketContext();
  const { toast } = useToast();
  
  const [messageType, setMessageType] = useState<EventType | string>(EventType.PING);
  const [payload, setPayload] = useState("{}");
  const [broadcastType, setBroadcastType] = useState<EventType | string>(EventType.REWARD_EARNED);
  const [broadcastPayload, setBroadcastPayload] = useState(
    JSON.stringify({
      amount: 100,
      reason: "Teste de notificação de recompensa"
    }, null, 2)
  );
  
  // Função para enviar mensagem pelo WebSocket
  const sendMessage = () => {
    if (!isConnected) {
      toast({
        title: "Erro",
        description: "WebSocket não está conectado.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const parsedPayload = payload ? JSON.parse(payload) : {};
      client.send(messageType as EventType, parsedPayload);
      
      toast({
        title: "Mensagem Enviada",
        description: `Tipo: ${messageType}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };
  
  // Função para enviar broadcast pela API
  const sendBroadcast = async () => {
    try {
      const parsedPayload = broadcastPayload ? JSON.parse(broadcastPayload) : {};
      
      const response = await fetch("/api/broadcast-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: broadcastType,
          payload: parsedPayload
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Erro ao enviar broadcast");
      }
      
      toast({
        title: "Broadcast Enviado",
        description: data.message,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar broadcast",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-4 md:flex md:gap-6">
        {/* Sidebar (desktop only) */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold font-rajdhani">WebSocket Teste</h1>
              <p className="text-muted-foreground">Ferramentas para testar a conexão WebSocket</p>
            </div>
            
            <WebSocketStatus />
          </div>
          
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
              <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            </TabsList>
            
            {/* Tab de Status */}
            <TabsContent value="status" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status da Conexão</CardTitle>
                  <CardDescription>Informações sobre o estado atual da conexão WebSocket</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="font-medium">Conectado:</span>
                      <span className={isConnected ? "text-green-500" : "text-red-500"}>
                        {isConnected ? "Sim" : "Não"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="font-medium">Autenticado:</span>
                      <span className={isAuthenticated ? "text-green-500" : "text-amber-500"}>
                        {isAuthenticated ? "Sim" : "Não"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="font-medium">Usuário:</span>
                      <span>{user?.primaryIdentity || "Não autenticado"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    onClick={() => client.connect()}
                    disabled={isConnected}
                    variant="outline"
                  >
                    Conectar
                  </Button>
                  
                  <Button 
                    onClick={() => client.authenticate()}
                    disabled={!isConnected || isAuthenticated || !user}
                  >
                    Autenticar
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Último Evento</CardTitle>
                  <CardDescription>Informações sobre o último evento recebido</CardDescription>
                </CardHeader>
                <CardContent>
                  {lastEvent ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <ZapIcon className="h-5 w-5" />
                        <span className="font-medium">{lastEvent.type}</span>
                      </div>
                      
                      <Separator />
                      
                      <pre className="p-4 bg-muted rounded-md overflow-auto max-h-64 text-sm">
                        {JSON.stringify(lastEvent.payload, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mb-2 text-muted-foreground/70" />
                      <p>Nenhum evento recebido ainda</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tab de Envio de Mensagens */}
            <TabsContent value="send" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Mensagem WebSocket</CardTitle>
                  <CardDescription>Envie uma mensagem diretamente para o servidor WebSocket</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message-type">Tipo de Mensagem</Label>
                    <Select value={messageType} onValueChange={setMessageType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de mensagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EventType.PING}>ping</SelectItem>
                        <SelectItem value={EventType.AUTHENTICATE}>authenticate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payload">Payload (JSON)</Label>
                    <Textarea
                      id="payload"
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      className="font-mono"
                      rows={5}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={sendMessage}
                    disabled={!isConnected}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Tab de Broadcast */}
            <TabsContent value="broadcast" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Broadcast</CardTitle>
                  <CardDescription>Envie uma mensagem para todos os clientes conectados via API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="broadcast-type">Tipo de Mensagem</Label>
                    <Select value={broadcastType} onValueChange={setBroadcastType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de mensagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EventType.REWARD_EARNED}>reward_earned</SelectItem>
                        <SelectItem value={EventType.REDEMPTION_STATUS_CHANGED}>redemption_status_changed</SelectItem>
                        <SelectItem value={EventType.CONTENT_PUBLISHED}>content_published</SelectItem>
                        <SelectItem value={EventType.SURVEY_PUBLISHED}>survey_published</SelectItem>
                        <SelectItem value={EventType.MATCH_CREATED}>match_created</SelectItem>
                        <SelectItem value={EventType.STREAM_ONLINE}>stream_online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="broadcast-payload">Payload (JSON)</Label>
                    <Textarea
                      id="broadcast-payload"
                      value={broadcastPayload}
                      onChange={(e) => setBroadcastPayload(e.target.value)}
                      className="font-mono"
                      rows={8}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={sendBroadcast}
                    disabled={!user}
                    className="w-full"
                  >
                    <ZapIcon className="h-4 w-4 mr-2" />
                    Enviar Broadcast
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}