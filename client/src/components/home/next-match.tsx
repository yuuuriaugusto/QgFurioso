import React from "react";

export default function NextMatch({ match }) {
  // Calculate time until match
  const calculateTimeUntil = () => {
    const now = new Date();
    const matchDate = new Date(match.scheduledAt);
    const diffMs = matchDate - now;
    
    // If match is in the past, return "Ao vivo"
    if (diffMs <= 0) {
      return "Ao vivo";
    }
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `Em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Em ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Em ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    }
  };
  
  const matchDate = new Date(match.scheduledAt);
  const formattedDate = matchDate.toLocaleDateString('pt-BR');
  const formattedTime = matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const timeUntil = calculateTimeUntil();
  const isLive = timeUntil === "Ao vivo";
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium bg-muted px-2 py-1 rounded-full">
            {match.tournament}
          </span>
          <span className="text-sm text-muted-foreground">
            {match.game}
          </span>
        </div>
        <div className="flex items-center">
          <span className={`text-sm px-2 py-1 rounded-full ${
            isLive 
              ? "bg-red-500/10 text-red-500" 
              : "bg-primary/10 text-primary"
          }`}>
            {isLive && (
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
            )}
            {timeUntil}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-4">
        {/* Team 1 */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden mb-2 sm:mb-0 sm:mr-4">
            {match.team1Logo ? (
              <img src={match.team1Logo} alt={match.team1Name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl font-bold">{match.team1Name?.substring(0, 1)}</span>
            )}
          </div>
          <div className="text-center sm:text-left">
            <div className="font-bold text-lg">{match.team1Name}</div>
            {match.team1Country && (
              <div className="text-sm text-muted-foreground">{match.team1Country}</div>
            )}
          </div>
        </div>
        
        {/* VS */}
        <div className="mx-4 text-2xl font-bold">VS</div>
        
        {/* Team 2 */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:flex-row-reverse">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden mb-2 sm:mb-0 sm:ml-4">
            {match.team2Logo ? (
              <img src={match.team2Logo} alt={match.team2Name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl font-bold">{match.team2Name?.substring(0, 1)}</span>
            )}
          </div>
          <div className="text-center sm:text-right">
            <div className="font-bold text-lg">{match.team2Name}</div>
            {match.team2Country && (
              <div className="text-sm text-muted-foreground">{match.team2Country}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
        <div>
          {formattedDate} • {formattedTime}
        </div>
        
        <div className="flex items-center space-x-3">
          {match.streamUrl && (
            <a 
              href={match.streamUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Assistir
            </a>
          )}
          
          <a 
            href={`/agenda`}
            className="text-muted-foreground hover:text-primary"
          >
            Mais detalhes
          </a>
        </div>
      </div>
    </div>
  );
}