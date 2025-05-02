import { Switch, Route, useLocation } from "wouter";
import { queryClient, prefetchHomeData } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ReactNode, useEffect, lazy, Suspense } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
// Carregamento preguiçoso (Lazy loading) para melhorar a performance
const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const HomePage = lazy(() => import("@/pages/home-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const ShopPage = lazy(() => import("@/pages/shop-page"));
const ContentPage = lazy(() => import("@/pages/content-page"));
const SchedulePage = lazy(() => import("@/pages/schedule-page"));
const LivePage = lazy(() => import("@/pages/live-page"));
const SurveysPage = lazy(() => import("@/pages/surveys-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
// Remover a importação do WebSocketTestPage até configurar corretamente o WebSocketProvider
import BottomNav from "@/components/layout/bottom-nav";

// WebSocketProvider fallback até que o provider real seja configurado
const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

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
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/meu-qg" component={ProfilePage} />
        <ProtectedRoute path="/furia-coins" component={ShopPage} />
        <ProtectedRoute path="/conteudo" component={ContentPage} />
        <ProtectedRoute path="/agenda" component={SchedulePage} />
        <ProtectedRoute path="/ao-vivo" component={LivePage} />
        <ProtectedRoute path="/pesquisas" component={SurveysPage} />
        <ProtectedRoute path="/configuracoes" component={SettingsPage} />
        <Route path="/auth" component={AuthPage} />
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
    prefetchHomeData();
  }, []);
  
  // Não mostrar o BottomNav na tela de login
  const showBottomNav = location !== "/auth";
  
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
