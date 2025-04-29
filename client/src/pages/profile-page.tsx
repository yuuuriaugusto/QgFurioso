import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";

export default function ProfilePage() {
  const { user } = useAuth();

  useEffect(() => {
    // Set page title
    document.title = "Meu QG | FURIA Esports";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-4 md:flex md:gap-6">
        {/* Sidebar (desktop only) */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow">
          <h1 className="text-2xl font-bold mb-6 font-rajdhani">MEU PERFIL</h1>
          
          <div className="bg-card rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-2">
                  {user?.profile?.avatarUrl ? (
                    <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <button className="text-xs text-primary hover:underline">Alterar foto</button>
              </div>
              
              {/* User Info Section */}
              <div className="flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Nome</label>
                    <p className="font-medium">{user?.profile?.firstName || "Não informado"}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Sobrenome</label>
                    <p className="font-medium">{user?.profile?.lastName || "Não informado"}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Identificador</label>
                    <p className="font-medium">{user?.primaryIdentity}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Data de nascimento</label>
                    <p className="font-medium">{user?.profile?.birthDate || "Não informado"}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                    Editar perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* FURIA Coins Section */}
          <div className="bg-card rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 font-rajdhani">FURIA COINS</h2>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-muted p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-sm text-muted-foreground mb-1">Saldo disponível</div>
                <div className="text-2xl font-bold flex items-center">
                  {user?.coinBalance?.balance || 0}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-sm text-muted-foreground mb-1">Total ganho</div>
                <div className="text-2xl font-bold text-green-500 flex items-center">
                  {user?.coinBalance?.lifetimeEarned || 0}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg flex-1 min-w-[200px]">
                <div className="text-sm text-muted-foreground mb-1">Total gasto</div>
                <div className="text-2xl font-bold text-red-500 flex items-center">
                  {user?.coinBalance?.lifetimeSpent || 0}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <a href="/loja" className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 inline-block">
                Ir para a loja
              </a>
            </div>
          </div>
          
          {/* Placeholder for Redemption History */}
          <div className="bg-card rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 font-rajdhani">HISTÓRICO DE RESGATES</h2>
            
            <div className="text-center py-8 text-muted-foreground">
              <p>Você ainda não realizou nenhum resgate.</p>
              <p className="mt-2">Visite a <a href="/loja" className="text-primary hover:underline">loja</a> para conferir os itens disponíveis.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}