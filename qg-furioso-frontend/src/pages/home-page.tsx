import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import NextMatch from "@/components/home/next-match";
import StreamCard from "@/components/home/stream-card";
import NewsCard from "@/components/home/news-card";
import SurveyCard from "@/components/home/survey-card";
import WelcomeBanner from "@/components/home/welcome-banner";

export default function HomePage() {
  const { user } = useAuth();

  // Fetch upcoming matches
  const { data: matches } = useQuery({
    queryKey: ["/api/matches", { status: "upcoming", limit: 1 }],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=upcoming&limit=1");
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    }
  });

  // Fetch live streams
  const { data: streams } = useQuery({
    queryKey: ["/api/streams", { status: "live", limit: 3 }],
    queryFn: async () => {
      const res = await fetch("/api/streams?status=live&limit=3");
      if (!res.ok) throw new Error("Failed to fetch streams");
      return res.json();
    }
  });

  // Fetch news
  const { data: news } = useQuery({
    queryKey: ["/api/content/news", { limit: 3 }],
    queryFn: async () => {
      const res = await fetch("/api/content/news?limit=3");
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    }
  });

  // Fetch active surveys (only for authenticated users)
  const { data: surveys } = useQuery({
    queryKey: ["/api/surveys", { status: "active", responded: false }],
    queryFn: async () => {
      const res = await fetch("/api/surveys?status=active&responded=false");
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch surveys");
      }
      return res.json();
    },
    enabled: !!user
  });

  useEffect(() => {
    // Set page title
    document.title = "QG FURIOSO | FURIA Esports";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-4 md:flex md:gap-6">
        {/* Sidebar (desktop only) */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow">
          {/* Welcome Banner */}
          <WelcomeBanner />
          
          {/* Next Match Section */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-rajdhani">PRÓXIMA PARTIDA</h2>
              <a href="#/agenda" className="text-sm text-primary hover:underline">Ver agenda completa</a>
            </div>
            
            {matches && matches.length > 0 ? (
              <NextMatch match={matches[0]} />
            ) : (
              <div className="bg-card rounded-xl p-8 text-center">
                <p>Nenhuma partida agendada no momento.</p>
              </div>
            )}
          </section>
          
          {/* Live Now Section */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-rajdhani">AO VIVO AGORA</h2>
              <a href="#/ao-vivo" className="text-sm text-primary hover:underline">Ver todos</a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streams && streams.length > 0 ? (
                streams.map(stream => (
                  <StreamCard key={stream.id} stream={stream} />
                ))
              ) : (
                <div className="col-span-full bg-card rounded-xl p-8 text-center">
                  <p>Nenhuma transmissão ao vivo no momento.</p>
                </div>
              )}
            </div>
          </section>
          
          {/* Latest News Section */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-rajdhani">ÚLTIMAS NOTÍCIAS</h2>
              <a href="#/conteudo" className="text-sm text-primary hover:underline">Ver todas</a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news && news.length > 0 ? (
                news.map(item => (
                  <NewsCard key={item.id} news={item} />
                ))
              ) : (
                <div className="col-span-full bg-card rounded-xl p-8 text-center">
                  <p>Nenhuma notícia disponível no momento.</p>
                </div>
              )}
            </div>
          </section>
          
          {/* Active Surveys Section - Only for logged users */}
          {user && surveys && surveys.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-rajdhani">PESQUISAS ATIVAS</h2>
                <a href="#/pesquisas" className="text-sm text-primary hover:underline">Ver todas</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveys.map(survey => (
                  <SurveyCard key={survey.id} survey={survey} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
