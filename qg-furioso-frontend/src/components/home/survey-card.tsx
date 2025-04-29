import React from "react";

interface SurveyCardProps {
  survey: {
    id: number;
    title: string;
    description?: string;
    status: string;
    reward: number;
    estimatedTimeMinutes?: number;
    expirationDate?: string;
  };
}

export default function SurveyCard({ survey }: SurveyCardProps) {
  // Calculate days remaining until expiration
  const getDaysRemaining = () => {
    if (!survey.expirationDate) return null;
    
    const today = new Date();
    const expirationDate = new Date(survey.expirationDate);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
      <h3 className="font-semibold text-lg mb-2">{survey.title}</h3>
      
      {survey.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {survey.description}
        </p>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xs text-muted-foreground block mb-1">Recompensa</span>
          <span className="font-semibold text-primary flex items-center">
            {survey.reward}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12" />
              <path d="M8 12h8" />
            </svg>
          </span>
        </div>
        
        {survey.estimatedTimeMinutes && (
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Tempo estimado</span>
            <span className="font-medium">{survey.estimatedTimeMinutes} min</span>
          </div>
        )}
        
        {daysRemaining !== null && (
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Expira em</span>
            <span className={`font-medium ${daysRemaining <= 1 ? 'text-red-500' : ''}`}>
              {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      <a 
        href={`/pesquisas/${survey.id}`} 
        className="w-full bg-primary text-white py-2 px-4 rounded-md text-center inline-block hover:bg-primary/90"
      >
        Responder pesquisa
      </a>
    </div>
  );
}