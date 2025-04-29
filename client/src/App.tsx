import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import ProfilePage from "@/pages/profile-page";
import ShopPage from "@/pages/shop-page";
import ContentPage from "@/pages/content-page";
import SchedulePage from "@/pages/schedule-page";
import LivePage from "@/pages/live-page";
import SurveysPage from "@/pages/surveys-page";
import SettingsPage from "@/pages/settings-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/meu-qg" component={ProfilePage} />
      <ProtectedRoute path="/loja" component={ShopPage} />
      <ProtectedRoute path="/conteudo" component={ContentPage} />
      <ProtectedRoute path="/agenda" component={SchedulePage} />
      <ProtectedRoute path="/ao-vivo" component={LivePage} />
      <ProtectedRoute path="/pesquisas" component={SurveysPage} />
      <ProtectedRoute path="/configuracoes" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
