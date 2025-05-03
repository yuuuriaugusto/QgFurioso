import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Save, Lock, Mail, Users, Key, ShieldCheck, AlertCircle, Settings } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";

// Schema para o formulário de administrador
const adminUserFormSchema = z.object({
  username: z.string().min(3, {
    message: "Nome de usuário deve ter pelo menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "E-mail inválido.",
  }),
  firstName: z.string().min(1, {
    message: "Nome é obrigatório.",
  }),
  lastName: z.string().min(1, {
    message: "Sobrenome é obrigatório.",
  }),
  role: z.enum(["super_admin", "admin", "editor", "viewer"], {
    required_error: "Selecione uma função.",
  }),
  isActive: z.boolean().default(true),
  password: z.string().min(6, {
    message: "Senha deve ter pelo menos 6 caracteres.",
  }).optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

// Schema para configurações de sistema
const systemSettingsSchema = z.object({
  siteName: z.string().min(1, {
    message: "Nome do site é obrigatório.",
  }),
  contactEmail: z.string().email({
    message: "E-mail de contato inválido.",
  }),
  maintenanceMode: z.boolean().default(false),
  loginAttempts: z.coerce.number().min(1).max(10),
  sessionTimeout: z.coerce.number().min(15).max(1440),
  twoFactorAuth: z.boolean().default(false),
  auditLogEnabled: z.boolean().default(true),
  sentimentAnalysisEnabled: z.boolean().default(true),
});

export default function AdminSettingsPage() {
  const { admin } = useAdminAuth();
  const { toast } = useToast();
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  
  // Form para novo administrador
  const adminForm = useForm<z.infer<typeof adminUserFormSchema>>({
    resolver: zodResolver(adminUserFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "viewer",
      isActive: true,
      password: "",
      confirmPassword: "",
    },
  });

  // Form para configurações de sistema
  const systemSettingsForm = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      siteName: "QG FURIOSO",
      contactEmail: "contato@furia.com",
      maintenanceMode: false,
      loginAttempts: 5,
      sessionTimeout: 120,
      twoFactorAuth: false,
      auditLogEnabled: true,
      sentimentAnalysisEnabled: true,
    },
  });

  // Dados mockados para visualização
  const { data: adminUsers, isLoading: loadingAdmins } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      // Dados mockados
      return [
        {
          id: 1,
          username: "admin",
          email: "admin@furia.com",
          firstName: "Admin",
          lastName: "FURIA",
          role: "super_admin",
          isActive: true,
          lastLoginAt: new Date(2025, 4, 10, 14, 30),
          createdAt: new Date(2025, 0, 1),
        },
        {
          id: 2,
          username: "maria",
          email: "maria@furia.com",
          firstName: "Maria",
          lastName: "Costa",
          role: "admin",
          isActive: true,
          lastLoginAt: new Date(2025, 4, 9, 16, 45),
          createdAt: new Date(2025, 1, 15),
        },
        {
          id: 3,
          username: "joao",
          email: "joao@furia.com",
          firstName: "João",
          lastName: "Almeida",
          role: "editor",
          isActive: true,
          lastLoginAt: new Date(2025, 4, 8, 11, 20),
          createdAt: new Date(2025, 2, 5),
        },
        {
          id: 4,
          username: "ana",
          email: "ana@furia.com",
          firstName: "Ana",
          lastName: "Silva",
          role: "viewer",
          isActive: false,
          lastLoginAt: new Date(2025, 3, 15, 9, 10),
          createdAt: new Date(2025, 3, 1),
        },
      ];
    },
  });

  // Função para lidar com a submissão do formulário de administrador
  const handleSubmitAdmin = (values: z.infer<typeof adminUserFormSchema>) => {
    console.log("Submetendo formulário de administrador:", values);
    
    if (editingAdmin) {
      // Lógica para atualizar administrador
      console.log("Atualizando admin:", editingAdmin.id, values);
      toast({
        title: "Administrador atualizado",
        description: `As informações de ${values.firstName} ${values.lastName} foram atualizadas com sucesso.`,
      });
    } else {
      // Lógica para criar novo administrador
      console.log("Criando novo admin:", values);
      toast({
        title: "Administrador criado",
        description: `${values.firstName} ${values.lastName} foi adicionado como ${getRoleName(values.role)}.`,
      });
    }
    
    // Fecha o modal e limpa o formulário
    setShowAddAdminModal(false);
    setEditingAdmin(null);
    adminForm.reset();
  };

  // Função para lidar com a submissão do formulário de configurações
  const handleSubmitSettings = (values: z.infer<typeof systemSettingsSchema>) => {
    console.log("Submetendo configurações:", values);
    
    toast({
      title: "Configurações salvas",
      description: "As configurações do sistema foram atualizadas com sucesso.",
    });
  };

  // Função para iniciar a edição de um administrador
  const handleEditAdmin = (admin: any) => {
    setEditingAdmin(admin);
    adminForm.reset({
      username: admin.username,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      isActive: admin.isActive,
      password: "",
      confirmPassword: "",
    });
    setShowAddAdminModal(true);
  };

  // Função para obter o nome da função baseado no código
  const getRoleName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Administrador";
      case "admin":
        return "Administrador";
      case "editor":
        return "Editor";
      case "viewer":
        return "Visualizador";
      default:
        return role;
    }
  };

  // Função para obter a badge de papel/função
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-500">Super Admin</Badge>;
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>;
      case "editor":
        return <Badge className="bg-green-500">Editor</Badge>;
      case "viewer":
        return <Badge variant="outline">Visualizador</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações da plataforma e usuários administrativos
            </p>
          </div>
        </div>

        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Administradores
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* Aba de Usuários Administrativos */}
          <TabsContent value="admins">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Usuários Administrativos</CardTitle>
                  <CardDescription>
                    Gerencie os usuários com acesso administrativo à plataforma
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  adminForm.reset();
                  setEditingAdmin(null);
                  setShowAddAdminModal(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Administrador
                </Button>
              </CardHeader>
              <CardContent>
                {loadingAdmins ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Papel</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Último Login</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers && adminUsers.map((adminUser) => (
                          <TableRow key={adminUser.id}>
                            <TableCell>
                              {adminUser.firstName} {adminUser.lastName}
                            </TableCell>
                            <TableCell>{adminUser.username}</TableCell>
                            <TableCell>{adminUser.email}</TableCell>
                            <TableCell>{getRoleBadge(adminUser.role)}</TableCell>
                            <TableCell>
                              {adminUser.isActive ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                  Inativo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {adminUser.lastLoginAt.toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditAdmin(adminUser)}
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Segurança */}
          <TabsContent value="security">
            <Form {...systemSettingsForm}>
              <form onSubmit={systemSettingsForm.handleSubmit(handleSubmitSettings)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Segurança</CardTitle>
                    <CardDescription>
                      Gerencie as configurações de segurança da plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemSettingsForm.control}
                        name="loginAttempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tentativas de Login</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min={1} max={10} />
                            </FormControl>
                            <FormDescription>
                              Número máximo de tentativas antes de bloquear o acesso.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemSettingsForm.control}
                        name="sessionTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tempo de Sessão (minutos)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min={15} max={1440} />
                            </FormControl>
                            <FormDescription>
                              Tempo de inatividade antes de encerrar a sessão.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Autenticação</h3>
                      <Separator />
                      
                      <FormField
                        control={systemSettingsForm.control}
                        name="twoFactorAuth"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Autenticação de Dois Fatores
                              </FormLabel>
                              <FormDescription>
                                Exigir verificação adicional para acesso administrativo
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemSettingsForm.control}
                        name="auditLogEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Logs de Auditoria
                              </FormLabel>
                              <FormDescription>
                                Registrar todas as ações administrativas no sistema
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configurações de Senha</h3>
                      <Separator />
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <Label className="text-base">Força Mínima da Senha</Label>
                            <p className="text-sm text-muted-foreground">
                              Defina a complexidade mínima exigida para senhas
                            </p>
                          </div>
                          <Select defaultValue="strong">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Básica</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="strong">Forte</SelectItem>
                              <SelectItem value="very-strong">Muito Forte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <Label className="text-base">Expiração de Senha</Label>
                            <p className="text-sm text-muted-foreground">
                              Período para exigir alteração de senha
                            </p>
                          </div>
                          <Select defaultValue="90">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 dias</SelectItem>
                              <SelectItem value="60">60 dias</SelectItem>
                              <SelectItem value="90">90 dias</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </TabsContent>

          {/* Aba de Sistema */}
          <TabsContent value="system">
            <Form {...systemSettingsForm}>
              <form onSubmit={systemSettingsForm.handleSubmit(handleSubmitSettings)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Sistema</CardTitle>
                    <CardDescription>
                      Gerencie as configurações gerais da plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemSettingsForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Site</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Nome exibido no título e cabeçalhos do site.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemSettingsForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail de Contato</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormDescription>
                              E-mail para notificações e contatos do sistema.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={systemSettingsForm.control}
                      name="maintenanceMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-yellow-200 bg-yellow-50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base text-yellow-800">
                              Modo de Manutenção
                            </FormLabel>
                            <FormDescription className="text-yellow-700">
                              Ativa o modo de manutenção para todos os usuários não-administradores
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Recursos Avançados</h3>
                      <Separator />
                      
                      <FormField
                        control={systemSettingsForm.control}
                        name="sentimentAnalysisEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Análise de Sentimento
                              </FormLabel>
                              <FormDescription>
                                Processar automaticamente feedback e comentários para análise de sentimento
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">Integração com OpenAI</Label>
                          <p className="text-sm text-muted-foreground">
                            Configure API key para recursos de IA
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="password"
                            placeholder="sk-********************"
                            className="w-80"
                          />
                          <Button variant="outline">Verificar</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Algumas alterações podem exigir reinicialização do sistema
                    </div>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        {/* Modal para adicionar/editar administrador */}
        <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? "Editar Administrador" : "Adicionar Novo Administrador"}
              </DialogTitle>
              <DialogDescription>
                {editingAdmin 
                  ? "Atualize as informações do administrador existente" 
                  : "Preencha os dados para criar um novo administrador"}
              </DialogDescription>
            </DialogHeader>
            <Form {...adminForm}>
              <form onSubmit={adminForm.handleSubmit(handleSubmitAdmin)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={adminForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={adminForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de Usuário</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2.5">
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </span>
                            <Input {...field} className="pl-8" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2.5">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </span>
                            <Input {...field} type="email" className="pl-8" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={adminForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Função / Nível de Acesso</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma função" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Administrador</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Define o nível de permissões do usuário no sistema
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                        <div className="space-y-0.5">
                          <FormLabel>Usuário Ativo</FormLabel>
                          <FormDescription>
                            Desativar impedirá o acesso ao sistema
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={adminForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {editingAdmin ? "Nova Senha (opcional)" : "Senha"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2.5">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </span>
                            <Input 
                              {...field} 
                              type="password" 
                              className="pl-8" 
                              placeholder={editingAdmin ? "Deixe em branco para manter" : "Senha"}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {editingAdmin 
                            ? "Deixe em branco para manter a senha atual" 
                            : "Mínimo de 6 caracteres"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {editingAdmin ? "Confirmar Nova Senha" : "Confirmar Senha"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2.5">
                              <Key className="h-4 w-4 text-muted-foreground" />
                            </span>
                            <Input 
                              {...field} 
                              type="password" 
                              className="pl-8" 
                              placeholder={editingAdmin ? "Deixe em branco para manter" : "Confirmar senha"}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddAdminModal(false);
                      setEditingAdmin(null);
                      adminForm.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingAdmin ? "Atualizar Administrador" : "Adicionar Administrador"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}