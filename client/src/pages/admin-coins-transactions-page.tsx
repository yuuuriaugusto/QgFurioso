import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { 
  Loader2, 
  Search, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  MoreHorizontal, 
  Coins, 
  FileDown, 
  Eye,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";

// Tipos
type CoinTransaction = {
  id: number;
  transactionId: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  balance: number;
  transactionType: string;
  description: string | null;
  metadata: Record<string, any> | null;
  referenceId: string | null;
  createdAt: string;
  updatedAt: string;
};

type CoinTransactionsResponse = {
  transactions: CoinTransaction[];
  totalCount: number;
  totalAmount: number;
  pageCount: number;
};

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function AdminCoinsTransactionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CoinTransaction | null>(null);
  const [selectedTab, setSelectedTab] = useState<"all" | "earnings" | "expenses">("all");
  
  // Buscar transações
  const { data, isLoading } = useQuery<CoinTransactionsResponse>({
    queryKey: ["/api/admin/coins/transactions", page, typeFilter, dateRange, search, selectedTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (dateRange.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange.to) params.append("endDate", dateRange.to.toISOString());
      if (search) params.append("search", search);
      
      if (selectedTab === "earnings") {
        params.append("amountType", "positive");
      } else if (selectedTab === "expenses") {
        params.append("amountType", "negative");
      }
      
      try {
        const res = await apiRequest("GET", `/api/admin/coins/transactions?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Falha ao buscar transações");
        }
        return await res.json();
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
        // Retornando uma estrutura vazia compatível, mas que indica ausência de dados
        return {
          transactions: [],
          pagination: {
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0
          }
        };
      }
    },
  });
  
  // Mock data para visualização da interface
  const mockTransactions: CoinTransaction[] = [
    {
      id: 1,
      transactionId: "TRX-2023-0001",
      userId: 1,
      userName: "João Silva",
      userEmail: "joao.silva@exemplo.com",
      amount: 50,
      balance: 50,
      transactionType: "signup_bonus",
      description: "Bônus de cadastro",
      metadata: null,
      referenceId: null,
      createdAt: "2023-04-28T14:30:00Z",
      updatedAt: "2023-04-28T14:30:00Z"
    },
    {
      id: 2,
      transactionId: "TRX-2023-0002",
      userId: 2,
      userName: "Maria Santos",
      userEmail: "maria.santos@exemplo.com",
      amount: 10,
      balance: 60,
      transactionType: "daily_login",
      description: "Login diário",
      metadata: null,
      referenceId: null,
      createdAt: "2023-04-27T09:45:00Z",
      updatedAt: "2023-04-27T09:45:00Z"
    },
    {
      id: 3,
      transactionId: "TRX-2023-0003",
      userId: 1,
      userName: "João Silva",
      userEmail: "joao.silva@exemplo.com",
      amount: 25,
      balance: 75,
      transactionType: "survey_completion",
      description: "Resposta à pesquisa #12: Preferências de jogo",
      metadata: {
        surveyId: 12,
        surveyTitle: "Preferências de jogo"
      },
      referenceId: "SURVEY-12",
      createdAt: "2023-04-26T16:20:00Z",
      updatedAt: "2023-04-26T16:20:00Z"
    },
    {
      id: 4,
      transactionId: "TRX-2023-0004",
      userId: 3,
      userName: "Carlos Oliveira",
      userEmail: "carlos.oliveira@exemplo.com",
      amount: -500,
      balance: 50,
      transactionType: "redemption",
      description: "Resgate de produto: Camisa FURIA Oficial",
      metadata: {
        productId: 1,
        productName: "Camisa FURIA Oficial",
        redemptionId: "ORD-2023-0001"
      },
      referenceId: "ORD-2023-0001",
      createdAt: "2023-04-25T13:15:00Z",
      updatedAt: "2023-04-25T13:15:00Z"
    },
    {
      id: 5,
      transactionId: "TRX-2023-0005",
      userId: 4,
      userName: "Ana Luiza",
      userEmail: "analuiza@exemplo.com",
      amount: 5,
      balance: 20,
      transactionType: "stream_watching",
      description: "Assistir transmissão por 30 minutos",
      metadata: {
        streamId: 156,
        streamTitle: "FURIA vs Team Liquid - IEM Katowice"
      },
      referenceId: "STREAM-156",
      createdAt: "2023-04-24T10:10:00Z",
      updatedAt: "2023-04-24T10:10:00Z"
    },
    {
      id: 6,
      transactionId: "TRX-2023-0006",
      userId: 2,
      userName: "Maria Santos",
      userEmail: "maria.santos@exemplo.com",
      amount: 100,
      balance: 160,
      transactionType: "referral",
      description: "Indicação de amigo: Pedro Costa",
      metadata: {
        referredUserId: 5,
        referredUserName: "Pedro Costa"
      },
      referenceId: "USER-5",
      createdAt: "2023-04-23T15:30:00Z",
      updatedAt: "2023-04-23T15:30:00Z"
    },
    {
      id: 7,
      transactionId: "TRX-2023-0007",
      userId: 1,
      userName: "João Silva",
      userEmail: "joao.silva@exemplo.com",
      amount: -150,
      balance: -75,
      transactionType: "redemption",
      description: "Resgate de produto: Emoji Exclusivo (Discord)",
      metadata: {
        productId: 3,
        productName: "Emoji Exclusivo (Discord)",
        redemptionId: "ORD-2023-0003"
      },
      referenceId: "ORD-2023-0003",
      createdAt: "2023-04-22T09:40:00Z",
      updatedAt: "2023-04-22T09:40:00Z"
    },
    {
      id: 8,
      transactionId: "TRX-2023-0008",
      userId: 3,
      userName: "Carlos Oliveira",
      userEmail: "carlos.oliveira@exemplo.com",
      amount: 25,
      balance: 75,
      transactionType: "streak_bonus",
      description: "Bônus por 7 dias consecutivos de login",
      metadata: null,
      referenceId: null,
      createdAt: "2023-04-21T08:15:00Z",
      updatedAt: "2023-04-21T08:15:00Z"
    },
    {
      id: 9,
      transactionId: "TRX-2023-0009",
      userId: 5,
      userName: "Pedro Costa",
      userEmail: "pedro.costa@exemplo.com",
      amount: 50,
      balance: 50,
      transactionType: "admin_adjustment",
      description: "Ajuste administrativo: compensação por erro na plataforma",
      metadata: {
        adminId: 1,
        adminName: "Admin",
        reason: "Compensação por erro técnico"
      },
      referenceId: "ADM-2023-001",
      createdAt: "2023-04-20T14:25:00Z",
      updatedAt: "2023-04-20T14:25:00Z"
    },
    {
      id: 10,
      transactionId: "TRX-2023-0010",
      userId: 4,
      userName: "Ana Luiza",
      userEmail: "analuiza@exemplo.com",
      amount: 15,
      balance: 35,
      transactionType: "social_share",
      description: "Compartilhamento em rede social",
      metadata: {
        platform: "twitter",
        postId: "1234567890"
      },
      referenceId: "SHARE-1234567890",
      createdAt: "2023-04-19T11:50:00Z",
      updatedAt: "2023-04-19T11:50:00Z"
    }
  ];
  
  // Função para filtrar dados mock baseado nos filtros selecionados
  const filterMockData = () => {
    let filtered = [...mockTransactions];
    
    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.userName.toLowerCase().includes(searchLower) || 
        tx.userEmail.toLowerCase().includes(searchLower) ||
        tx.transactionId.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter(tx => tx.transactionType === typeFilter);
    }
    
    // Filtrar por aba (positivo/negativo)
    if (selectedTab === "earnings") {
      filtered = filtered.filter(tx => tx.amount > 0);
    } else if (selectedTab === "expenses") {
      filtered = filtered.filter(tx => tx.amount < 0);
    }
    
    // Filtrar por data
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.createdAt);
        if (dateRange.from && dateRange.to) {
          return txDate >= dateRange.from && txDate <= dateRange.to;
        } else if (dateRange.from) {
          return txDate >= dateRange.from;
        } else if (dateRange.to) {
          return txDate <= dateRange.to;
        }
        return true;
      });
    }
    
    // Calcular totais
    const totalAmount = filtered.reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      transactions: filtered.slice((page - 1) * 10, page * 10),
      totalCount: filtered.length,
      totalAmount,
      pageCount: Math.ceil(filtered.length / 10)
    };
  };
  
  const displayTransactions = data?.transactions || [];
  
  const handleViewTransaction = (transaction: CoinTransaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDialog(true);
  };
  
  // Formata data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  };
  
  // Tipo da transação em formato legível
  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case "signup_bonus":
        return "Bônus de cadastro";
      case "daily_login":
        return "Login diário";
      case "survey_completion":
        return "Pesquisa";
      case "redemption":
        return "Resgate";
      case "stream_watching":
        return "Assistir transmissão";
      case "referral":
        return "Indicação";
      case "streak_bonus":
        return "Bônus de streak";
      case "admin_adjustment":
        return "Ajuste administrativo";
      case "social_share":
        return "Compartilhamento";
      default:
        return type;
    }
  };
  
  // Obter badge para tipo de transação
  const getTransactionTypeBadge = (type: string) => {
    let className = "";
    
    switch (type) {
      case "signup_bonus":
        className = "bg-green-50 text-green-700";
        break;
      case "daily_login":
        className = "bg-blue-50 text-blue-700";
        break;
      case "survey_completion":
        className = "bg-purple-50 text-purple-700";
        break;
      case "redemption":
        className = "bg-red-50 text-red-700";
        break;
      case "stream_watching":
        className = "bg-indigo-50 text-indigo-700";
        break;
      case "referral":
        className = "bg-yellow-50 text-yellow-700";
        break;
      case "streak_bonus":
        className = "bg-green-50 text-green-700";
        break;
      case "admin_adjustment":
        className = "bg-gray-50 text-gray-700";
        break;
      case "social_share":
        className = "bg-pink-50 text-pink-700";
        break;
      default:
        className = "bg-gray-50 text-gray-700";
        break;
    }
    
    return (
      <Badge variant="outline" className={`font-normal ${className}`}>
        {getTransactionTypeDisplay(type)}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Transações FURIA Coins</h2>
          <Button variant="outline" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>
              Visualize e gerencie todas as transações de FURIA Coins realizadas na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={selectedTab} onValueChange={(value) => setSelectedTab(value as "all" | "earnings" | "expenses")}>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="all" className="text-xs md:text-sm">Todas Transações</TabsTrigger>
                  <TabsTrigger value="earnings" className="text-xs md:text-sm">Recebimentos</TabsTrigger>
                  <TabsTrigger value="expenses" className="text-xs md:text-sm">Gastos</TabsTrigger>
                </TabsList>
                
                <div className="flex flex-col md:flex-row gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-xs md:text-sm"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          "Selecionar período"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <DatePickerWithRange
                        selectedRange={dateRange}
                        onSelect={setDateRange}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Filtros e pesquisa */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex items-center flex-1">
                  <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Buscar por usuário ou ID..." 
                      className="pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-full md:w-56">
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="signup_bonus">Bônus de cadastro</option>
                      <option value="daily_login">Login diário</option>
                      <option value="survey_completion">Pesquisa</option>
                      <option value="redemption">Resgate</option>
                      <option value="stream_watching">Assistir transmissão</option>
                      <option value="referral">Indicação</option>
                      <option value="streak_bonus">Bônus de streak</option>
                      <option value="admin_adjustment">Ajuste administrativo</option>
                      <option value="social_share">Compartilhamento</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <TabsContent value="all" className="space-y-4">
                {renderTransactionsTable()}
              </TabsContent>
              
              <TabsContent value="earnings" className="space-y-4">
                {renderTransactionsTable("earnings")}
              </TabsContent>
              
              <TabsContent value="expenses" className="space-y-4">
                {renderTransactionsTable("expenses")}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog de detalhes da transação */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Transação
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a transação {selectedTransaction?.transactionId}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">ID da Transação</h3>
                  <p className="font-medium">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Data</h3>
                  <p className="font-medium">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Usuário</h3>
                  <p className="font-medium">{selectedTransaction.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.userEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tipo</h3>
                  <div>{getTransactionTypeBadge(selectedTransaction.transactionType)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Valor</h3>
                  <p className={`text-2xl font-bold ${selectedTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.amount > 0 ? '+' : ''}{selectedTransaction.amount}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Saldo Após Transação</h3>
                  <p className="text-xl font-medium">{selectedTransaction.balance}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h3>
                <p className="text-sm">{selectedTransaction.description || "Sem descrição"}</p>
              </div>
              
              {selectedTransaction.referenceId && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">ID de Referência</h3>
                  <p className="font-medium">{selectedTransaction.referenceId}</p>
                </div>
              )}
              
              {selectedTransaction.metadata && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Metadados</h3>
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-40">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
  
  function renderTransactionsTable(filter?: "earnings" | "expenses") {
    return (
      <>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTransactions.length > 0 ? (
                    displayTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.transactionId}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{transaction.userName}</span>
                            <span className="text-xs text-muted-foreground">{transaction.userEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTransactionTypeBadge(transaction.transactionType)}</TableCell>
                        <TableCell>
                          <div className="whitespace-nowrap">{formatDate(transaction.createdAt)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'} flex items-center justify-end`}>
                            {transaction.amount > 0 ? (
                              <ArrowUpCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownCircle className="h-4 w-4 mr-1" />
                            )}
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewTransaction(transaction)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalhes</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhuma transação encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-2 items-center mt-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>
                  {displayTransactions.length} de {data?.totalCount || 0} transações
                </span>
                <Badge variant="outline" className="ml-2">
                  {filter === "earnings" ? "Recebidos" : filter === "expenses" ? "Gastos" : "Total"}:{" "}
                  <span className={filter === "expenses" ? "text-red-600" : filter === "earnings" ? "text-green-600" : ""}>
                    {data?.totalAmount || 0}
                  </span>
                </Badge>
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
          </>
        )}
      </>
    );
  }
}