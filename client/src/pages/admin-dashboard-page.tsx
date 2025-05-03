import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Loader2, Users, CoinsIcon, Inbox, BarChart, LineChart, TrendingUp, Activity } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DashboardMetrics = {
  totalUsers: number;
  activeUsers: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  newRegistrations: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  totalCoins: {
    inCirculation: number;
    earned: number;
    spent: number;
  };
  pendingRedemptions: number;
};

export default function AdminDashboardPage() {
  // Buscar métricas do dashboard
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/admin/dashboard/metrics"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/dashboard/metrics");
      if (!res.ok) {
        throw new Error("Falha ao carregar métricas");
      }
      return await res.json();
    },
    enabled: true, // Temporariamente habilitado para desenvolvimento
  });

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-2">
            <Select defaultValue="30d">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {metricsLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Card de Usuários */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.newRegistrations.last24h || 0} novos nas últimas 24h
                </p>
              </CardContent>
            </Card>

            {/* Card de Usuários Ativos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeUsers.last7d || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Ativos nos últimos 7 dias
                </p>
              </CardContent>
            </Card>

            {/* Card de FURIA Coins */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FURIA Coins</CardTitle>
                <CoinsIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalCoins.inCirculation || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Em circulação
                </p>
              </CardContent>
            </Card>

            {/* Card de Resgates Pendentes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resgates Pendentes</CardTitle>
                <Inbox className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.pendingRedemptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando processamento
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Abas de Dados Detalhados */}
        <Tabs defaultValue="users" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="coins">FURIA Coins</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4 space-y-6">
            {/* Gráficos e detalhamento de usuários */}
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Usuários</CardTitle>
                <CardDescription>
                  Tendência de novos registros ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <LineChart className="h-16 w-16" />
                  <span className="ml-4">Gráfico de crescimento de usuários</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Ativos</CardTitle>
                  <CardDescription>
                    Atividade por período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border p-3">
                        <div className="text-xs font-medium">Últimas 24h</div>
                        <div className="mt-1 text-xl font-bold">{metrics?.activeUsers.last24h || 0}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs font-medium">Últimos 7 dias</div>
                        <div className="mt-1 text-xl font-bold">{metrics?.activeUsers.last7d || 0}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs font-medium">Últimos 30 dias</div>
                        <div className="mt-1 text-xl font-bold">{metrics?.activeUsers.last30d || 0}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Novos Usuários</CardTitle>
                  <CardDescription>
                    Registros por período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border p-3">
                        <div className="text-xs font-medium">Últimas 24h</div>
                        <div className="mt-1 text-xl font-bold">{metrics?.newRegistrations.last24h || 0}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs font-medium">Últimos 7 dias</div>
                        <div className="mt-1 text-xl font-bold">{metrics?.newRegistrations.last7d || 0}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs font-medium">Últimos 30 dias</div>
                        <div className="mt-1 text-xl font-bold">{metrics?.newRegistrations.last30d || 0}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="coins" className="mt-4 space-y-6">
            {/* Gráficos e detalhamento de FURIA Coins */}
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de FURIA Coins</CardTitle>
                <CardDescription>
                  Transações de FURIA Coins ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-16 w-16" />
                  <span className="ml-4">Gráfico de fluxo de FURIA Coins</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transações de FURIA Coins</CardTitle>
                  <CardDescription>
                    Resumo das transações de moedas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border p-3">
                        <div className="text-xs font-medium">Em Circulação</div>
                        <div className="mt-1 text-xl font-bold">{metrics?.totalCoins.inCirculation || 0}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs font-medium">Moedas Ganhas</div>
                        <div className="mt-1 text-xl font-bold">{metrics?.totalCoins.earned || 0}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs font-medium">Moedas Gastas</div>
                        <div className="mt-1 text-xl font-bold">{metrics?.totalCoins.spent || 0}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Fontes de Recompensas</CardTitle>
                  <CardDescription>
                    Principais maneiras que os usuários ganham moedas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 flex items-center justify-center text-muted-foreground">
                    <BarChart className="h-12 w-12" />
                    <span className="ml-4">Gráfico de fontes de recompensas</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4 space-y-6">
            {/* Atividade geral da plataforma */}
            <Card>
              <CardHeader>
                <CardTitle>Engajamento da Plataforma</CardTitle>
                <CardDescription>
                  Visão geral da atividade dos usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <Activity className="h-16 w-16" />
                  <span className="ml-4">Gráfico de engajamento da plataforma</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pesquisas e Enquetes</CardTitle>
                  <CardDescription>
                    Taxa de participação em pesquisas
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-40">
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <ListChecks className="h-12 w-12" />
                    <span className="ml-4">Dados de participação em pesquisas</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo</CardTitle>
                  <CardDescription>
                    Visualizações e interações com notícias
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-40">
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <FileText className="h-12 w-12" />
                    <span className="ml-4">Dados de conteúdo e visualizações</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}