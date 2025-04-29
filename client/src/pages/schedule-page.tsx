import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";

export default function SchedulePage() {
  const [selectedGame, setSelectedGame] = useState('all');

  // Fetch upcoming matches
  const { data: matches, isLoading } = useQuery({
    queryKey: ["/api/matches", { status: "upcoming" }],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=upcoming");
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    }
  });

  useEffect(() => {
    // Set page title
    document.title = "Agenda | FURIA Esports";
  }, []);

  // Filter matches by game
  const filteredMatches = matches?.filter(match => 
    selectedGame === 'all' || match.game === selectedGame
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-4 md:flex md:gap-6">
        {/* Sidebar (desktop only) */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow">
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-rajdhani">AGENDA DE PARTIDAS</h1>
            <p className="text-muted-foreground">Próximas partidas da FURIA Esports</p>
          </div>
          
          {/* Game filter */}
          <div className="flex overflow-x-auto pb-2 mb-6 no-scrollbar">
            <button 
              onClick={() => setSelectedGame('all')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedGame === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Todos os jogos
            </button>
            <button 
              onClick={() => setSelectedGame('CS2')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedGame === 'CS2' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              CS2
            </button>
            <button 
              onClick={() => setSelectedGame('VALORANT')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedGame === 'VALORANT' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              VALORANT
            </button>
            <button 
              onClick={() => setSelectedGame('DOTA 2')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedGame === 'DOTA 2' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              DOTA 2
            </button>
            <button 
              onClick={() => setSelectedGame('LEAGUE OF LEGENDS')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedGame === 'LEAGUE OF LEGENDS' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              LOL
            </button>
          </div>
          
          {/* Matches list */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-muted rounded w-1/4"></div>
                    <div className="h-6 bg-muted rounded w-1/6"></div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="h-6 bg-muted rounded w-24"></div>
                    </div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                    <div className="flex items-center space-x-4">
                      <div className="h-6 bg-muted rounded w-24"></div>
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMatches?.length > 0 ? (
            <div className="space-y-4">
              {filteredMatches.map(match => {
                const matchDate = new Date(match.scheduledAt);
                const today = new Date();
                const isSameDay = 
                  matchDate.getDate() === today.getDate() &&
                  matchDate.getMonth() === today.getMonth() &&
                  matchDate.getFullYear() === today.getFullYear();
                
                return (
                  <div key={match.id} className="bg-card rounded-xl p-4 hover:border-primary/50 border border-border transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
                          isSameDay ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {isSameDay ? 'HOJE' : matchDate.toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                          {match.tournament}
                        </span>
                        <span className="ml-2 text-xs text-primary font-medium">{match.game}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                          {match.team1Logo ? (
                            <img src={match.team1Logo} alt={match.team1Name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-lg font-bold">{match.team1Name?.substring(0, 1)}</span>
                          )}
                        </div>
                        <span className="font-semibold">{match.team1Name}</span>
                      </div>
                      
                      <span className="text-xl font-bold">VS</span>
                      
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">{match.team2Name}</span>
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                          {match.team2Logo ? (
                            <img src={match.team2Logo} alt={match.team2Name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-lg font-bold">{match.team2Name?.substring(0, 1)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {match.streamUrl && (
                      <div className="mt-4 text-center">
                        <a 
                          href={match.streamUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary hover:underline"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="10 8 16 12 10 16 10 8" />
                          </svg>
                          Assistir ao vivo
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhuma partida agendada no momento.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}