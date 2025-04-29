import React from "react";

export default function StreamCard({ stream }) {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors">
      <div className="relative">
        {stream.thumbnailUrl ? (
          <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
          </div>
        )}
        
        {/* Live badge */}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
            <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
            AO VIVO
          </span>
        </div>
        
        {/* View count */}
        {stream.viewerCount && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {stream.viewerCount.toLocaleString()}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold mb-1 line-clamp-1">{stream.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{stream.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {stream.platform && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {stream.platform}
              </span>
            )}
          </div>
          
          <a 
            href={`/ao-vivo/${stream.id}`} 
            className="text-primary hover:underline text-sm font-medium"
          >
            Assistir
          </a>
        </div>
      </div>
    </div>
  );
}