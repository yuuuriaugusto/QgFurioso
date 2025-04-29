import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";

export default function ShopPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch shop items
  const { data: shopItems, isLoading } = useQuery({
    queryKey: ["/api/shop/items", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/shop/items?active=true");
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    }
  });

  useEffect(() => {
    // Set page title
    document.title = "Loja | FURIA Esports";
  }, []);

  // Filter items by category
  const filteredItems = shopItems?.filter(item => 
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold font-rajdhani">LOJA FURIA</h1>
              <p className="text-muted-foreground">Resgate produtos e experiências exclusivas com seus FURIA Coins</p>
            </div>
            
            {user?.coinBalance && (
              <div className="bg-card rounded-lg px-4 py-2 flex items-center">
                <span className="font-semibold mr-2">Saldo:</span>
                <span className="text-lg font-bold">{user.coinBalance.balance}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v12" />
                  <path d="M8 12h8" />
                </svg>
              </div>
            )}
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
              onClick={() => setSelectedCategory('merchandise')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedCategory === 'merchandise' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Produtos físicos
            </button>
            <button 
              onClick={() => setSelectedCategory('experience')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedCategory === 'experience' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Experiências
            </button>
            <button 
              onClick={() => setSelectedCategory('digital')}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                selectedCategory === 'digital' 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Itens digitais
            </button>
          </div>
          
          {/* Shop items grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <div className="p-4">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
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
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-bold text-lg">{item.coinPrice}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v12" />
                          <path d="M8 12h8" />
                        </svg>
                      </div>
                      <button 
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!user || (user.coinBalance?.balance || 0) < item.coinPrice}
                      >
                        Resgatar
                      </button>
                    </div>
                    {item.stock !== null && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {item.stock > 0 ? `${item.stock} em estoque` : 'Esgotado'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhum item disponível na categoria selecionada.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}