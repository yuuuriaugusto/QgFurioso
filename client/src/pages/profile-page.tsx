import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  User, 
  Upload, 
  Edit, 
  Save, 
  X, 
  ShieldCheck, 
  Instagram, 
  Twitter, 
  Facebook, 
  Twitch, 
  Check,
  AlertTriangle,
  Gamepad2,
  CalendarCheck,
  Clock,
  MapPin
} from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { insertUserProfileSchema } from "@shared/schema";

// Criamos um FormSchema estendido do schema de perfil do usuário
const profileFormSchema = insertUserProfileSchema.extend({
  cpf: z.string().min(11, "CPF deve ter 11 números").max(14, "CPF inválido").optional(),
  phoneNumber: z.string().optional(),
  
  // Campos adicionais de interesse
  favoriteGames: z
    .array(z.string())
    .optional()
    .transform(val => val || []),
    
  fanSince: z.string().optional(),
  eventsAttended: z
    .array(z.string())
    .optional()
    .transform(val => val || []),
});

// Tipo para o formulário
type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Lista de estados brasileiros
const brazilianStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" }
];

// Lista de games para selecionar como interesses
const availableGames = [
  { id: "csgo", name: "CS:GO" },
  { id: "cs2", name: "CS2" },
  { id: "valorant", name: "VALORANT" },
  { id: "lol", name: "League of Legends" },
  { id: "dota2", name: "Dota 2" },
  { id: "rainbow6", name: "Rainbow Six Siege" },
  { id: "apex", name: "Apex Legends" },
  { id: "fortnite", name: "Fortnite" },
  { id: "fifa", name: "FIFA" },
  { id: "freefire", name: "Free Fire" },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [openSocialDialog, setOpenSocialDialog] = useState(false);
  const [activeSocialPlatform, setActiveSocialPlatform] = useState<string | null>(null);

  // Query para buscar o perfil do usuário
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/users/me/profile'],
    queryFn: async () => {
      if (!user) return null;
      try {
        const response = await fetch('/api/users/me/profile');
        if (!response.ok) throw new Error('Erro ao buscar perfil');
        return await response.json();
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        return null;
      }
    },
    enabled: !!user
  });

  // Query para buscar as redes sociais do usuário
  const { data: socialLinks, isLoading: isLoadingSocial } = useQuery({
    queryKey: ['/api/users/me/social-links'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await fetch('/api/users/me/social-links');
        if (!response.ok) throw new Error('Erro ao buscar redes sociais');
        return await response.json();
      } catch (error) {
        console.error('Erro ao carregar redes sociais:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // Query para buscar os perfis de esports do usuário
  const { data: esportsProfiles, isLoading: isLoadingEsports } = useQuery({
    queryKey: ['/api/users/me/esports-profiles'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await fetch('/api/users/me/esports-profiles');
        if (!response.ok) throw new Error('Erro ao buscar perfis de esports');
        return await response.json();
      } catch (error) {
        console.error('Erro ao carregar perfis de esports:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // Query para buscar os resgates do usuário
  const { data: redemptions, isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ['/api/users/me/redemptions'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await fetch('/api/users/me/redemptions');
        if (!response.ok) throw new Error('Erro ao buscar resgates');
        return await response.json();
      } catch (error) {
        console.error('Erro ao carregar resgates:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // Configuração do formulário de perfil
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthDate: undefined,
      phoneNumber: "",
      cpf: "",
      addressStreet: "",
      addressNumber: "",
      addressComplement: "",
      addressNeighborhood: "",
      addressCity: "",
      addressState: "",
      addressZipCode: "",
      favoriteGames: [],
      fanSince: "",
      eventsAttended: [],
    }
  });

  // Atualiza o formulário quando os dados do perfil são carregados
  useEffect(() => {
    console.log("userProfile atualizado:", userProfile);
    if (userProfile) {
      try {
        console.log("Atualizando formulário com dados do perfil");
        
        // Garantir que todos os campos obrigatórios tenham valores padrão
        const formValues = {
          firstName: userProfile.firstName || "",
          lastName: userProfile.lastName || "",
          birthDate: userProfile.birthDate ? new Date(userProfile.birthDate) : undefined,
          phoneNumber: userProfile.phoneNumber || "",
          cpf: "", // Não exibimos o CPF armazenado, apenas permitimos nova entrada
          addressStreet: userProfile.addressStreet || "",
          addressNumber: userProfile.addressNumber || "",
          addressComplement: userProfile.addressComplement || "",
          addressNeighborhood: userProfile.addressNeighborhood || "",
          addressCity: userProfile.addressCity || "",
          addressState: userProfile.addressState || "",
          addressZipCode: userProfile.addressZipCode || "",
          favoriteGames: Array.isArray(userProfile.interests?.favoriteGames) ? userProfile.interests.favoriteGames : [],
          fanSince: userProfile.interests?.fanSince || "",
          eventsAttended: Array.isArray(userProfile.interests?.eventsAttended) ? userProfile.interests.eventsAttended : [],
        };
        
        console.log("Valores do formulário:", formValues);
        form.reset(formValues);

        // Atualiza os jogos selecionados
        if (Array.isArray(userProfile.interests?.favoriteGames)) {
          setSelectedGames(userProfile.interests.favoriteGames);
        } else {
          setSelectedGames([]);
        }
      } catch (error) {
        console.error("Erro ao atualizar formulário:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar seus dados. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  }, [userProfile, form]);

  // Mutação para atualizar o perfil do usuário
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Transformando os dados para o formato esperado pela API
      const profileData = {
        ...data,
        // Formatando data de nascimento
        birthDate: data.birthDate ? format(new Date(data.birthDate), 'yyyy-MM-dd') : undefined,
        // Criando objeto de interesses
        interests: {
          favoriteGames: data.favoriteGames,
          fanSince: data.fanSince,
          eventsAttended: data.eventsAttended
        }
      };
      
      console.log("Enviando dados para API:", profileData);
      
      const response = await apiRequest('PUT', '/api/users/me/profile', profileData);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro na resposta da API:", errorData);
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
        variant: "default",
      });
      setEditMode(false);
    },
    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao tentar atualizar suas informações. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mutação para adicionar uma rede social
  const addSocialLinkMutation = useMutation({
    mutationFn: async (data: { platform: string, username: string, profileUrl: string }) => {
      const response = await apiRequest('POST', '/api/users/me/social-links', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/social-links'] });
      toast({
        title: "Rede social adicionada",
        description: "Sua conta de rede social foi vinculada com sucesso.",
        variant: "default",
      });
      setOpenSocialDialog(false);
    },
    onError: (error) => {
      console.error("Erro ao adicionar rede social:", error);
      toast({
        title: "Erro ao vincular conta",
        description: "Ocorreu um erro ao tentar vincular sua conta. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Handler para adicionar ou remover um jogo da lista de interesses
  const toggleGameSelection = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter(id => id !== gameId));
      form.setValue('favoriteGames', selectedGames.filter(id => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
      form.setValue('favoriteGames', [...selectedGames, gameId]);
    }
  };

  // Handler para adicionar evento de fã
  const addEvent = (event: string) => {
    const currentEvents = form.getValues('eventsAttended') || [];
    if (event && !currentEvents.includes(event)) {
      const updatedEvents = [...currentEvents, event];
      form.setValue('eventsAttended', updatedEvents);
    }
  };

  // Handler para enviar formulário de perfil
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Handler para upload de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar avatar');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/users/me/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
      toast({
        title: "Erro ao atualizar avatar",
        description: "Ocorreu um erro ao tentar atualizar sua foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold font-rajdhani">MEU PERFIL</h1>
            {!editMode ? (
              <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={() => setEditMode(false)} 
                  variant="outline" 
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={form.handleSubmit(onSubmit)} 
                  variant="default" 
                  size="sm"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <><Clock className="h-4 w-4 mr-2 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Salvar</>
                  )}
                </Button>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="personal">Pessoal</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="interests">Interesses</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <TabsContent value="personal" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Informações Pessoais</CardTitle>
                    <CardDescription>
                      Seus dados pessoais são protegidos e usados apenas para personalizar sua experiência.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Avatar Section */}
                      <div className="flex flex-col items-center md:items-start">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-2 relative">
                          {user?.profile?.avatarUrl ? (
                            <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-12 w-12 text-muted-foreground" />
                          )}
                          
                          {editMode && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <label htmlFor="avatar-upload" className="cursor-pointer">
                                <Upload className="h-8 w-8 text-white" />
                                <input 
                                  type="file" 
                                  id="avatar-upload" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleAvatarUpload}
                                  disabled={isUploading}
                                />
                              </label>
                            </div>
                          )}
                          
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                            </div>
                          )}
                        </div>
                        {editMode && <span className="text-xs text-muted-foreground">Clique para alterar</span>}
                      </div>
                      
                      {/* User Info Section */}
                      <div className="flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {editMode ? (
                            <>
                              <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Seu nome" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Sobrenome</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Seu sobrenome" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="birthDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Data de nascimento</FormLabel>
                                    <div className="flex gap-2 items-center">
                                      <FormControl>
                                        <Input 
                                          placeholder="DD/MM/AAAA" 
                                          value={field.value ? format(field.value, "dd/MM/yyyy", { locale: pt }) : ""}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            // Aplicar máscara de data
                                            let maskedValue = value.replace(/\D/g, "");
                                            if (maskedValue.length > 0) {
                                              maskedValue = maskedValue.replace(/^(\d{2})(\d)/, "$1/$2");
                                              maskedValue = maskedValue.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
                                              maskedValue = maskedValue.substring(0, 10);
                                            }
                                            e.target.value = maskedValue;
                                            
                                            // Tenta converter a data para um objeto Date válido
                                            if (maskedValue.length === 10) {
                                              const [day, month, year] = maskedValue.split('/');
                                              const date = new Date(`${year}-${month}-${day}`);
                                              
                                              // Verifica se a data é válida
                                              if (!isNaN(date.getTime()) && 
                                                  date < new Date() && 
                                                  date > new Date("1900-01-01")) {
                                                field.onChange(date);
                                              }
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            type="button"
                                            className="px-2"
                                            title="Abrir calendário"
                                          >
                                            <CalendarCheck className="h-4 w-4" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="end">
                                          <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                              date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    <FormDescription>
                                      Digite a data no formato DD/MM/AAAA ou use o calendário.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Telefone</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="(00) 00000-0000" 
                                        {...field} 
                                        maxLength={15}
                                        onChange={(e) => {
                                          // Formatação do telefone: (00) 00000-0000
                                          let value = e.target.value.replace(/\D/g, "");
                                          if (value.length > 0 && value.length <= 2)
                                            value = value.replace(/^(\d+)/, "($1");
                                          else if (value.length > 2 && value.length <= 7)
                                            value = value.replace(/^\((\d{2})(\d+)/, "($1) $2");
                                          else if (value.length > 7)
                                            value = value.replace(/^\((\d{2})\) (\d{5})(\d+)/, "($1) $2-$3");
                                          
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cpf"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CPF</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Apenas números" 
                                        {...field} 
                                        maxLength={14}
                                        onChange={(e) => {
                                          // Formatação do CPF: 000.000.000-00
                                          let value = e.target.value.replace(/\D/g, "");
                                          if (value.length > 3 && value.length <= 6)
                                            value = value.replace(/^(\d{3})(\d+)/, "$1.$2");
                                          else if (value.length > 6 && value.length <= 9)
                                            value = value.replace(/^(\d{3})\.(\d{3})(\d+)/, "$1.$2.$3");
                                          else if (value.length > 9)
                                            value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d+)/, "$1.$2.$3-$4");
                                          
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          ) : (
                            <>
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
                                <p className="font-medium">{user?.username}</p>
                              </div>
                              
                              <div>
                                <label className="text-xs text-muted-foreground block mb-1">Data de nascimento</label>
                                <p className="font-medium">
                                  {user?.profile?.birthDate 
                                    ? format(new Date(user.profile.birthDate), "dd/MM/yyyy", { locale: pt })
                                    : "Não informado"}
                                </p>
                              </div>
                              
                              <div>
                                <label className="text-xs text-muted-foreground block mb-1">Telefone</label>
                                <p className="font-medium">
                                  {user?.profile?.phoneNumber || "Não informado"}
                                </p>
                              </div>
                              
                              <div>
                                <label className="text-xs text-muted-foreground block mb-1">CPF</label>
                                <p className="font-medium">
                                  {user?.profile?.cpfEncrypted 
                                    ? "•••.•••.•••-••" 
                                    : "Não informado"}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="address" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Endereço</CardTitle>
                    <CardDescription>
                      Seu endereço é usado apenas para envio de prêmios e produtos resgatados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="addressZipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="00000-000" 
                                  {...field} 
                                  maxLength={9}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, "");
                                    if (value.length > 5)
                                      value = value.replace(/^(\d{5})(\d+)/, "$1-$2");
                                    
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="addressStreet"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Rua/Logradouro</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome da rua" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="addressNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="addressComplement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento</FormLabel>
                              <FormControl>
                                <Input placeholder="Apartamento, bloco, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="addressNeighborhood"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu bairro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="addressCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade</FormLabel>
                              <FormControl>
                                <Input placeholder="Sua cidade" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="addressState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o estado" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {brazilianStates.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {user?.profile?.addressStreet ? (
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="font-medium">Endereço de envio</span>
                            </div>
                            <div className="pl-6 space-y-1">
                              <p>{user.profile.addressStreet}, {user.profile.addressNumber}</p>
                              {user.profile.addressComplement && (
                                <p>{user.profile.addressComplement}</p>
                              )}
                              <p>{user.profile.addressNeighborhood}</p>
                              <p>{user.profile.addressCity} - {user.profile.addressState}</p>
                              <p>CEP: {user.profile.addressZipCode}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>Nenhum endereço cadastrado.</p>
                            <p className="text-sm mt-1">Adicione um endereço para poder resgatar produtos físicos.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="interests" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Interesses e História FURIA</CardTitle>
                    <CardDescription>
                      Conte-nos mais sobre você e sua relação com a FURIA.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="space-y-6">
                        <div>
                          <FormLabel className="block mb-2">Jogos favoritos</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {availableGames.map((game) => (
                              <Button
                                key={game.id}
                                type="button"
                                variant={selectedGames.includes(game.id) ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => toggleGameSelection(game.id)}
                              >
                                <Gamepad2 className="h-4 w-4 mr-2" />
                                {game.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="fanSince"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fã da FURIA desde</FormLabel>
                              <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o ano" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: new Date().getFullYear() - 2017 + 1 }, (_, i) => 2017 + i).map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div>
                          <FormLabel>Eventos que participei</FormLabel>
                          <div className="mt-2 space-y-2">
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Nome do evento"
                                id="event-input"
                              />
                              <Button 
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('event-input') as HTMLInputElement;
                                  if (input.value) {
                                    addEvent(input.value);
                                    input.value = '';
                                  }
                                }}
                              >
                                Adicionar
                              </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {form.watch('eventsAttended')?.map((event, index) => (
                                <Badge key={index} variant="secondary" className="gap-1">
                                  {event}
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const currentEvents = form.getValues('eventsAttended') || [];
                                      form.setValue('eventsAttended', currentEvents.filter((_, i) => i !== index));
                                    }}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4" /> 
                            Jogos favoritos
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {user?.profile?.interests?.favoriteGames?.length > 0 ? (
                              user.profile.interests.favoriteGames.map((gameId) => {
                                const game = availableGames.find(g => g.id === gameId);
                                return (
                                  <Badge key={gameId} variant="secondary">
                                    {game?.name || gameId}
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-sm text-muted-foreground">Nenhum jogo selecionado</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> 
                            Fã da FURIA desde
                          </h3>
                          <p>
                            {user?.profile?.interests?.fanSince || "Não informado"}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4" /> 
                            Eventos que participei
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {user?.profile?.interests?.eventsAttended?.length > 0 ? (
                              user.profile.interests.eventsAttended.map((event, index) => (
                                <Badge key={index} variant="secondary">
                                  {event}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">Nenhum evento participado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="social" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Redes Sociais</CardTitle>
                    <CardDescription>
                      Vincule suas contas de redes sociais para acesso mais rápido.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Instagram */}
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Instagram className="h-5 w-5 text-red-500" />
                              <span className="font-medium">Instagram</span>
                            </div>
                            {socialLinks?.some(link => link.platform === 'instagram') ? (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-green-500" />
                                Vinculado
                              </Badge>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setActiveSocialPlatform('instagram');
                                  setOpenSocialDialog(true);
                                }}
                              >
                                Vincular
                              </Button>
                            )}
                          </div>
                          {socialLinks?.some(link => link.platform === 'instagram') && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              @{socialLinks.find(link => link.platform === 'instagram')?.username}
                            </div>
                          )}
                        </div>
                        
                        {/* Twitter / X */}
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Twitter className="h-5 w-5 text-blue-400" />
                              <span className="font-medium">Twitter / X</span>
                            </div>
                            {socialLinks?.some(link => link.platform === 'twitter') ? (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-green-500" />
                                Vinculado
                              </Badge>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setActiveSocialPlatform('twitter');
                                  setOpenSocialDialog(true);
                                }}
                              >
                                Vincular
                              </Button>
                            )}
                          </div>
                          {socialLinks?.some(link => link.platform === 'twitter') && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              @{socialLinks.find(link => link.platform === 'twitter')?.username}
                            </div>
                          )}
                        </div>
                        
                        {/* Facebook */}
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Facebook className="h-5 w-5 text-blue-600" />
                              <span className="font-medium">Facebook</span>
                            </div>
                            {socialLinks?.some(link => link.platform === 'facebook') ? (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-green-500" />
                                Vinculado
                              </Badge>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setActiveSocialPlatform('facebook');
                                  setOpenSocialDialog(true);
                                }}
                              >
                                Vincular
                              </Button>
                            )}
                          </div>
                          {socialLinks?.some(link => link.platform === 'facebook') && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {socialLinks.find(link => link.platform === 'facebook')?.username}
                            </div>
                          )}
                        </div>
                        
                        {/* Twitch */}
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Twitch className="h-5 w-5 text-purple-500" />
                              <span className="font-medium">Twitch</span>
                            </div>
                            {socialLinks?.some(link => link.platform === 'twitch') ? (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-green-500" />
                                Vinculado
                              </Badge>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setActiveSocialPlatform('twitch');
                                  setOpenSocialDialog(true);
                                }}
                              >
                                Vincular
                              </Button>
                            )}
                          </div>
                          {socialLinks?.some(link => link.platform === 'twitch') && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {socialLinks.find(link => link.platform === 'twitch')?.username}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Perfis de jogos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {esportsProfiles?.length > 0 ? (
                            esportsProfiles.map((profile, index) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <Gamepad2 className="h-5 w-5 text-primary" />
                                    <span className="font-medium">{profile.platform}</span>
                                  </div>
                                  <Badge 
                                    variant={profile.validationStatus === 'validated' ? 'default' : 'outline'}
                                    className="flex items-center gap-1"
                                  >
                                    {profile.validationStatus === 'validated' ? (
                                      <><Check className="h-3 w-3" /> Verificado</>
                                    ) : (
                                      <><AlertTriangle className="h-3 w-3" /> Pendente</>
                                    )}
                                  </Badge>
                                </div>
                                <div className="mt-2 text-sm">
                                  <p>Username: <span className="font-medium">{profile.username}</span></p>
                                  <a 
                                    href={profile.profileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    Ver perfil
                                  </a>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 text-center py-6 text-muted-foreground">
                              <Gamepad2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p>Nenhum perfil de jogo vinculado.</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                              >
                                Adicionar perfil de jogo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Form>
          </Tabs>
          
          {/* Link para FURIA Coins */}
          <div className="bg-card rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold font-rajdhani">FURIA COINS</h2>
                <p className="text-muted-foreground max-w-md">
                  Gerencie suas FURIA Coins, confira seu histórico de transações e acesse recompensas exclusivas.
                </p>
              </div>
              
              <div className="flex flex-col items-center md:items-end">
                <div className="bg-muted p-4 rounded-lg mb-3 text-center">
                  <div className="text-sm text-muted-foreground">Saldo Disponível</div>
                  <div className="text-2xl font-bold flex items-center justify-center">
                    {user?.coinBalance?.balance || 0}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v12" />
                      <path d="M8 12h8" />
                    </svg>
                  </div>
                </div>
                
                <a href="/furia-coins" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 inline-flex items-center">
                  Acessar FURIA Coins
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialog para adicionar rede social */}
      <Dialog open={openSocialDialog} onOpenChange={setOpenSocialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular conta de {getPlatformName(activeSocialPlatform)}</DialogTitle>
            <DialogDescription>
              Adicione suas informações de perfil para vincular sua conta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Nome de usuário</label>
              <Input id="username" placeholder={`@seu_usuario_${activeSocialPlatform}`} />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="profileUrl" className="text-sm font-medium">URL do Perfil</label>
              <Input id="profileUrl" placeholder={`https://${activeSocialPlatform}.com/seu_usuario`} />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpenSocialDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const username = (document.getElementById('username') as HTMLInputElement).value;
                const profileUrl = (document.getElementById('profileUrl') as HTMLInputElement).value;
                
                if (username && profileUrl && activeSocialPlatform) {
                  addSocialLinkMutation.mutate({
                    platform: activeSocialPlatform,
                    username,
                    profileUrl
                  });
                }
              }}
              disabled={addSocialLinkMutation.isPending}
            >
              {addSocialLinkMutation.isPending ? 'Vinculando...' : 'Vincular Conta'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}

// Função auxiliar para obter o nome da plataforma social
function getPlatformName(platform: string | null): string {
  switch (platform) {
    case 'instagram': return 'Instagram';
    case 'twitter': return 'Twitter / X';
    case 'facebook': return 'Facebook';
    case 'twitch': return 'Twitch';
    default: return 'rede social';
  }
}