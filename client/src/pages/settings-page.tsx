import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingConsent: false,
    theme: "dark",
    language: "pt-BR"
  });

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["/api/users/me/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/preferences");
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch preferences");
      }
      return res.json();
    },
    enabled: !!user
  });

  // Update form data when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormData({
        emailNotifications: preferences.emailNotifications ?? true,
        pushNotifications: preferences.pushNotifications ?? true,
        marketingConsent: preferences.marketingConsent ?? false,
        theme: preferences.theme ?? "dark",
        language: preferences.language ?? "pt-BR"
      });
    }
  }, [preferences]);

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("PUT", "/api/users/me/preferences", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/preferences"] });
      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências foram atualizadas com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar preferências",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updatePreferences.mutate(formData);
  };

  useEffect(() => {
    // Set page title
    document.title = "Configurações | FURIA Esports";
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
            <h1 className="text-2xl font-bold font-rajdhani">CONFIGURAÇÕES</h1>
            <p className="text-muted-foreground">Gerencie suas preferências e configurações</p>
          </div>
          
          {isLoading ? (
            <div className="bg-card rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-5 bg-muted rounded w-1/3"></div>
                    <div className="h-6 bg-muted rounded w-12"></div>
                  </div>
                ))}
              </div>
              <div className="h-10 bg-muted rounded w-1/4 mt-6"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Notificações e privacidade</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <label htmlFor="emailNotifications" className="font-medium">Notificações por e-mail</label>
                    <p className="text-sm text-muted-foreground">Receber atualizações e notícias por e-mail</p>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      id="emailNotifications" 
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleChange}
                      className="toggle toggle-primary"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div>
                    <label htmlFor="pushNotifications" className="font-medium">Notificações push</label>
                    <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      id="pushNotifications" 
                      name="pushNotifications"
                      checked={formData.pushNotifications}
                      onChange={handleChange}
                      className="toggle toggle-primary"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div>
                    <label htmlFor="marketingConsent" className="font-medium">Marketing</label>
                    <p className="text-sm text-muted-foreground">Receber ofertas e promoções da FURIA e parceiros</p>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      id="marketingConsent" 
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleChange}
                      className="toggle toggle-primary"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div>
                    <label htmlFor="theme" className="font-medium">Tema</label>
                    <p className="text-sm text-muted-foreground">Escolha entre tema claro ou escuro</p>
                  </div>
                  <div>
                    <select 
                      id="theme" 
                      name="theme"
                      value={formData.theme}
                      onChange={handleChange}
                      className="px-3 py-2 bg-muted rounded-md border border-border"
                    >
                      <option value="dark">Escuro</option>
                      <option value="light">Claro</option>
                      <option value="system">Sistema</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div>
                    <label htmlFor="language" className="font-medium">Idioma</label>
                    <p className="text-sm text-muted-foreground">Selecione o idioma da plataforma</p>
                  </div>
                  <div>
                    <select 
                      id="language" 
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="px-3 py-2 bg-muted rounded-md border border-border"
                    >
                      <option value="pt-BR">Português (BR)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  type="submit" 
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
                  disabled={updatePreferences.isPending}
                >
                  {updatePreferences.isPending ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          )}
          
          {/* Account Management Section */}
          <div className="mt-8 bg-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Gerenciamento de conta</h2>
            
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Alterar senha</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Altere sua senha para manter sua conta segura
                </p>
                <button className="text-primary hover:underline text-sm">
                  Alterar senha
                </button>
              </div>
              
              <div className="p-4 border border-red-300/10 rounded-lg bg-red-500/5">
                <h3 className="font-medium mb-2 text-red-500">Excluir conta</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta ação é permanente e irá remover todos os seus dados
                </p>
                <button className="text-red-500 hover:underline text-sm">
                  Excluir minha conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}