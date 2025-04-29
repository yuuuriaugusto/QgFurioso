import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";

export default function LivePage() {
  // Fetch live streams
  const { data: streams, isLoading } = useQuery({
    queryKey: ["/api/streams", { status: "live" }],
    queryFn: async () => {
      const res = await fetch("/api/streams?status=live");
      if (!res.ok) throw new Error("Failed to fetch streams");
      return res.json();
    }
  });

  useEffect(() => {
    // Set page title
    document.title = "Ao Vivo | FURIA Esports";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-4 md:flex md:gap-6">
        {/* Sidebar (desktop only) */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow">
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-rajdhani">AO VIVO</h1>
            <p className="text-muted-foreground">Transmissões ao vivo da FURIA Esports</p>
          </div>
          
          {/* Streams section */}
          {isLoading ? (
            <div>
              {/* Featured stream loading state */}
              <div className="bg-card rounded-xl overflow-hidden mb-6 animate-pulse">
                <div className="w-full h-[400px] bg-muted"></div>
                <div className="p-4">
                  <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
              
              {/* Other streams loading state */}
              <h2 className="text-xl font-semibold mb-4">Outras transmissões</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-muted"></div>
                    <div className="p-4">
                      <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : streams?.length > 0 ? (
            <div>
              {/* Featured stream */}
              <div className="bg-card rounded-xl overflow-hidden mb-6">
                <div className="relative pb-[56.25%] h-0">
                  {streams[0].embedUrl ? (
                    <iframe 
                      src={streams[0].embedUrl} 
                      className="absolute top-0 left-0 w-full h-full"
                      allowFullScreen
                      title={streams[0].title}
                    ></iframe>
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full bg-muted flex items-center justify-center">
                      <p className="text-center text-muted-foreground">
                        Stream não disponível no momento
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">{streams[0].title}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                      <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full"></span>
                      AO VIVO
                    </span>
                  </div>
                  <p className="text-muted-foreground">{streams[0].description}</p>
                  
                  {streams[0].externalUrl && (
                    <div className="mt-4">
                      <a 
                        href={streams[0].externalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                      >
                        Assistir na plataforma oficial
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Other streams */}
              {streams.length > 1 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Outras transmissões</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {streams.slice(1).map(stream => (
                      <div key={stream.id} className="bg-card rounded-xl overflow-hidden hover:border-primary/50 border border-border transition-colors">
                        <div className="relative pb-[56.25%] h-0">
                          {stream.thumbnailUrl ? (
                            <img 
                              src={stream.thumbnailUrl} 
                              alt={stream.title}
                              className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute top-0 left-0 w-full h-full bg-muted flex items-center justify-center">
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
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                              <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full"></span>
                              AO VIVO
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-1 line-clamp-1">{stream.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{stream.description}</p>
                          
                          <div className="mt-4">
                            <a 
                              href={`/ao-vivo/${stream.id}`} 
                              className="text-primary hover:underline text-sm"
                            >
                              Assistir aqui →
                            </a>
                            {stream.externalUrl && (
                              <a 
                                href={stream.externalUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-4 text-sm text-muted-foreground hover:text-primary"
                              >
                                Abrir na plataforma
                                <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3 w-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhuma transmissão ao vivo no momento.</p>
              <p className="mt-2">Fique de olho em nossas redes sociais para saber quando estaremos ao vivo!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}