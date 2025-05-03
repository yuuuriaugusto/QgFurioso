import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mail as Envelope,
  Phone as Telephone,
  Calendar,
  Clock,
  Check,
  Search,
  User as UserCircle,
  XCircle as CircleX,
  Tag as TagIcon,
  MessageSquare,
  AlertCircle,
  X as XCircle,
  CheckCircle,
  Clock3,
  ArrowRight as RightArrowCircle,
  HelpCircle,
  SendHorizontal,
  Paperclip as PaperclipIcon,
  ChevronLeft,
  Timer,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminSupportPage() {
  const { admin } = useAdminAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");

  // Carregar tickets de suporte
  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/support/tickets", selectedStatus, selectedPriority, selectedCategory],
    queryFn: async () => {
      // Dados mockados para visualização
      return [
        {
          id: 1,
          userId: 42,
          subject: "Problema com resgate de ingresso",
          category: "redemption",
          status: "open",
          priority: "high",
          createdAt: new Date(2025, 4, 10, 9, 30),
          updatedAt: new Date(2025, 4, 10, 9, 30),
          resolvedAt: null,
          assignedToAdminId: null,
          unreadCount: 1,
          lastMessage: {
            message: "Olá, resgatei um ingresso para o evento FURIA Day mas não recebi nenhuma confirmação. Como devo proceder?",
            createdAt: new Date(2025, 4, 10, 9, 30),
            senderType: "user",
          },
        },
        {
          id: 2,
          userId: 15,
          subject: "Dúvida sobre FURIA Coins",
          category: "coins",
          status: "in_progress",
          priority: "medium",
          createdAt: new Date(2025, 4, 9, 14, 15),
          updatedAt: new Date(2025, 4, 9, 16, 45),
          resolvedAt: null,
          assignedToAdminId: 1,
          unreadCount: 0,
          lastMessage: {
            message: "Sim, vou verificar seu histórico de transações e retorno em breve.",
            createdAt: new Date(2025, 4, 9, 16, 45),
            senderType: "admin",
          },
        },
        {
          id: 3,
          userId: 28,
          subject: "Sugestão para o site",
          category: "feedback",
          status: "closed",
          priority: "low",
          createdAt: new Date(2025, 4, 8, 10, 20),
          updatedAt: new Date(2025, 4, 8, 15, 10),
          resolvedAt: new Date(2025, 4, 8, 15, 10),
          assignedToAdminId: 2,
          unreadCount: 0,
          lastMessage: {
            message: "Agradecemos sua sugestão! Ela foi encaminhada para nossa equipe de produto.",
            createdAt: new Date(2025, 4, 8, 15, 10),
            senderType: "admin",
          },
        },
        {
          id: 4,
          userId: 56,
          subject: "Falha na autenticação",
          category: "account",
          status: "in_progress",
          priority: "high",
          createdAt: new Date(2025, 4, 7, 8, 45),
          updatedAt: new Date(2025, 4, 7, 11, 30),
          resolvedAt: null,
          assignedToAdminId: 1,
          unreadCount: 1,
          lastMessage: {
            message: "Tentei o procedimento que você sugeriu mas ainda estou tendo problemas para acessar minha conta.",
            createdAt: new Date(2025, 4, 7, 11, 30),
            senderType: "user",
          },
        },
        {
          id: 5,
          userId: 34,
          subject: "Produto com defeito",
          category: "shop",
          status: "open",
          priority: "medium",
          createdAt: new Date(2025, 4, 6, 16, 10),
          updatedAt: new Date(2025, 4, 6, 16, 10),
          resolvedAt: null,
          assignedToAdminId: null,
          unreadCount: 1,
          lastMessage: {
            message: "Recebi a camiseta que comprei e ela está com um defeito na estampa. Como posso proceder para troca?",
            createdAt: new Date(2025, 4, 6, 16, 10),
            senderType: "user",
          },
        },
      ];
    },
  });

  // Filtrar tickets com base nas seleções
  const filteredTickets = tickets?.filter(ticket => {
    // Aplicar filtros selecionados
    const matchesStatus = !selectedStatus || ticket.status === selectedStatus;
    const matchesPriority = !selectedPriority || ticket.priority === selectedPriority;
    const matchesCategory = !selectedCategory || ticket.category === selectedCategory;
    
    // Aplicar busca de texto
    const matchesSearch = 
      searchTerm === "" || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (ticket.lastMessage?.message?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  // Carregar detalhes do ticket quando selecionado
  const { data: ticketDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/admin/support/tickets", selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket) return null;
      
      // Dados mockados para visualização
      return {
        ticket: selectedTicket,
        messages: [
          {
            id: 1,
            ticketId: selectedTicket.id,
            senderId: selectedTicket.userId,
            senderType: "user",
            message: selectedTicket.lastMessage.message,
            attachmentUrl: null,
            createdAt: selectedTicket.lastMessage.createdAt,
            isRead: false,
          },
          {
            id: 2,
            ticketId: selectedTicket.id,
            senderId: 1,
            senderType: "admin",
            message: "Olá! Obrigado por entrar em contato. Vou verificar o status do seu ingresso. Você poderia me informar a data da compra e o evento específico?",
            attachmentUrl: null,
            createdAt: new Date(new Date(selectedTicket.lastMessage.createdAt).getTime() + 30 * 60000),
            isRead: true,
          },
          {
            id: 3,
            ticketId: selectedTicket.id,
            senderId: selectedTicket.userId,
            senderType: "user",
            message: "Comprei hoje cedo, por volta das 8h. O evento é o FURIA Day que acontecerá no dia 20/06/2025.",
            attachmentUrl: null,
            createdAt: new Date(new Date(selectedTicket.lastMessage.createdAt).getTime() + 45 * 60000),
            isRead: true,
          }
        ],
        user: {
          id: selectedTicket.userId,
          primaryIdentity: `user${selectedTicket.userId}@example.com`,
          status: "active",
          profile: {
            firstName: "João",
            lastName: "Silva",
            birthDate: new Date(1992, 5, 15),
            avatarUrl: null,
          }
        }
      };
    },
    enabled: !!selectedTicket,
  });

  // Mutation para responder ao ticket
  const replyMutation = useMutation({
    mutationFn: async (data: { ticketId: number, message: string }) => {
      // Simulação de envio - em produção, chamar a API real
      console.log("Enviando resposta:", data);
      return {
        id: Math.floor(Math.random() * 1000),
        ticketId: data.ticketId,
        senderId: admin?.id || 1,
        senderType: "admin",
        message: data.message,
        attachmentUrl: null,
        createdAt: new Date(),
        isRead: false,
      };
    },
    onSuccess: () => {
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso.",
      });
      setReplyText("");
      refetch();
    },
    onError: () => {
      toast({
        title: "Erro ao enviar resposta",
        description: "Ocorreu um erro ao enviar sua resposta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar status do ticket
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { ticketId: number, status: string }) => {
      // Simulação de atualização - em produção, chamar a API real
      console.log("Atualizando status:", data);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status do ticket foi atualizado com sucesso.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do ticket. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Funções auxiliares para renderização
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500">Aberto</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500">Em Andamento</Badge>;
      case "closed":
        return <Badge variant="outline">Fechado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">Alta</Badge>;
      case "medium":
        return <Badge className="bg-amber-500">Média</Badge>;
      case "low":
        return <Badge variant="outline" className="border-green-500 text-green-500">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      "account": "Conta",
      "coins": "FURIA Coins",
      "redemption": "Resgates",
      "shop": "Loja",
      "feedback": "Feedback",
      "other": "Outros",
    };
    
    return categoryMap[category] || category;
  };

  const handleReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    
    replyMutation.mutate({
      ticketId: selectedTicket.id,
      message: replyText.trim(),
    });
  };

  const handleUpdateStatus = (ticketId: number, status: string) => {
    updateStatusMutation.mutate({ ticketId, status });
    
    // Atualizar localmente para UI mais responsiva
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        status,
        resolvedAt: status === "closed" ? new Date() : selectedTicket.resolvedAt,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Suporte ao Cliente</h1>
            <p className="text-muted-foreground">
              Gerencie e responda tickets de suporte dos usuários
            </p>
          </div>
          <Button variant="outline">
            <HelpCircle className="mr-2 h-4 w-4" /> Ver Estatísticas
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Lista de Tickets */}
          <div className="lg:col-span-1 flex flex-col h-full">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle>Tickets de Suporte</CardTitle>
                <CardDescription>
                  {filteredTickets?.length || 0} tickets encontrados
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar tickets..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex gap-2 overflow-auto pb-2">
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="open">Abertos</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="closed">Fechados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedPriority}
                    onValueChange={setSelectedPriority}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="account">Conta</SelectItem>
                      <SelectItem value="coins">FURIA Coins</SelectItem>
                      <SelectItem value="redemption">Resgates</SelectItem>
                      <SelectItem value="shop">Loja</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <div className="flex-1 overflow-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : filteredTickets && filteredTickets.length > 0 ? (
                  <ul className="divide-y">
                    {filteredTickets.map((ticket) => (
                      <li 
                        key={ticket.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedTicket?.id === ticket.id ? 'bg-muted' : ''}`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-medium truncate">{ticket.subject}</span>
                          <div className="flex gap-1 shrink-0">
                            {ticket.unreadCount > 0 && (
                              <Badge className="bg-primary rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {ticket.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-muted-foreground">
                            #{ticket.id} - {format(new Date(ticket.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <div className="flex items-center gap-1">
                            {getStatusBadge(ticket.status)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <TagIcon className="h-3 w-3 text-muted-foreground" />
                            <span>{getCategoryLabel(ticket.category)}</span>
                          </div>
                          <div>
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum ticket encontrado com os filtros atuais</p>
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedStatus(undefined);
                        setSelectedPriority(undefined);
                        setSelectedCategory(undefined);
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Visualização de Ticket */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <Card className="flex-1 flex flex-col">
              {selectedTicket ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setSelectedTicket(null)}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                      </Button>
                      <div className="flex gap-2">
                        <Select
                          value={selectedTicket.status}
                          onValueChange={(value) => handleUpdateStatus(selectedTicket.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue placeholder="Atualizar status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Aberto</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="closed">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue placeholder="Atribuir para" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="self">Eu mesmo</SelectItem>
                            <SelectItem value="1">Admin (eu)</SelectItem>
                            <SelectItem value="2">Maria Costa</SelectItem>
                            <SelectItem value="3">João Almeida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">{selectedTicket.subject}</h2>
                        <div className="flex gap-2">
                          {getStatusBadge(selectedTicket.status)}
                          {getPriorityBadge(selectedTicket.priority)}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <TagIcon className="h-4 w-4 mr-1" />
                          {getCategoryLabel(selectedTicket.category)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(selectedTicket.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(new Date(selectedTicket.createdAt), "HH:mm", { locale: ptBR })}
                        </div>
                        <div className="flex items-center">
                          <Timer className="h-4 w-4 mr-1" />
                          {selectedTicket.status === "closed" 
                            ? "Resolvido" 
                            : "Aberto"} há {Math.floor((new Date().getTime() - new Date(selectedTicket.createdAt).getTime()) / (1000 * 60 * 60))} horas
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <div className="flex h-full min-h-0">
                    {/* Mensagens do ticket */}
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      <ScrollArea className="flex-1 p-4">
                        {isLoadingDetails ? (
                          <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          </div>
                        ) : ticketDetails?.messages ? (
                          <div className="space-y-4">
                            {ticketDetails.messages.map(message => (
                              <div 
                                key={message.id} 
                                className={`flex ${message.senderType === "admin" ? "justify-end" : "justify-start"}`}
                              >
                                <div 
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    message.senderType === "admin"
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <div className="text-sm mb-1">
                                    {message.senderType === "admin" ? (
                                      <span className="font-semibold">
                                        {admin?.firstName || "Admin"} ({admin?.email || "admin@furia.com"})
                                      </span>
                                    ) : (
                                      <span className="font-semibold">
                                        {ticketDetails.user?.profile?.firstName || "Usuário"} (#{ticketDetails.user?.id})
                                      </span>
                                    )}
                                  </div>
                                  <div className="whitespace-pre-wrap">{message.message}</div>
                                  <div className="text-xs mt-1 opacity-70 text-right">
                                    {format(new Date(message.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-center p-4">
                            <p className="text-muted-foreground">Nenhuma mensagem disponível</p>
                          </div>
                        )}
                      </ScrollArea>
                      
                      {/* Formulário de resposta */}
                      <div className="p-4 border-t">
                        {selectedTicket.status !== "closed" ? (
                          <>
                            <div className="flex">
                              <Textarea
                                placeholder="Digite sua resposta..."
                                className="flex-1 resize-none"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div className="flex justify-between mt-2">
                              <Button variant="outline" size="sm">
                                <PaperclipIcon className="h-4 w-4 mr-1" /> Anexar Arquivo
                              </Button>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(selectedTicket.id, "closed")}
                                >
                                  <Check className="h-4 w-4 mr-1" /> Resolver e Fechar
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={handleReply}
                                  disabled={!replyText.trim() || replyMutation.isPending}
                                >
                                  <SendHorizontal className="h-4 w-4 mr-1" /> Enviar
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-center py-2">
                            <div className="flex items-center text-muted-foreground bg-muted px-4 py-2 rounded-md">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              <span>Este ticket está fechado</span>
                              <Button 
                                variant="link" 
                                size="sm"
                                onClick={() => handleUpdateStatus(selectedTicket.id, "open")}
                                className="ml-2"
                              >
                                Reabrir
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Informações do usuário */}
                    {ticketDetails?.user && (
                      <div className="hidden md:block w-72 bg-muted/40 p-4 border-l overflow-y-auto">
                        <div className="flex flex-col items-center mb-4">
                          <Avatar className="h-20 w-20 mb-2">
                            {ticketDetails.user.profile?.avatarUrl ? (
                              <AvatarImage src={ticketDetails.user.profile.avatarUrl} alt={ticketDetails.user.profile?.firstName || "Usuário"} />
                            ) : (
                              <AvatarFallback>
                                {ticketDetails.user.profile?.firstName?.[0] || "U"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <h3 className="font-semibold text-lg">
                            {ticketDetails.user.profile?.firstName} {ticketDetails.user.profile?.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            #{ticketDetails.user.id}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">E-mail</Label>
                            <div className="flex items-center">
                              <Envelope className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm truncate">{ticketDetails.user.primaryIdentity}</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Status da Conta</Label>
                            <div className="flex items-center">
                              <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">
                                {ticketDetails.user.status === "active" ? (
                                  <span className="text-green-500 flex items-center">
                                    <Check className="h-3 w-3 mr-1" /> Ativo
                                  </span>
                                ) : (
                                  <span className="text-red-500 flex items-center">
                                    <CircleX className="h-3 w-3 mr-1" /> Inativo
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          
                          {ticketDetails.user.profile?.birthDate && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Data de Nascimento</Label>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {format(new Date(ticketDetails.user.profile.birthDate), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="border-t pt-3 mt-3">
                            <Label className="text-xs text-muted-foreground mb-2 block">Histórico</Label>
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span>Total de tickets:</span>
                                <Badge variant="outline">3</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>FURIA Coins:</span>
                                <Badge variant="outline">250</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Compras:</span>
                                <Badge variant="outline">2</Badge>
                              </div>
                            </div>
                          </div>
                          
                          <Button variant="outline" className="w-full mt-2">
                            <RightArrowCircle className="h-4 w-4 mr-2" /> Ver Perfil Completo
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum ticket selecionado</h3>
                  <p className="text-muted-foreground max-w-md">
                    Selecione um ticket da lista à esquerda para visualizar detalhes e responder
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}