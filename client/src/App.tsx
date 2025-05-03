import { Switch, Route, useLocation } from "wouter";
import { queryClient, prefetchHomeData } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { useEffect, lazy, Suspense } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminProtectedRoute } from "@/lib/admin-protected-route";
// Carregamento preguiçoso (Lazy loading) para melhorar a performance
const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const HomePage = lazy(() => import("@/pages/home-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const ShopPage = lazy(() => import("@/pages/shop-page"));
const FuriaCoinsPage = lazy(() => import("@/pages/furia-coins-page"));
const ContentPage = lazy(() => import("@/pages/content-page"));
const SchedulePage = lazy(() => import("@/pages/schedule-page"));
const LivePage = lazy(() => import("@/pages/live-page"));
const SurveysPage = lazy(() => import("@/pages/surveys-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
// Páginas administrativas
const AdminLoginPage = lazy(() => import("@/pages/admin-login-page"));
const AdminDashboardPage = lazy(() => import("@/pages/admin-dashboard-page"));
const AdminUsersPage = lazy(() => import("@/pages/admin-users-page"));
const AdminShopProductsPage = lazy(() => import("@/pages/admin-shop-products-page"));
const AdminShopRedemptionsPage = lazy(() => import("@/pages/admin-shop-redemptions-page"));
const AdminContentNewsPage = lazy(() => import("@/pages/admin-content-news-page"));
const AdminSurveysPage = lazy(() => import("@/pages/admin-surveys-page"));
const AdminSupportPage = lazy(() => import("@/pages/admin-support-page"));
const AdminAuditPage = lazy(() => import("@/pages/admin-audit-page"));
const AdminFanSentimentPage = lazy(() => import("@/pages/admin-fan-sentiment-page"));
const AdminSettingsPage = lazy(() => import("@/pages/admin-settings-page"));
import BottomNav from "@/components/layout/bottom-nav";

// Componente de carregamento
const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-muted-foreground">Carregando conteúdo...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        {/* Rotas do usuário */}
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/meu-qg" component={ProfilePage} />
        <ProtectedRoute path="/furia-coins" component={FuriaCoinsPage} />
        <ProtectedRoute path="/loja" component={FuriaCoinsPage} />
        <ProtectedRoute path="/conteudo" component={ContentPage} />
        <ProtectedRoute path="/agenda" component={SchedulePage} />
        <ProtectedRoute path="/ao-vivo" component={LivePage} />
        <ProtectedRoute path="/pesquisas" component={SurveysPage} />
        <ProtectedRoute path="/configuracoes" component={SettingsPage} />
        <Route path="/auth" component={AuthPage} />
        
        {/* Rotas administrativas */}
        <Route path="/admin/login">
          <Suspense fallback={<Loading />}>
            <AdminLoginPage />
          </Suspense>
        </Route>
        <Route path="/admin/dashboard">
          <Suspense fallback={<Loading />}>
            <AdminDashboardPage />
          </Suspense>
        </Route>
        <Route path="/admin/users">
          <Suspense fallback={<Loading />}>
            <AdminUsersPage />
          </Suspense>
        </Route>
        <Route path="/admin/shop/products">
          <Suspense fallback={<Loading />}>
            <AdminShopProductsPage />
          </Suspense>
        </Route>
        <Route path="/admin/shop/redemptions">
          <Suspense fallback={<Loading />}>
            <AdminShopRedemptionsPage />
          </Suspense>
        </Route>
        <Route path="/admin/content/news">
          <Suspense fallback={<Loading />}>
            <AdminContentNewsPage />
          </Suspense>
        </Route>
        <Route path="/admin/surveys">
          <Suspense fallback={<Loading />}>
            <AdminSurveysPage />
          </Suspense>
        </Route>
        <Route path="/admin/support">
          <Suspense fallback={<Loading />}>
            <AdminSupportPage />
          </Suspense>
        </Route>
        <Route path="/admin/audit">
          <Suspense fallback={<Loading />}>
            <AdminAuditPage />
          </Suspense>
        </Route>
        <Route path="/admin/fan-sentiment">
          <Suspense fallback={<Loading />}>
            <AdminFanSentimentPage />
          </Suspense>
        </Route>
        <Route path="/admin/settings">
          <Suspense fallback={<Loading />}>
            <AdminSettingsPage />
          </Suspense>
        </Route>
        
        {/* Rota 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppContent() {
  const [location] = useLocation();
  
  // Prefetcha dados da tela inicial quando o app carrega
  useEffect(() => {
    // Carrega os dados da home apenas uma vez ao iniciar a aplicação
    const prefetch = async () => {
      // Usando requestIdleCallback para executar o prefetch quando o navegador estiver ocioso
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          prefetchHomeData();
        });
      } else {
        // Fallback para navegadores que não suportam requestIdleCallback
        setTimeout(() => {
          prefetchHomeData();
        }, 200);
      }
    };
    
    prefetch();
  }, []);
  
  // Prefetch adicional baseado na rota atual
  useEffect(() => {
    // Otimização: só carrega dados quando necessário, baseado na rota atual
    const loadRouteData = async () => {
      // Espera um pequeno tempo para não bloquear a renderização inicial
      setTimeout(() => {
        if (location === '/meu-qg') import('@/pages/profile-page');
        if (location === '/furia-coins') import('@/pages/furia-coins-page');
        if (location === '/loja') import('@/pages/furia-coins-page');
        if (location === '/conteudo') import('@/pages/content-page');
      }, 300);
    };
    
    loadRouteData();
  }, [location]);
  
  // Não mostrar o BottomNav na tela de login ou em telas administrativas
  const showBottomNav = location !== "/auth" && !location.startsWith("/admin");
  
  return (
    <>
      <Router />
      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <WebSocketProvider>
            <TooltipProvider>
              <Toaster />
              <AppContent />
            </TooltipProvider>
          </WebSocketProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
