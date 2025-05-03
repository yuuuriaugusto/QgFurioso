import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, Users, CoinsIcon, Inbox, BarChart, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  // Temporariamente desabilitado para acesso direto
  const { admin, isLoading: authLoading, logoutMutation } = useAdminAuth();
  const [_, setLocation] = useLocation();
  
  /*
  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !admin) {
      setLocation("/admin/login");
    }
  }, [admin, authLoading, setLocation]);
  */

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

  // Handler para logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/admin/login");
      },
    });
  };

  // Temporariamente desabilitado para desenvolvimento
  /*if (authLoading || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }*/
  
  // Dados do admin mockados para visualização
  const mockAdmin = admin || { 
    name: "Visualização", 
    email: "admin@furia.com"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Painel Administrativo FURIA</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Logado como: </span>
              <span className="font-medium">{mockAdmin.name || mockAdmin.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>

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
                <BarChart className="h-4 w-4 text-muted-foreground" />
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

        {/* Seção de Métricas Detalhadas */}
        {!metricsLoading && metrics && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atividade de Usuários</CardTitle>
                <CardDescription>
                  Resumo das atividades de usuários por período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium">Últimas 24h</div>
                      <div className="mt-1 text-xl font-bold">{metrics.activeUsers.last24h}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium">Últimos 7 dias</div>
                      <div className="mt-1 text-xl font-bold">{metrics.activeUsers.last7d}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium">Últimos 30 dias</div>
                      <div className="mt-1 text-xl font-bold">{metrics.activeUsers.last30d}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Usuários que realizaram login nos respectivos períodos
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transações de FURIA Coins</CardTitle>
                <CardDescription>
                  Resumo das transações de moedas na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium">Em Circulação</div>
                      <div className="mt-1 text-xl font-bold">{metrics.totalCoins.inCirculation}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium">Moedas Ganhas</div>
                      <div className="mt-1 text-xl font-bold">{metrics.totalCoins.earned}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium">Moedas Gastas</div>
                      <div className="mt-1 text-xl font-bold">{metrics.totalCoins.spent}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Todas as transações de moedas realizadas na plataforma
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}