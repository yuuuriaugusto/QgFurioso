import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { Loader2, Search, Check, MoreHorizontal, ShoppingBag, EyeIcon, TruckIcon, XCircle, Package } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Tipos
type RedemptionOrder = {
  id: number;
  orderId: string;
  userId: number;
  userName: string;
  userEmail: string;
  itemId: number;
  itemName: string;
  itemType: string;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  processingNotes: string | null;
  trackingNumber: string | null;
  deliveryAddress?: {
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
};

type RedemptionOrdersResponse = {
  orders: RedemptionOrder[];
  totalCount: number;
  pageCount: number;
};

export default function AdminShopRedemptionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RedemptionOrder | null>(null);
  const [processingNotes, setProcessingNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  
  // Buscar pedidos
  const { data, isLoading } = useQuery<RedemptionOrdersResponse>({
    queryKey: ["/api/admin/shop/redemptions", page, statusFilter, typeFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("itemType", typeFilter);
      if (search) params.append("search", search);
      
      // NOTA: Esta chamada API ainda não está implementada no backend
      // Está aqui para demonstrar como seria a interface de usuário
      const res = await apiRequest("GET", `/api/admin/shop/redemptions?${params.toString()}`);
      if (!res.ok) {
        return {
          orders: [],
          totalCount: 0,
          pageCount: 0
        };
      }
      return await res.json();
    },
    enabled: true, // temporário para desenvolvimento
  });
  
  // Mock data para visualização da interface
  const mockRedemptionOrders: RedemptionOrder[] = [
    {
      id: 1,
      orderId: "ORD-2023-0001",
      userId: 1,
      userName: "João Silva",
      userEmail: "joao.silva@exemplo.com",
      itemId: 1,
      itemName: "Camisa FURIA Oficial",
      itemType: "physical",
      price: 500,
      status: "pending",
      createdAt: "2023-04-28T14:30:00Z",
      updatedAt: "2023-04-28T14:30:00Z",
      processingNotes: null,
      trackingNumber: null,
      deliveryAddress: {
        street: "Rua das Flores",
        number: "123",
        complement: "Apto 45",
        neighborhood: "Jardim Primavera",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        country: "Brasil"
      }
    },
    {
      id: 2,
      orderId: "ORD-2023-0002",
      userId: 2,
      userName: "Maria Santos",
      userEmail: "maria.santos@exemplo.com",
      itemId: 2,
      itemName: "Skin FURIA AWP (CS2)",
      itemType: "digital",
      price: 1000,
      status: "processing",
      createdAt: "2023-04-27T09:45:00Z",
      updatedAt: "2023-04-27T10:20:00Z",
      processingNotes: "Verificando a conta Steam do usuário para transferência da skin.",
      trackingNumber: null,
      deliveryAddress: undefined
    },
    {
      id: 3,
      orderId: "ORD-2023-0003",
      userId: 3,
      userName: "Carlos Oliveira",
      userEmail: "carlos.oliveira@exemplo.com",
      itemId: 3,
      itemName: "Emoji Exclusivo (Discord)",
      itemType: "digital",
      price: 150,
      status: "completed",
      createdAt: "2023-04-26T16:20:00Z",
      updatedAt: "2023-04-26T16:45:00Z",
      processingNotes: "Acesso concedido ao Discord.",
      trackingNumber: null,
      deliveryAddress: undefined
    },
    {
      id: 4,
      orderId: "ORD-2023-0004",
      userId: 4,
      userName: "Ana Luiza",
      userEmail: "analuiza@exemplo.com",
      itemId: 5,
      itemName: "Boné FURIA Especial",
      itemType: "physical",
      price: 350,
      status: "shipped",
      createdAt: "2023-04-25T13:15:00Z",
      updatedAt: "2023-04-27T14:30:00Z",
      processingNotes: "Produto enviado via Sedex.",
      trackingNumber: "BR4567890123",
      deliveryAddress: {
        street: "Avenida Paulista",
        number: "1578",
        complement: "Sala 304",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-200",
        country: "Brasil"
      }
    },
    {
      id: 5,
      orderId: "ORD-2023-0005",
      userId: 5,
      userName: "Pedro Costa",
      userEmail: "pedro.costa@exemplo.com",
      itemId: 4,
      itemName: "Acesso VIP Evento SãoPaulo",
      itemType: "event",
      price: 1500,
      status: "cancelled",
      createdAt: "2023-04-24T10:10:00Z",
      updatedAt: "2023-04-24T15:30:00Z",
      processingNotes: "Pedido cancelado a pedido do usuário.",
      trackingNumber: null,
      deliveryAddress: undefined
    }
  ];
  
  const displayOrders = data?.orders || mockRedemptionOrders;
  
  const handleOrderView = (order: RedemptionOrder) => {
    setSelectedOrder(order);
    setProcessingNotes(order.processingNotes || "");
    setTrackingNumber(order.trackingNumber || "");
    setShowOrderDialog(true);
  };
  
  // Status do pedido em formato badge
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pendente</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Processando</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50">Enviado</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Concluído</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Tipo do item em formato legível
  const getItemTypeDisplay = (type: string) => {
    switch (type) {
      case "physical":
        return "Físico";
      case "digital":
        return "Digital";
      case "event":
        return "Evento";
      default:
        return type;
    }
  };
  
  // Formata data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Atualizar status do pedido
  const updateOrderStatus = (newStatus: string) => {
    // Esta seria a chamada para a API real
    console.log(`Atualizando pedido ${selectedOrder?.orderId} para status: ${newStatus}`);
    // apiRequest('PATCH', `/api/admin/shop/redemptions/${selectedOrder?.id}`, { 
    //   status: newStatus,
    //   processingNotes,
    //   trackingNumber
    // });
    
    // Feedback visual temporário
    setSelectedOrder(selectedOrder ? {
      ...selectedOrder,
      status: newStatus,
      processingNotes,
      trackingNumber
    } : null);
    
    // Em um caso real, fecharíamos o dialog após a atualização bem-sucedida
    // setShowOrderDialog(false);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Resgates</h2>
          <Button variant="outline" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Exportar Pedidos
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Pedidos de Resgate</CardTitle>
            <CardDescription>
              Acompanhe e gerencie os resgates de produtos da loja FURIA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros e pesquisa */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex items-center flex-1">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Buscar pedido ou usuário..." 
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-36">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="shipped">Enviados</SelectItem>
                      <SelectItem value="completed">Concluídos</SelectItem>
                      <SelectItem value="cancelled">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-36">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="physical">Físico</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Tabela de pedidos */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor (Coins)</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderId}</TableCell>
                        <TableCell>
                          <div className="font-medium">{order.userName}</div>
                          <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={order.itemName}>
                          {order.itemName}
                        </TableCell>
                        <TableCell>{getItemTypeDisplay(order.itemType)}</TableCell>
                        <TableCell>{order.price}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOrderView(order)}>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              
                              {order.status === "pending" && (
                                <DropdownMenuItem>
                                  <Check className="h-4 w-4 mr-2" />
                                  Iniciar processamento
                                </DropdownMenuItem>
                              )}
                              
                              {(order.status === "pending" || order.status === "processing") && (
                                <DropdownMenuItem>
                                  <TruckIcon className="h-4 w-4 mr-2" />
                                  Marcar como enviado
                                </DropdownMenuItem>
                              )}
                              
                              {order.status !== "completed" && order.status !== "cancelled" && (
                                <DropdownMenuItem>
                                  <Check className="h-4 w-4 mr-2" />
                                  Marcar como concluído
                                </DropdownMenuItem>
                              )}
                              
                              {order.status !== "cancelled" && (
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancelar pedido
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Paginação */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Exibindo {displayOrders.length} de {data?.totalCount || displayOrders.length} resultados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === (data?.pageCount || 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog de detalhes do pedido */}
      {selectedOrder && (
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido: {selectedOrder.orderId}</DialogTitle>
              <DialogDescription>
                Gerenciamento e informações detalhadas do pedido
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="user">Usuário</TabsTrigger>
                <TabsTrigger value="actions">Ações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="font-medium">Número do Pedido:</dt>
                          <dd>{selectedOrder.orderId}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Data:</dt>
                          <dd>{formatDate(selectedOrder.createdAt)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Status:</dt>
                          <dd>{getOrderStatusBadge(selectedOrder.status)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Última Atualização:</dt>
                          <dd>{formatDate(selectedOrder.updatedAt)}</dd>
                        </div>
                        {selectedOrder.trackingNumber && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Código de Rastreio:</dt>
                            <dd>{selectedOrder.trackingNumber}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Produto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="font-medium">Nome:</dt>
                          <dd>{selectedOrder.itemName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">ID do Produto:</dt>
                          <dd>{selectedOrder.itemId}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Tipo:</dt>
                          <dd>{getItemTypeDisplay(selectedOrder.itemType)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Valor:</dt>
                          <dd>{selectedOrder.price} FURIA Coins</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
                
                {selectedOrder.deliveryAddress && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Endereço de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.number}
                        {selectedOrder.deliveryAddress.complement && `, ${selectedOrder.deliveryAddress.complement}`}
                        <br />
                        {selectedOrder.deliveryAddress.neighborhood}, {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.state}
                        <br />
                        CEP {selectedOrder.deliveryAddress.zipCode}
                        <br />
                        {selectedOrder.deliveryAddress.country}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Notas de Processamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.processingNotes ? (
                      <p className="whitespace-pre-line">{selectedOrder.processingNotes}</p>
                    ) : (
                      <p className="text-muted-foreground">Nenhuma nota de processamento disponível.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="user" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Usuário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium">ID:</dt>
                        <dd>{selectedOrder.userId}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Nome:</dt>
                        <dd>{selectedOrder.userName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Email:</dt>
                        <dd>{selectedOrder.userEmail}</dd>
                      </div>
                    </dl>
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        Ver Perfil Completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Exibindo apenas o pedido atual. Clique em "Ver Perfil Completo" para visualizar todo o histórico de pedidos deste usuário.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Atualizar Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="status">
                            <AccordionTrigger>Mudar Status do Pedido</AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {selectedOrder.status !== "processing" && (
                                  <Button 
                                    variant="outline" 
                                    className="justify-start"
                                    onClick={() => updateOrderStatus("processing")}
                                    disabled={selectedOrder.status === "completed" || selectedOrder.status === "cancelled"}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Processando
                                  </Button>
                                )}
                                
                                {selectedOrder.status !== "shipped" && selectedOrder.itemType === "physical" && (
                                  <Button 
                                    variant="outline" 
                                    className="justify-start"
                                    onClick={() => updateOrderStatus("shipped")}
                                    disabled={selectedOrder.status === "completed" || selectedOrder.status === "cancelled"}
                                  >
                                    <TruckIcon className="mr-2 h-4 w-4" />
                                    Enviado
                                  </Button>
                                )}
                                
                                {selectedOrder.status !== "completed" && (
                                  <Button 
                                    variant="outline" 
                                    className="justify-start"
                                    onClick={() => updateOrderStatus("completed")}
                                    disabled={selectedOrder.status === "cancelled"}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Concluído
                                  </Button>
                                )}
                                
                                {selectedOrder.status !== "cancelled" && (
                                  <Button 
                                    variant="outline" 
                                    className="justify-start text-red-600"
                                    onClick={() => updateOrderStatus("cancelled")}
                                    disabled={selectedOrder.status === "completed"}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelado
                                  </Button>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="processing-notes">Notas de Processamento</Label>
                        <Textarea 
                          id="processing-notes" 
                          placeholder="Adicione notas sobre o processamento deste pedido"
                          rows={3}
                          value={processingNotes}
                          onChange={(e) => setProcessingNotes(e.target.value)}
                        />
                      </div>
                      
                      {selectedOrder.itemType === "physical" && (
                        <div className="space-y-2">
                          <Label htmlFor="tracking-number">Número de Rastreio</Label>
                          <Input 
                            id="tracking-number" 
                            placeholder="Informe o código de rastreio"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                          />
                        </div>
                      )}
                      
                      <Button className="w-full">
                        Salvar Alterações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Adicionais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        Enviar Email para o Usuário
                      </Button>
                      <Button variant="outline" className="w-full">
                        Gerar Nota Fiscal
                      </Button>
                      <Button variant="outline" className="w-full">
                        Imprimir Etiqueta de Envio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}