import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  History, 
  Gift, 
  Coins, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Calendar,
  Clock,
  Package,
  BookOpen,
  Award,
  Sparkles,
  Target,
  Check,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function FuriaCoinsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'earned' | 'spent'>('all');

  // Fetch coin transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/users/me/coin-transactions"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/coin-transactions");
      if (!res.ok) throw new Error("Falha ao buscar transações");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch shop items
  const { data: shopItems, isLoading: shopLoading } = useQuery({
    queryKey: ["/api/shop/items", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/shop/items?active=true");
      if (!res.ok) throw new Error("Falha ao buscar itens da loja");
      return res.json();
    }
  });

  // Fetch redemption history
  const { data: redemptions, isLoading: redemptionsLoading } = useQuery({
    queryKey: ["/api/users/me/redemptions"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/redemptions");
      if (!res.ok) throw new Error("Falha ao buscar histórico de resgates");
      return res.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    // Set page title
    document.title = "FURIA Coins | FURIA Esports";
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy • HH:mm", { locale: pt });
  };

  // Format transaction type
  const formatTransactionType = (type: string) => {
    const typeMap: Record<string, { label: string, color: string }> = {
      'earning': { label: 'Recebido', color: 'text-green-500' },
      'signup_bonus': { label: 'Bônus de cadastro', color: 'text-green-500' },
      'purchase': { label: 'Compra', color: 'text-red-500' },
      'redemption': { label: 'Resgate', color: 'text-red-500' },
      'reward': { label: 'Recompensa', color: 'text-green-500' },
      'survey_completion': { label: 'Pesquisa', color: 'text-green-500' },
      'referral': { label: 'Indicação', color: 'text-green-500' },
      'admin_adjustment': { label: 'Ajuste administrativo', color: 'text-blue-500' },
    };
    
    return typeMap[type] || { label: type, color: 'text-foreground' };
  };

  // Filter transactions by type
  const getFilteredTransactions = (type: 'earned' | 'spent' | 'all') => {
    if (!transactions) return [];
    
    if (type === 'all') return transactions;
    
    const positiveTypes = ['earning', 'signup_bonus', 'reward', 'survey_completion', 'referral', 'admin_adjustment'];
    const negativeTypes = ['purchase', 'redemption'];
    
    return transactions.filter(tx => 
      type === 'earned' 
        ? positiveTypes.includes(tx.transactionType)
        : negativeTypes.includes(tx.transactionType)
    );
  };

  // Get formatted status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: "default" | "outline" | "secondary" | "destructive" }> = {
      'completed': { label: 'Concluído', variant: 'default' },
      'pending': { label: 'Pendente', variant: 'outline' },
      'processing': { label: 'Em processamento', variant: 'secondary' },
      'cancelled': { label: 'Cancelado', variant: 'destructive' },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
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
              <h1 className="text-2xl font-bold font-rajdhani">FURIA COINS</h1>
              <p className="text-muted-foreground">Gerencie suas moedas e resgate recompensas exclusivas</p>
            </div>
            
            {user?.coinBalance && (
              <div className="bg-card border border-primary rounded-lg px-6 py-3 flex items-center">
                <Coins className="h-5 w-5 text-primary mr-2" />
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Saldo disponível</div>
                  <div className="text-2xl font-bold">{user.coinBalance.balance}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Transações</span>
              </TabsTrigger>
              <TabsTrigger value="redemptions" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Resgates</span>
              </TabsTrigger>
              <TabsTrigger value="point-rules" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Regras de Pontos</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Coin Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="text-muted-foreground mb-1 text-sm">Saldo disponível</div>
                  <div className="text-3xl font-bold font-rajdhani flex items-center">
                    {user?.coinBalance?.balance || 0}
                    <Coins className="h-5 w-5 text-primary ml-2" />
                  </div>
                </div>
                
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="text-muted-foreground mb-1 text-sm">Total ganho</div>
                  <div className="text-3xl font-bold font-rajdhani text-green-500 flex items-center">
                    {user?.coinBalance?.lifetimeEarned || 0}
                    <ArrowUpCircle className="h-5 w-5 ml-2" />
                  </div>
                </div>
                
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="text-muted-foreground mb-1 text-sm">Total gasto</div>
                  <div className="text-3xl font-bold font-rajdhani text-red-500 flex items-center">
                    {user?.coinBalance?.lifetimeSpent || 0}
                    <ArrowDownCircle className="h-5 w-5 ml-2" />
                  </div>
                </div>
              </div>
              
              {/* Recent Transactions */}
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold font-rajdhani">Transações Recentes</h2>
                  <button 
                    className="text-primary text-sm hover:underline flex items-center"
                    onClick={() => setActiveTab("transactions")}
                  >
                    Ver todas
                    <ArrowUpCircle className="h-3 w-3 ml-1 rotate-90" />
                  </button>
                </div>
                
                {transactionsLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between p-3 border-b">
                        <div className="flex gap-3 items-center">
                          <div className="bg-muted h-8 w-8 rounded-full"></div>
                          <div>
                            <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                            <div className="h-3 bg-muted rounded w-24"></div>
                          </div>
                        </div>
                        <div className="h-5 bg-muted rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="space-y-1">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between p-3 border-b last:border-0 items-center">
                        <div className="flex gap-3 items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            transaction.amount > 0 ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
                          }`}>
                            {transaction.amount > 0 ? 
                              <ArrowUpCircle className="h-5 w-5" /> : 
                              <ArrowDownCircle className="h-5 w-5" />
                            }
                          </div>
                          <div>
                            <div className={`font-medium ${formatTransactionType(transaction.transactionType).color}`}>
                              {formatTransactionType(transaction.transactionType).label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(transaction.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhuma transação encontrada.
                  </div>
                )}
              </div>
              
              {/* Recent Redemptions */}
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold font-rajdhani">Resgates Recentes</h2>
                  <button 
                    className="text-primary text-sm hover:underline flex items-center"
                    onClick={() => setActiveTab("redemptions")}
                  >
                    Ver todos
                    <ArrowUpCircle className="h-3 w-3 ml-1 rotate-90" />
                  </button>
                </div>
                
                {redemptionsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                            <div className="h-3 bg-muted rounded w-48"></div>
                          </div>
                          <div className="h-6 bg-muted rounded w-16"></div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="h-3 bg-muted rounded w-24"></div>
                          <div className="h-5 bg-muted rounded w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : redemptions && redemptions.length > 0 ? (
                  <div className="space-y-4">
                    {redemptions.slice(0, 3).map((redemption) => (
                      <div key={redemption.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{redemption.shopItem.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{redemption.shopItem.description}</p>
                          </div>
                          {getStatusBadge(redemption.status)}
                        </div>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <div className="text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(redemption.createdAt)}
                          </div>
                          <div className="font-medium flex items-center text-primary">
                            {redemption.coinAmount}
                            <Coins className="h-4 w-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Você ainda não resgatou nenhum item.
                  </div>
                )}
              </div>
              
              {/* Featured Rewards */}
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold font-rajdhani">Recompensas em Destaque</h2>
                  <a href="#rewards" className="text-primary text-sm hover:underline flex items-center" onClick={() => setActiveTab("redemptions")}>
                    Ver todas
                    <ArrowUpCircle className="h-3 w-3 ml-1 rotate-90" />
                  </a>
                </div>
                
                {shopLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-muted w-full h-32 rounded-t-lg"></div>
                        <div className="p-3 space-y-2 border border-t-0 rounded-b-lg">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                          <div className="flex justify-between items-center pt-2">
                            <div className="h-5 bg-muted rounded w-16"></div>
                            <div className="h-8 bg-muted rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : shopItems && shopItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {shopItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden hover:border-primary transition-colors">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="w-full h-32 bg-muted flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="font-bold text-primary flex items-center">
                              {item.coinPrice}
                              <Coins className="h-4 w-4 ml-1" />
                            </div>
                            <button
                              onClick={() => setActiveTab("redemptions")}
                              className="text-xs px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90"
                            >
                              Resgatar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhuma recompensa disponível no momento.
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-bold font-rajdhani mb-4">Histórico de Transações</h2>
                
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  <button 
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap ${
                      transactionFilter === 'all' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => setTransactionFilter('all')}
                  >
                    Todas
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap ${
                      transactionFilter === 'earned' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => setTransactionFilter('earned')}
                  >
                    Recebidas
                  </button>
                  <button 
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap ${
                      transactionFilter === 'spent' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => setTransactionFilter('spent')}
                  >
                    Gastas
                  </button>
                </div>
                
                {transactionsLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between p-4 border-b last:border-0">
                        <div className="flex gap-3 items-center">
                          <div className="bg-muted h-10 w-10 rounded-full"></div>
                          <div>
                            <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-48"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : transactions && getFilteredTransactions(transactionFilter).length > 0 ? (
                  <div className="space-y-1 divide-y">
                    {getFilteredTransactions(transactionFilter).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between py-4 items-center">
                        <div className="flex gap-4 items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            transaction.amount > 0 ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
                          }`}>
                            {transaction.amount > 0 ? 
                              <ArrowUpCircle className="h-6 w-6" /> : 
                              <ArrowDownCircle className="h-6 w-6" />
                            }
                          </div>
                          <div>
                            <div className={`font-medium ${formatTransactionType(transaction.transactionType).color}`}>
                              {formatTransactionType(transaction.transactionType).label}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(transaction.createdAt)}
                            </div>
                            {transaction.description && (
                              <div className="text-sm mt-1">{transaction.description}</div>
                            )}
                          </div>
                        </div>
                        <div className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {transactionFilter === 'all' 
                      ? 'Nenhuma transação encontrada.' 
                      : transactionFilter === 'earned' 
                        ? 'Nenhuma transação de moedas recebidas encontrada.'
                        : 'Nenhuma transação de moedas gastas encontrada.'
                    }
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Redemptions Tab */}
            <TabsContent value="redemptions" className="space-y-6">
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-bold font-rajdhani mb-4">Histórico de Resgates</h2>
                
                {redemptionsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="h-5 bg-muted rounded w-40 mb-1"></div>
                            <div className="h-4 bg-muted rounded w-64"></div>
                          </div>
                          <div className="h-6 bg-muted rounded w-20"></div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-5 bg-muted rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : redemptions && redemptions.length > 0 ? (
                  <div className="space-y-4">
                    {redemptions.map((redemption) => (
                      <div key={redemption.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{redemption.shopItem.name}</h3>
                            <p className="text-sm text-muted-foreground">{redemption.shopItem.description}</p>
                            
                            {redemption.deliveryInfo && (
                              <div className="mt-2 text-sm">
                                <div className="font-medium">Informações de entrega:</div>
                                <p className="text-muted-foreground">{redemption.deliveryInfo}</p>
                              </div>
                            )}
                            
                            {redemption.trackingCode && (
                              <div className="mt-2 text-sm">
                                <div className="font-medium">Código de rastreio:</div>
                                <p className="font-mono bg-muted px-2 py-1 rounded inline-block text-xs">
                                  {redemption.trackingCode}
                                </p>
                              </div>
                            )}
                          </div>
                          {getStatusBadge(redemption.status)}
                        </div>
                        <div className="flex justify-between items-center mt-4 text-sm">
                          <div className="text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(redemption.createdAt)}
                          </div>
                          <div className="font-medium flex items-center text-primary">
                            {redemption.coinAmount}
                            <Coins className="h-4 w-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Você ainda não resgatou nenhum item.
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Point Rules Tab */}
            <TabsContent value="point-rules" className="space-y-6">
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h2 className="text-xl font-bold font-rajdhani mb-4">Regras de Pontuação</h2>
                <p className="text-muted-foreground mb-6">
                  Ganhe FURIA Coins participando de diversas atividades e interagindo com a comunidade FURIA.
                  Utilize os pontos para resgatar produtos exclusivos e vantagens especiais.
                </p>
                
                <div className="space-y-6">
                  {/* Pontuação por Atividade */}
                  <div>
                    <h3 className="text-lg font-medium flex items-center mb-3">
                      <Award className="h-5 w-5 text-primary mr-2" />
                      Pontuação por Atividade
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                            <Check className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Cadastro Completo</div>
                            <div className="text-xs text-muted-foreground">Complete seu perfil com todas as informações</div>
                          </div>
                          <div className="ml-auto font-bold text-primary">
                            50 <Coins className="h-4 w-4 inline" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Responder Pesquisas</div>
                            <div className="text-xs text-muted-foreground">Sua opinião vale moedas</div>
                          </div>
                          <div className="ml-auto font-bold text-primary">
                            25-100 <Coins className="h-4 w-4 inline" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Assistir Transmissões</div>
                            <div className="text-xs text-muted-foreground">A cada 30 minutos assistindo às nossas transmissões</div>
                          </div>
                          <div className="ml-auto font-bold text-primary">
                            5 <Coins className="h-4 w-4 inline" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Login Diário</div>
                            <div className="text-xs text-muted-foreground">Acesse o aplicativo diariamente</div>
                          </div>
                          <div className="ml-auto font-bold text-primary">
                            10 <Coins className="h-4 w-4 inline" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                            <Coins className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Indicar Amigos</div>
                            <div className="text-xs text-muted-foreground">Quando um amigo se cadastrar com seu código</div>
                          </div>
                          <div className="ml-auto font-bold text-primary">
                            100 <Coins className="h-4 w-4 inline" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <div className="flex items-center mb-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                            <History className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Streak de Login</div>
                            <div className="text-xs text-muted-foreground">Bônus a cada 7 dias consecutivos</div>
                          </div>
                          <div className="ml-auto font-bold text-primary">
                            25 <Coins className="h-4 w-4 inline" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Regras e Termos */}
                  <div>
                    <h3 className="text-lg font-medium flex items-center mb-3">
                      <BookOpen className="h-5 w-5 text-primary mr-2" />
                      Regras e Termos
                    </h3>
                    <div className="bg-background p-4 rounded-lg border border-border space-y-3">
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">FURIA Coins não possuem valor monetário e não podem ser trocados por dinheiro.</p>
                      </div>
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">A disponibilidade dos produtos para resgate está sujeita ao estoque.</p>
                      </div>
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">A FURIA se reserva o direito de alterar as regras de pontuação a qualquer momento.</p>
                      </div>
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">Comportamentos abusivos ou fraudulentos resultarão na suspensão da conta e perda dos pontos.</p>
                      </div>
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">Para resgates de produtos físicos, é necessário ter o endereço completo cadastrado no perfil.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* FAQ */}
                  <div>
                    <h3 className="text-lg font-medium flex items-center mb-3">
                      <BookOpen className="h-5 w-5 text-primary mr-2" />
                      Perguntas Frequentes
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-1">Como posso ganhar mais FURIA Coins?</h4>
                        <p className="text-sm text-muted-foreground">Participe ativamente da comunidade, responda pesquisas, assista às transmissões e complete desafios especiais que são lançados periodicamente.</p>
                      </div>
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-1">Os FURIA Coins expiram?</h4>
                        <p className="text-sm text-muted-foreground">Não, seus FURIA Coins não expiram e ficarão disponíveis em sua conta enquanto ela estiver ativa.</p>
                      </div>
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-1">Como faço para resgatar produtos?</h4>
                        <p className="text-sm text-muted-foreground">Basta acessar a aba "Resgates", escolher o produto desejado e confirmar a troca. Para produtos físicos, confirme seu endereço de entrega.</p>
                      </div>
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <h4 className="font-medium mb-1">Quanto tempo leva para receber um produto físico?</h4>
                        <p className="text-sm text-muted-foreground">O prazo de entrega varia de acordo com a sua localização, mas geralmente é de 5 a 15 dias úteis após a confirmação do resgate.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}