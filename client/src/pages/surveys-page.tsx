import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";

export default function SurveysPage() {
  const { user } = useAuth();

  // Fetch active surveys
  const { data: activeSurveys, isLoading: loadingActive } = useQuery({
    queryKey: ["/api/surveys", { status: "active", responded: false }],
    queryFn: async () => {
      const res = await fetch("/api/surveys?status=active&responded=false");
      if (!res.ok) throw new Error("Failed to fetch surveys");
      return res.json();
    },
    enabled: !!user
  });

  // Fetch completed surveys
  const { data: completedSurveys, isLoading: loadingCompleted } = useQuery({
    queryKey: ["/api/surveys", { responded: true }],
    queryFn: async () => {
      const res = await fetch("/api/surveys?responded=true");
      if (!res.ok) throw new Error("Failed to fetch completed surveys");
      return res.json();
    },
    enabled: !!user
  });

  useEffect(() => {
    // Set page title
    document.title = "Pesquisas | FURIA Esports";
  }, []);

  const isLoading = loadingActive || loadingCompleted;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-4 md:flex md:gap-6">
        {/* Sidebar (desktop only) */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow">
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-rajdhani">PESQUISAS</h1>
            <p className="text-muted-foreground">Responda pesquisas e ganhe FURIA Coins</p>
          </div>
          
          {/* Active Surveys */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pesquisas disponíveis</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-muted rounded w-24"></div>
                      <div className="h-5 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeSurveys?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSurveys.map(survey => (
                  <div key={survey.id} className="bg-card rounded-xl p-6 hover:border-primary/50 border border-border transition-colors">
                    <h3 className="font-semibold text-lg mb-2">{survey.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{survey.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Tempo estimado</span>
                        <span>Recompensa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{survey.estimatedTimeMinutes} minutos</span>
                        <span className="font-semibold text-primary flex items-center">
                          {survey.reward}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v12" />
                            <path d="M8 12h8" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    
                    {survey.expirationDate && (
                      <div className="text-xs text-muted-foreground mb-4">
                        Disponível até: {new Date(survey.expirationDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    
                    <a 
                      href={`/pesquisas/${survey.id}`} 
                      className="w-full bg-primary text-white py-2 px-4 rounded-md text-center inline-block hover:bg-primary/90"
                    >
                      Responder pesquisa
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Nenhuma pesquisa disponível no momento.</p>
                <p className="mt-2">Volte em breve para novas oportunidades de ganhar FURIA Coins!</p>
              </div>
            )}
          </section>
          
          {/* Completed Surveys */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Histórico de respostas</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-muted rounded w-1/4"></div>
                      <div className="h-5 bg-muted rounded w-1/6"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
                  </div>
                ))}
              </div>
            ) : completedSurveys?.length > 0 ? (
              <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
                {completedSurveys.map(survey => (
                  <div key={survey.id} className="p-4 hover:bg-muted/50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{survey.title}</h3>
                      <span className="text-sm font-semibold text-primary flex items-center">
                        +{survey.reward}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v12" />
                          <path d="M8 12h8" />
                        </svg>
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Respondido em {new Date(survey.completedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Você ainda não respondeu nenhuma pesquisa.</p>
              </div>
            )}
          </section>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}