import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Home, 
  FileCheck, 
  Link, 
  GamepadIcon, 
  CalendarDays, 
  ShoppingBag, 
  Camera, 
  Loader2 
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [isUploading, setIsUploading] = useState(false);

  // Buscar links sociais
  const { data: socialLinks, isLoading: socialLinksLoading } = useQuery({
    queryKey: ["/api/users/me/social-links"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/social-links");
      if (!res.ok) throw new Error("Falha ao carregar links sociais");
      return res.json();
    },
    enabled: !!user,
  });

  // Buscar histórico de resgates
  const { data: redemptions, isLoading: redemptionsLoading } = useQuery({
    queryKey: ["/api/shop/redemptions"],
    queryFn: async () => {
      const res = await fetch("/api/shop/redemptions");
      if (!res.ok) throw new Error("Falha ao carregar histórico de resgates");
      return res.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    // Set page title
    document.title = "Meu QG | FURIA Esports";
  }, []);

  // Upload de foto
  const handlePhotoUpload = () => {
    // Simular upload (será implementado futuramente)
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  // Formatar CPF para exibição
  const formatCPF = (cpf: string | null | undefined): string => {
    if (!cpf) return "Não informado";
    // Formatar CPF (XXX.XXX.XXX-XX)
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Verificar se o usuário tem endereço completo
  const hasFullAddress = () => {
    return !!(
      user?.profile?.addressStreet &&
      user?.profile?.addressNumber &&
      user?.profile?.addressCity &&
      user?.profile?.addressState &&
      user?.profile?.addressZipCode
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-4 md:flex md:gap-6">
        {/* Sidebar (desktop only) */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow">
          <h1 className="text-2xl font-bold mb-6 font-rajdhani">MEU PERFIL</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 mb-6">
              <TabsTrigger value="perfil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </TabsTrigger>
              
              <TabsTrigger value="endereco" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Endereço</span>
              </TabsTrigger>
              
              <TabsTrigger value="interesses" className="flex items-center gap-2">
                <GamepadIcon className="h-4 w-4" />
                <span>Interesses</span>
              </TabsTrigger>
              
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Histórico</span>
              </TabsTrigger>
              
              <TabsTrigger value="verificacao" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                <span>Verificação</span>
              </TabsTrigger>
              
              <TabsTrigger value="contas" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <span>Contas</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Tab de Informações Pessoais */}
            <TabsContent value="perfil" className="space-y-6">
              <div className="bg-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 font-rajdhani">INFORMAÇÕES PESSOAIS</h2>
                
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
                    <button 
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={handlePhotoUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-3 w-3" />
                          <span>Alterar foto</span>
                        </>
                      )}
                    </button>
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
                        <label className="text-xs text-muted-foreground block mb-1">Email</label>
                        <p className="font-medium">{user?.primaryIdentity}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Data de nascimento</label>
                        <p className="font-medium">{user?.profile?.birthDate || "Não informado"}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">CPF</label>
                        <p className="font-medium">{user?.profile?.cpfEncrypted ? "●●●.●●●.●●●-●●" : "Não informado"}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Status da conta</label>
                        <Badge variant={user?.status === "active" ? "success" : "default"}>
                          {user?.status === "active" ? "Verificado" : "Pendente"}
                        </Badge>
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
              <div className="bg-card rounded-xl p-6">
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
                  <a href="/furia-coins" className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 inline-block">
                    Gerenciar FURIA Coins
                  </a>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab de Endereço */}
            <TabsContent value="endereco">
              <div className="bg-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 font-rajdhani">ENDEREÇO</h2>
                
                {hasFullAddress() ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Rua</label>
                      <p className="font-medium">{user?.profile?.addressStreet}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Número</label>
                      <p className="font-medium">{user?.profile?.addressNumber}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Complemento</label>
                      <p className="font-medium">{user?.profile?.addressComplement || "Não informado"}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Bairro</label>
                      <p className="font-medium">{user?.profile?.addressNeighborhood || "Não informado"}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Cidade</label>
                      <p className="font-medium">{user?.profile?.addressCity}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Estado</label>
                      <p className="font-medium">{user?.profile?.addressState}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">CEP</label>
                      <p className="font-medium">{user?.profile?.addressZipCode}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Você ainda não cadastrou seu endereço.</p>
                    <p className="mt-2">Cadastre seu endereço para facilitar o envio de produtos físicos.</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <button className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                    {hasFullAddress() ? "Atualizar endereço" : "Cadastrar endereço"}
                  </button>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab de Interesses */}
            <TabsContent value="interesses">
              <div className="bg-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 font-rajdhani">INTERESSES</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Jogos favoritos</h3>
                  {user?.profile?.interests && typeof user.profile.interests === 'object' && 
                   'games' in (user.profile.interests as Record<string, any>) && 
                   Array.isArray((user.profile.interests as Record<string, any>).games) && 
                   (user.profile.interests as Record<string, any>).games.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {((user.profile.interests as Record<string, any>).games as string[]).map((game: string) => (
                        <Badge key={game} variant="secondary">{game}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Você ainda não adicionou jogos favoritos.</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Times favoritos</h3>
                  {user?.profile?.interests && typeof user.profile.interests === 'object' && 
                   'teams' in (user.profile.interests as Record<string, any>) && 
                   Array.isArray((user.profile.interests as Record<string, any>).teams) && 
                   (user.profile.interests as Record<string, any>).teams.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {((user.profile.interests as Record<string, any>).teams as string[]).map((team: string) => (
                        <Badge key={team} variant="secondary">{team}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Você ainda não adicionou times favoritos.</p>
                  )}
                </div>
                
                <div className="mt-4">
                  <button className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                    Atualizar interesses
                  </button>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab de Histórico */}
            <TabsContent value="historico">
              <div className="bg-card rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 font-rajdhani">HISTÓRICO DE EVENTOS</h2>
                
                {user?.profile?.activitiesEvents && 
                  typeof user.profile.activitiesEvents === 'object' && 
                  Array.isArray(user.profile.activitiesEvents) && 
                  user.profile.activitiesEvents.length > 0 ? (
                  <div className="space-y-4">
                    {(user.profile.activitiesEvents as Array<{name: string, date: string, description: string}>).map((event, index) => (
                      <div key={index} className="p-3 border border-border rounded-md">
                        <h3 className="font-medium">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                        <p className="text-sm">{event.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Você ainda não participou de nenhum evento.</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <button className="text-sm bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                    Adicionar evento
                  </button>
                </div>
              </div>
              
              <div className="bg-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 font-rajdhani">HISTÓRICO DE COMPRAS</h2>
                
                {redemptionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : redemptions?.length > 0 ? (
                  <div className="space-y-4">
                    {redemptions.map((redemption) => (
                      <div key={redemption.id} className="p-3 border border-border rounded-md flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{redemption.item?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(redemption.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                          <Badge 
                            variant={
                              redemption.status === "delivered" ? "success" : 
                              redemption.status === "cancelled" ? "destructive" : 
                              "default"
                            }
                            className="mt-1"
                          >
                            {redemption.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-lg">{redemption.coinCost}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v12" />
                            <path d="M8 12h8" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Você ainda não realizou nenhum resgate.</p>
                    <p className="mt-2">Visite a <a href="/furia-coins" className="text-primary hover:underline">loja</a> para conferir os itens disponíveis.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Tab de Verificação */}
            <TabsContent value="verificacao">
              <div className="bg-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 font-rajdhani">VERIFICAÇÃO DE CONTA</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Status da verificação</h3>
                    
                    <div className="p-4 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-primary" />
                          <span className="font-medium">Verificação de identidade</span>
                        </div>
                        
                        <Badge variant={user?.status === "active" ? "success" : "outline"}>
                          {user?.status === "active" ? "Verificado" : "Pendente"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        A verificação de identidade é necessária para acesso a funcionalidades exclusivas.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Enviar documentos</h3>
                    
                    <div className="p-4 border border-dashed border-border rounded-md text-center">
                      <FileCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Arraste e solte seus documentos aqui ou clique para selecionar arquivos.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formatos aceitos: JPG, PNG ou PDF (máx. 5MB)
                      </p>
                      <button className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 text-sm">
                        Selecionar arquivos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Tab de Contas Vinculadas */}
            <TabsContent value="contas">
              <div className="bg-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 font-rajdhani">CONTAS VINCULADAS</h2>
                
                {socialLinksLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-md flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-[#ea4335]" fill="currentColor">
                          <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
                        </svg>
                        <div>
                          <h3 className="font-medium">Google</h3>
                          <p className="text-sm text-muted-foreground">
                            {user?.identityType === "google" ? "Conta principal" : "Não vinculado"}
                          </p>
                        </div>
                      </div>
                      
                      <button className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80">
                        {user?.identityType === "google" ? "Configurar" : "Vincular"}
                      </button>
                    </div>
                    
                    <div className="p-4 border border-border rounded-md flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-[#1DA1F2]" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        <div>
                          <h3 className="font-medium">Twitter/X</h3>
                          <p className="text-sm text-muted-foreground">Não vinculado</p>
                        </div>
                      </div>
                      
                      <button className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80">
                        Vincular
                      </button>
                    </div>
                    
                    <div className="p-4 border border-border rounded-md flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-[#FF0000]" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <div>
                          <h3 className="font-medium">YouTube</h3>
                          <p className="text-sm text-muted-foreground">Não vinculado</p>
                        </div>
                      </div>
                      
                      <button className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80">
                        Vincular
                      </button>
                    </div>
                    
                    <div className="p-4 border border-border rounded-md flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-[#9146FF]" fill="currentColor">
                          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                        </svg>
                        <div>
                          <h3 className="font-medium">Twitch</h3>
                          <p className="text-sm text-muted-foreground">Não vinculado</p>
                        </div>
                      </div>
                      
                      <button className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80">
                        Vincular
                      </button>
                    </div>
                    
                    <div className="p-4 border border-border rounded-md flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-[#E4405F]" fill="currentColor">
                          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                        </svg>
                        <div>
                          <h3 className="font-medium">Instagram</h3>
                          <p className="text-sm text-muted-foreground">Não vinculado</p>
                        </div>
                      </div>
                      
                      <button className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80">
                        Vincular
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}