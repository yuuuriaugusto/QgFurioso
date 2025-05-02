import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, History, Gift, Coins } from "lucide-react";

export default function FuriaCoinsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch coin transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/users/me/coin-transactions"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/coin-transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      return data.data; // Extrair array de transactions do objeto retornado
    },
    enabled: !!user,
  });

  // Fetch shop items
  const { data: shopItems, isLoading: shopLoading } = useQuery({
    queryKey: ["/api/shop/items", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/shop/items?active=true");
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    }
  });

  // Fetch redemption history
  const { data: redemptions, isLoading: redemptionsLoading } = useQuery({
    queryKey: ["/api/users/me/redemptions"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/redemptions");
      if (!res.ok) throw new Error("Failed to fetch redemptions");
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
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
    };
    
    return typeMap[type] || { label: type, color: 'text-foreground' };
  };

  // Format redemption status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      'pending': { label: 'Pendente', color: 'text-yellow-500' },
      'processing': { label: 'Em processamento', color: 'text-blue-500' },
      'shipped': { label: 'Enviado', color: 'text-purple-500' },
      'delivered': { label: 'Entregue', color: 'text-green-500' },
      'cancelled': { label: 'Cancelado', color: 'text-red-500' },
    };
    
    return statusMap[status] || { label: status, color: 'text-foreground' };
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
                <span className="sm:hidden">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="shop" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Loja</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Histórico</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Coin stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Saldo atual</div>
                  <div className="text-2xl font-bold">{user?.coinBalance?.balance || 0}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total recebido</div>
                  <div className="text-2xl font-bold">{user?.coinBalance?.lifetimeEarned || 0}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total gasto</div>
                  <div className="text-2xl font-bold">{user?.coinBalance?.lifetimeSpent || 0}</div>
                </div>
              </div>

              {/* Recent transactions */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Transações recentes</h3>
                {transactionsLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 bg-muted rounded-md"></div>
                    ))}
                  </div>
                ) : transactions?.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</div>
                        </div>
                        <div className={`font-medium ${transaction.transactionType.includes('earn') || transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.transactionType.includes('earn') || transaction.amount > 0 ? '+' : '-'}{Math.abs(transaction.amount)}
                        </div>
                      </div>
                    ))}
                    <button 
                      className="text-primary text-sm hover:underline w-full text-center mt-2"
                      onClick={() => setActiveTab("history")}
                    >
                      Ver todas as transações
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhuma transação encontrada
                  </div>
                )}
              </div>

              {/* Featured shop items */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Produtos em destaque</h3>
                {shopLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-muted rounded-md"></div>
                        <div className="h-6 bg-muted rounded-md mt-2 w-3/4"></div>
                        <div className="h-4 bg-muted rounded-md mt-2 w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : shopItems?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shopItems.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="bg-muted/30 rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="w-full h-32 bg-muted flex items-center justify-center">
                            <Gift className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="p-3">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center">
                              <span className="font-bold">{item.coinPrice}</span>
                              <Coins className="h-4 w-4 text-primary ml-1" />
                            </div>
                            <button 
                              className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!user || (user.coinBalance?.balance || 0) < item.coinPrice}
                              onClick={() => toast({
                                title: "Função em desenvolvimento",
                                description: "O resgate de itens estará disponível em breve."
                              })}
                            >
                              Resgatar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button 
                      className="text-primary text-sm hover:underline col-span-full text-center mt-2"
                      onClick={() => setActiveTab("shop")}
                    >
                      Ver todos os produtos
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhum produto disponível
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Shop Tab */}
            <TabsContent value="shop" className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Loja FURIA Coins</h3>
                
                {shopLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-40 bg-muted rounded-md"></div>
                        <div className="h-6 bg-muted rounded-md mt-2 w-3/4"></div>
                        <div className="h-4 bg-muted rounded-md mt-2 w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : shopItems?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shopItems.map((item: any) => (
                      <div key={item.id} className="bg-muted/30 rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
                        ) : (
                          <div className="w-full h-40 bg-muted flex items-center justify-center">
                            <Gift className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-medium text-lg">{item.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center">
                              <span className="font-bold text-lg">{item.coinPrice}</span>
                              <Coins className="h-5 w-5 text-primary ml-1" />
                            </div>
                            <button 
                              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!user || (user.coinBalance?.balance || 0) < item.coinPrice}
                              onClick={() => toast({
                                title: "Função em desenvolvimento",
                                description: "O resgate de itens estará disponível em breve."
                              })}
                            >
                              Resgatar
                            </button>
                          </div>
                          {item.stock !== null && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {item.stock > 0 ? `${item.stock} em estoque` : 'Esgotado'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum produto disponível
                  </div>
                )}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              {/* Transactions history */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Histórico de transações</h3>
                
                {transactionsLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-14 bg-muted rounded-md"></div>
                    ))}
                  </div>
                ) : transactions?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-border">
                          <th className="px-4 py-2 font-medium">Data</th>
                          <th className="px-4 py-2 font-medium">Descrição</th>
                          <th className="px-4 py-2 font-medium">Tipo</th>
                          <th className="px-4 py-2 font-medium text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction: any) => {
                          const type = formatTransactionType(transaction.transactionType);
                          return (
                            <tr key={transaction.id} className="border-b border-border last:border-0">
                              <td className="px-4 py-3 text-sm">{formatDate(transaction.createdAt)}</td>
                              <td className="px-4 py-3">{transaction.description}</td>
                              <td className="px-4 py-3">
                                <span className={`text-sm px-2 py-1 rounded-full bg-muted ${type.color}`}>
                                  {type.label}
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-right font-medium ${transaction.transactionType.includes('earn') || transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {transaction.transactionType.includes('earn') || transaction.amount > 0 ? '+' : '-'}{Math.abs(transaction.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma transação encontrada
                  </div>
                )}
              </div>

              {/* Redemption history */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Histórico de resgates</h3>
                
                {redemptionsLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 bg-muted rounded-md"></div>
                    ))}
                  </div>
                ) : redemptions?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-border">
                          <th className="px-4 py-2 font-medium">Data</th>
                          <th className="px-4 py-2 font-medium">Item</th>
                          <th className="px-4 py-2 font-medium">Valor</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {redemptions.map((redemption: any) => {
                          const status = formatStatus(redemption.status);
                          return (
                            <tr key={redemption.id} className="border-b border-border last:border-0">
                              <td className="px-4 py-3 text-sm">{formatDate(redemption.createdAt)}</td>
                              <td className="px-4 py-3">{redemption.itemName}</td>
                              <td className="px-4 py-3 font-medium">{redemption.coinPrice}</td>
                              <td className="px-4 py-3">
                                <span className={`text-sm px-2 py-1 rounded-full bg-muted ${status.color}`}>
                                  {status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum resgate encontrado
                  </div>
                )}
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