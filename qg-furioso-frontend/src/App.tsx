import { Switch, Route, useLocation } from "wouter";
import { queryClient, prefetchHomeData } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/contexts/websocket-provider";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import { Suspense, lazy, useEffect } from "react";
import { Loader2 } from "lucide-react";
import BottomNav from "@/components/layout/bottom-nav";

// Lazy load components for better performance
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
const WebSocketTestPage = lazy(() => import("@/pages/websocket-test-page"));

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/meu-qg" component={ProfilePage} />
      <ProtectedRoute path="/loja" component={ShopPage} />
      <ProtectedRoute path="/furia-coins" component={FuriaCoinsPage} />
      <ProtectedRoute path="/conteudo" component={ContentPage} />
      <ProtectedRoute path="/agenda" component={SchedulePage} />
      <ProtectedRoute path="/ao-vivo" component={LivePage} />
      <ProtectedRoute path="/pesquisas" component={SurveysPage} />
      <ProtectedRoute path="/configuracoes" component={SettingsPage} />
      <ProtectedRoute path="/ws-test" component={WebSocketTestPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Componente de loading para usar com Suspense
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

function AppContent() {
  const [location] = useLocation();
  
  // Prefetcha dados da tela inicial quando o app carrega
  useEffect(() => {
    // Carrega os dados da home apenas uma vez ao iniciar a aplicação
    prefetchHomeData();
  }, []);
  
  // Não mostrar o BottomNav na tela de login
  const showBottomNav = location !== "/auth";
  
  return (
    <>
      <Suspense fallback={<PageLoading />}>
        <Router />
      </Suspense>
      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
