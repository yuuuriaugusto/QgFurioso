import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";

export default function ContentPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch news content
  const { data: newsContent = [], isLoading } = useQuery({
    queryKey: ["/api/content/news"],
    queryFn: async () => {
      const res = await fetch("/api/content/news");
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    }
  });

  useEffect(() => {
    // Set page title
    document.title = "Conteúdo | FURIA Esports";
  }, []);

  // Filter news by category
  const filteredNews = newsContent.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
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
            <h1 className="text-2xl font-bold font-rajdhani">CONTEÚDO</h1>
            <p className="text-muted-foreground">Notícias, artigos e mídia da FURIA Esports</p>
          </div>
          
          {/* Category filter */}
          <div className="flex overflow-x-auto pb-2 mb-6 no-scrollbar">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedCategory === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Todos
            </button>
            <button 
              onClick={() => setSelectedCategory('news')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedCategory === 'news' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Notícias
            </button>
            <button 
              onClick={() => setSelectedCategory('article')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedCategory === 'article' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Artigos
            </button>
            <button 
              onClick={() => setSelectedCategory('interview')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedCategory === 'interview' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Entrevistas
            </button>
          </div>
          
          {/* Content grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <div className="p-4">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNews?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map(item => (
                <div key={item.id} className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors">
                  {item.coverImageUrl ? (
                    <img src={item.coverImageUrl} alt={item.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {item.category === 'news' ? 'Notícia' : 
                         item.category === 'article' ? 'Artigo' : 
                         item.category === 'interview' ? 'Entrevista' : item.category}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.excerpt}</p>
                    <a 
                      href={`/conteudo/${item.slug}`} 
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Ler mais →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhum conteúdo disponível na categoria selecionada.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}