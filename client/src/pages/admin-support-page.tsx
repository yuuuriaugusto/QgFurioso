import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminSupportPage() {
  const { admin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [currentTicket, setCurrentTicket] = useState<any | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [newReplyMessage, setNewReplyMessage] = useState("");

  // Dados mockados para visualização, substituir com dados reais da API posteriormente
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["/api/admin/support/tickets"],
    queryFn: async () => {
      // Dados mockados
      return [
        {
          id: 1,
          subject: "Problema com Resgate de Produto",
          description: "Fiz um resgate de uma camiseta na loja com meus FURIA Coins, mas não recebi nenhuma confirmação por e-mail.",
          category: "shop",
          priority: "high",
          status: "open",
          userId: 101,
          userName: "Carlos Silva",
          userEmail: "carlos.silva@exemplo.com",
          assignedToAdminId: null,
          createdAt: new Date(2025, 4, 10, 14, 30),
          updatedAt: new Date(2025, 4, 10, 14, 30),
          messages: [
            {
              id: 1,
              ticketId: 1,
              senderId: 101,
              senderType: "user",
              senderName: "Carlos Silva",
              message: "Olá, fiz um resgate de uma camiseta oficial na loja com meus FURIA Coins há 5 dias, mas não recebi nenhuma confirmação por e-mail sobre o processamento ou envio. Poderiam verificar o status do meu pedido?",
              createdAt: new Date(2025, 4, 10, 14, 30),
              isRead: true,
            }
          ]
        },
        {
          id: 2,
          subject: "Dúvida sobre KYC",
          description: "Estou com dificuldades para completar a verificação KYC. O sistema não está aceitando meus documentos.",
          category: "account",
          priority: "medium",
          status: "open",
          userId: 102,
          userName: "Ana Rodrigues",
          userEmail: "ana.rodrigues@exemplo.com",
          assignedToAdminId: 1,
          createdAt: new Date(2025, 4, 9, 10, 15),
          updatedAt: new Date(2025, 4, 9, 16, 45),
          messages: [
            {
              id: 2,
              ticketId: 2,
              senderId: 102,
              senderType: "user",
              senderName: "Ana Rodrigues",
              message: "Estou tentando completar a verificação KYC para participar do evento presencial, mas o sistema rejeita meus documentos. Já tentei diferentes formatos e iluminações nas fotos.",
              createdAt: new Date(2025, 4, 9, 10, 15),
              isRead: true,
            },
            {
              id: 3,
              ticketId: 2,
              senderId: 1,
              senderType: "admin",
              senderName: "Suporte FURIA",
              message: "Olá Ana, obrigado por entrar em contato. Poderia nos enviar mais detalhes sobre o erro que está recebendo? Também seria útil saber qual tipo de documento está tentando enviar.",
              createdAt: new Date(2025, 4, 9, 16, 45),
              isRead: true,
            }
          ]
        },
        {
          id: 3,
          subject: "Não recebi FURIA Coins após pesquisa",
          description: "Completei a pesquisa sobre eventos, mas não recebi as moedas prometidas na recompensa.",
          category: "coins",
          priority: "low",
          status: "closed",
          userId: 103,
          userName: "Marcos Oliveira",
          userEmail: "marcos.oliveira@exemplo.com",
          assignedToAdminId: 1,
          createdAt: new Date(2025, 4, 8, 9, 0),
          updatedAt: new Date(2025, 4, 8, 17, 30),
          resolvedAt: new Date(2025, 4, 8, 17, 30),
          messages: [
            {
              id: 4,
              ticketId: 3,
              senderId: 103,
              senderType: "user",
              senderName: "Marcos Oliveira",
              message: "Finalizei a pesquisa sobre eventos da FURIA que prometia 50 moedas como recompensa, mas não recebi os créditos na minha conta.",
              createdAt: new Date(2025, 4, 8, 9, 0),
              isRead: true,
            },
            {
              id: 5,
              ticketId: 3,
              senderId: 1,
              senderType: "admin",
              senderName: "Suporte FURIA",
              message: "Olá Marcos, verificamos que houve um atraso no processamento das recompensas dessa pesquisa. Estamos creditando suas 50 moedas agora, e elas já devem estar disponíveis em sua conta.",
              createdAt: new Date(2025, 4, 8, 15, 20),
              isRead: true,
            },
            {
              id: 6,
              ticketId: 3,
              senderId: 103,
              senderType: "user",
              senderName: "Marcos Oliveira",
              message: "Perfeito! Acabei de verificar e as moedas já foram creditadas. Obrigado pela ajuda!",
              createdAt: new Date(2025, 4, 8, 16, 45),
              isRead: true,
            },
            {
              id: 7,
              ticketId: 3,
              senderId: 1,
              senderType: "admin",
              senderName: "Suporte FURIA",
              message: "Ótimo! Obrigado por confirmar. Se precisar de mais alguma coisa, estamos à disposição. Seu ticket será fechado como resolvido.",
              createdAt: new Date(2025, 4, 8, 17, 30),
              isRead: true,
            }
          ]
        },
      ];
    },
  });

  // Filtrar tickets
  const filteredTickets = tickets?.filter((ticket) => {
    const matchesSearch = searchTerm === "" || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = !selectedPriority || ticket.priority === selectedPriority;
    const matchesCategory = !selectedCategory || ticket.category === selectedCategory;
    
    return matchesSearch && matchesPriority && matchesCategory;
  });

  // Agrupar tickets por status
  const ticketsByStatus = {
    open: filteredTickets?.filter((ticket) => ticket.status === "open") || [],
    inProgress: filteredTickets?.filter((ticket) => ticket.status === "in_progress") || [],
    closed: filteredTickets?.filter((ticket) => ticket.status === "closed") || [],
  };

  // Função para obter badge de prioridade
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-yellow-500">Média</Badge>;
      case "low":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Função para obter texto de categoria
  const getCategoryText = (category: string) => {
    switch (category) {
      case "shop":
        return "Loja";
      case "account":
        return "Conta";
      case "coins":
        return "FURIA Coins";
      case "content":
        return "Conteúdo";
      case "event":
        return "Eventos";
      case "technical":
        return "Técnico";
      default:
        return category;
    }
  };

  // Função para exibir detalhes do ticket
  const handleOpenTicketDetails = (ticket: any) => {
    setCurrentTicket(ticket);
    setShowTicketDetails(true);
  };

  // Função para enviar resposta
  const handleSendReply = () => {
    if (!newReplyMessage.trim() || !currentTicket) return;
    
    // Aqui você enviaria a resposta para a API
    // Por enquanto, apenas simulamos o envio
    console.log("Enviando resposta:", {
      ticketId: currentTicket.id,
      message: newReplyMessage,
    });
    
    // Resetar o campo de mensagem
    setNewReplyMessage("");
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Suporte ao Usuário</h1>
            <p className="text-muted-foreground">
              Gerencie e responda tickets de suporte dos usuários da plataforma.
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine a lista de tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <div className="relative w-full md:w-2/5">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar tickets..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-1/5">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  <SelectItem value="shop">Loja</SelectItem>
                  <SelectItem value="account">Conta</SelectItem>
                  <SelectItem value="coins">FURIA Coins</SelectItem>
                  <SelectItem value="content">Conteúdo</SelectItem>
                  <SelectItem value="event">Eventos</SelectItem>
                  <SelectItem value="technical">Técnico</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger className="w-full md:w-1/5">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <Tabs defaultValue="open">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Tickets de Suporte</CardTitle>
                <TabsList>
                  <TabsTrigger value="open" className="relative">
                    Abertos
                    {ticketsByStatus.open.length > 0 && (
                      <Badge className="ml-2 bg-red-500">{ticketsByStatus.open.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="inProgress">Em Andamento</TabsTrigger>
                  <TabsTrigger value="closed">Resolvidos</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>Tickets de suporte dos usuários</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <TabsContent value="open" className="m-0">
                    {renderTicketTable(ticketsByStatus.open, handleOpenTicketDetails)}
                  </TabsContent>
                  <TabsContent value="inProgress" className="m-0">
                    {renderTicketTable(ticketsByStatus.inProgress, handleOpenTicketDetails)}
                  </TabsContent>
                  <TabsContent value="closed" className="m-0">
                    {renderTicketTable(ticketsByStatus.closed, handleOpenTicketDetails)}
                  </TabsContent>
                </>
              )}
            </CardContent>
          </Tabs>
        </Card>

        {/* Modal de detalhes do ticket */}
        {currentTicket && (
          <Dialog open={showTicketDetails} onOpenChange={setShowTicketDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {currentTicket.subject}
                  {getPriorityBadge(currentTicket.priority)}
                </DialogTitle>
                <DialogDescription>
                  Ticket #{currentTicket.id} · {getCategoryText(currentTicket.category)} · 
                  Criado em {format(new Date(currentTicket.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarFallback>{currentTicket.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentTicket.userName}</p>
                      <p className="text-sm text-muted-foreground">{currentTicket.userEmail}</p>
                    </div>
                  </div>
                  <p>{currentTicket.description}</p>
                </div>
                
                <div className="space-y-4 mt-4">
                  <h4 className="text-sm font-medium">Histórico de Mensagens</h4>
                  <div className="space-y-4">
                    {currentTicket.messages.map((message: any) => (
                      <div 
                        key={message.id} 
                        className={cn(
                          "flex gap-3 p-3 rounded-lg",
                          message.senderType === "admin" 
                            ? "bg-primary/10 ml-8" 
                            : "bg-muted mr-8"
                        )}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {message.senderType === "admin" ? "A" : message.senderName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {message.senderName}
                              {message.senderType === "admin" && " (Equipe FURIA)"}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {currentTicket.status !== "closed" && (
                  <div className="mt-4">
                    <Label htmlFor="reply">Responder</Label>
                    <div className="flex items-end gap-2 mt-2">
                      <Textarea
                        id="reply"
                        placeholder="Digite sua resposta..."
                        rows={3}
                        value={newReplyMessage}
                        onChange={(e) => setNewReplyMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendReply} 
                        disabled={!newReplyMessage.trim()}
                        className="h-10"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  {currentTicket.status !== "closed" && (
                    <Button variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Resolvido
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setShowTicketDetails(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}

// Função para renderizar a tabela de tickets
function renderTicketTable(tickets: any[], onRowClick: (ticket: any) => void) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p>Nenhum ticket encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Assunto</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow 
              key={ticket.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(ticket)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {ticket.status === "open" && (
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                  {ticket.status === "in_progress" && (
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  )}
                  {ticket.status === "closed" && (
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  )}
                  {ticket.subject}
                </div>
              </TableCell>
              <TableCell>{ticket.userName}</TableCell>
              <TableCell>
                {ticket.category === "shop" && "Loja"}
                {ticket.category === "account" && "Conta"}
                {ticket.category === "coins" && "FURIA Coins"}
                {ticket.category === "content" && "Conteúdo"}
                {ticket.category === "event" && "Eventos"}
                {ticket.category === "technical" && "Técnico"}
              </TableCell>
              <TableCell>
                {ticket.priority === "high" && <Badge variant="destructive">Alta</Badge>}
                {ticket.priority === "medium" && <Badge variant="default" className="bg-yellow-500">Média</Badge>}
                {ticket.priority === "low" && <Badge variant="outline" className="border-blue-500 text-blue-500">Baixa</Badge>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(ticket.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}