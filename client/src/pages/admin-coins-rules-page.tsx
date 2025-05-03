import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { Loader2, Search, PlusCircle, Edit, Trash, MoreHorizontal, Award, EyeIcon, Sparkles, Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Tipos
type PointRule = {
  id: number;
  title: string;
  description: string;
  pointsAmount: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  cooldownHours: number | null;
  maxOccurrences: number | null;
};

type PointRulesResponse = {
  rules: PointRule[];
  totalCount: number;
  pageCount: number;
};

export default function AdminCoinsRulesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PointRule | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Mock api call para regras de pontos - substituir pela API real quando disponível
  const { data, isLoading } = useQuery<PointRulesResponse>({
    queryKey: ["/api/admin/coins/rules", page, categoryFilter, statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter === "active" ? "true" : "false");
      if (search) params.append("search", search);
      
      try {
        const res = await apiRequest("GET", `/api/admin/coins/rules?${params.toString()}`);
        if (!res.ok) {
          // Fallback para dados mock em desenvolvimento
          return {
            rules: mockPointRules,
            totalCount: mockPointRules.length,
            pageCount: 1
          };
        }
        return await res.json();
      } catch (error) {
        console.error("Erro ao buscar regras de pontos:", error);
        // Fallback para dados mock em desenvolvimento
        return {
          rules: mockPointRules,
          totalCount: mockPointRules.length,
          pageCount: 1
        };
      }
    },
  });
  
  // Mock mutation para editar regra
  const editRuleMutation = useMutation({
    mutationFn: async (rule: PointRule) => {
      try {
        const res = await apiRequest("PUT", `/api/admin/coins/rules/${rule.id}`, rule);
        if (!res.ok) throw new Error("Falha ao atualizar regra");
        return await res.json();
      } catch (error) {
        // Em desenvolvimento, apenas simular sucesso
        console.log("Simulando atualização de regra:", rule);
        return rule;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coins/rules"] });
      setShowRuleDialog(false);
      toast({
        title: "Regra atualizada",
        description: "A regra de pontuação foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    },
  });
  
  // Mock mutation para criar regra
  const createRuleMutation = useMutation({
    mutationFn: async (rule: Omit<PointRule, "id" | "createdAt" | "updatedAt">) => {
      try {
        const res = await apiRequest("POST", "/api/admin/coins/rules", rule);
        if (!res.ok) throw new Error("Falha ao criar regra");
        return await res.json();
      } catch (error) {
        // Em desenvolvimento, apenas simular sucesso
        console.log("Simulando criação de regra:", rule);
        return {
          ...rule,
          id: Math.floor(Math.random() * 1000) + 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coins/rules"] });
      setShowRuleDialog(false);
      toast({
        title: "Regra criada",
        description: "A nova regra de pontuação foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    },
  });
  
  // Mock data para visualização da interface
  const mockPointRules: PointRule[] = [
    {
      id: 1,
      title: "Cadastro Completo",
      description: "Pontos concedidos quando o usuário completa todas as informações do perfil.",
      pointsAmount: 50,
      category: "profile",
      isActive: true,
      createdAt: "2023-01-10T14:30:00Z",
      updatedAt: "2023-01-10T14:30:00Z",
      isRecurring: false,
      cooldownHours: null,
      maxOccurrences: 1
    },
    {
      id: 2,
      title: "Login Diário",
      description: "Pontos concedidos pelo primeiro login do dia na plataforma.",
      pointsAmount: 10,
      category: "engagement",
      isActive: true,
      createdAt: "2023-01-11T09:45:00Z",
      updatedAt: "2023-02-15T11:20:00Z",
      isRecurring: true,
      cooldownHours: 24,
      maxOccurrences: null
    },
    {
      id: 3,
      title: "Responder Pesquisa",
      description: "Pontos concedidos quando o usuário responde uma pesquisa completa.",
      pointsAmount: 25,
      category: "surveys",
      isActive: true,
      createdAt: "2023-01-15T16:20:00Z",
      updatedAt: "2023-01-15T16:20:00Z",
      isRecurring: true,
      cooldownHours: null,
      maxOccurrences: null
    },
    {
      id: 4,
      title: "Assistir Transmissão",
      description: "Pontos concedidos a cada 30 minutos assistindo uma transmissão ao vivo.",
      pointsAmount: 5,
      category: "content",
      isActive: true,
      createdAt: "2023-01-20T13:15:00Z",
      updatedAt: "2023-03-05T14:30:00Z",
      isRecurring: true,
      cooldownHours: 0.5,
      maxOccurrences: null
    },
    {
      id: 5,
      title: "Streak Semanal",
      description: "Bônus concedido por fazer login 7 dias consecutivos.",
      pointsAmount: 25,
      category: "engagement",
      isActive: true,
      createdAt: "2023-02-01T10:10:00Z",
      updatedAt: "2023-02-01T10:10:00Z",
      isRecurring: true,
      cooldownHours: 168,
      maxOccurrences: null
    },
    {
      id: 6,
      title: "Compartilhar Conteúdo",
      description: "Pontos concedidos ao compartilhar conteúdo do FURIA nas redes sociais.",
      pointsAmount: 15,
      category: "social",
      isActive: true,
      createdAt: "2023-02-10T11:30:00Z",
      updatedAt: "2023-02-10T11:30:00Z",
      isRecurring: true,
      cooldownHours: 24,
      maxOccurrences: 3
    },
    {
      id: 7,
      title: "Indicar Amigo",
      description: "Pontos concedidos quando um amigo indicado se cadastra e completa o perfil.",
      pointsAmount: 100,
      category: "referral",
      isActive: true,
      createdAt: "2023-02-15T15:45:00Z",
      updatedAt: "2023-02-15T15:45:00Z",
      isRecurring: true,
      cooldownHours: null,
      maxOccurrences: null
    }
  ];
  
  const displayRules = data?.rules || mockPointRules;
  
  const handleRuleEdit = (rule: PointRule) => {
    setSelectedRule(rule);
    setEditMode(true);
    setShowRuleDialog(true);
  };
  
  const handleRuleView = (rule: PointRule) => {
    setSelectedRule(rule);
    setEditMode(false);
    setShowRuleDialog(true);
  };
  
  const handleAddNewRule = () => {
    setSelectedRule(null);
    setEditMode(true);
    setShowRuleDialog(true);
  };
  
  // Formata data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Status da regra em formato badge
  const getRuleStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Ativa</Badge>
      : <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Inativa</Badge>;
  };
  
  // Categoria da regra em formato legível
  const getRuleCategoryDisplay = (category: string) => {
    switch (category) {
      case "profile":
        return "Perfil";
      case "engagement":
        return "Engajamento";
      case "surveys":
        return "Pesquisas";
      case "content":
        return "Conteúdo";
      case "social":
        return "Social";
      case "referral":
        return "Indicação";
      default:
        return category;
    }
  };
  
  // Obter ícone para categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "profile":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 font-normal flex items-center gap-1 py-1">
          <EyeIcon className="h-3 w-3" /> Perfil
        </Badge>;
      case "engagement":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 font-normal flex items-center gap-1 py-1">
          <Activity className="h-3 w-3" /> Engajamento
        </Badge>;
      case "surveys":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 font-normal flex items-center gap-1 py-1">
          <Edit className="h-3 w-3" /> Pesquisas
        </Badge>;
      case "content":
        return <Badge variant="outline" className="bg-green-50 text-green-700 font-normal flex items-center gap-1 py-1">
          <Activity className="h-3 w-3" /> Conteúdo
        </Badge>;
      case "social":
        return <Badge variant="outline" className="bg-pink-50 text-pink-700 font-normal flex items-center gap-1 py-1">
          <Sparkles className="h-3 w-3" /> Social
        </Badge>;
      case "referral":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 font-normal flex items-center gap-1 py-1">
          <Award className="h-3 w-3" /> Indicação
        </Badge>;
      default:
        return <Badge variant="outline" className="font-normal">
          {category}
        </Badge>;
    }
  };
  
  // Formatação de regras de recorrência
  const getRecurrenceText = (rule: PointRule) => {
    if (!rule.isRecurring) {
      return "Uma vez";
    }
    
    if (rule.cooldownHours === null || rule.cooldownHours === 0) {
      if (rule.maxOccurrences) {
        return `Máximo ${rule.maxOccurrences} vezes`;
      }
      return "Sem limite";
    }
    
    if (rule.cooldownHours === 24) {
      return "Diariamente";
    }
    
    if (rule.cooldownHours === 168) {
      return "Semanalmente";
    }
    
    if (rule.cooldownHours < 1) {
      return `A cada ${rule.cooldownHours * 60} minutos`;
    }
    
    return `A cada ${rule.cooldownHours} horas`;
  };
  
  // Handler para salvar regra (criar ou editar)
  const handleSaveRule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const rule = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      pointsAmount: parseInt(formData.get("pointsAmount") as string, 10),
      category: formData.get("category") as string,
      isActive: formData.get("isActive") === "on",
      isRecurring: formData.get("isRecurring") === "on",
      cooldownHours: formData.get("cooldownHours") ? parseFloat(formData.get("cooldownHours") as string) : null,
      maxOccurrences: formData.get("maxOccurrences") ? parseInt(formData.get("maxOccurrences") as string, 10) : null,
    };
    
    if (selectedRule) {
      // Editar regra existente
      editRuleMutation.mutate({
        ...selectedRule,
        ...rule,
      });
    } else {
      // Criar nova regra
      createRuleMutation.mutate(rule);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Regras de Pontuação</h2>
          <Button className="flex items-center gap-2" onClick={handleAddNewRule}>
            <PlusCircle className="h-4 w-4" />
            Adicionar Regra
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Regras de FURIA Coins</CardTitle>
            <CardDescription>
              Gerencie as regras para ganho de FURIA Coins na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros e pesquisa */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex items-center flex-1">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Buscar regra..." 
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-40">
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">Todas categorias</option>
                    <option value="profile">Perfil</option>
                    <option value="engagement">Engajamento</option>
                    <option value="surveys">Pesquisas</option>
                    <option value="content">Conteúdo</option>
                    <option value="social">Social</option>
                    <option value="referral">Indicação</option>
                  </select>
                </div>
                <div className="w-32">
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Tabela de regras */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Regra</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Recorrência</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Atualizado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.id}</TableCell>
                        <TableCell>
                          <div className="font-medium truncate max-w-xs">{rule.title}</div>
                        </TableCell>
                        <TableCell>{getCategoryIcon(rule.category)}</TableCell>
                        <TableCell className="font-semibold text-primary">{rule.pointsAmount}</TableCell>
                        <TableCell>{getRecurrenceText(rule)}</TableCell>
                        <TableCell>{getRuleStatusBadge(rule.isActive)}</TableCell>
                        <TableCell>{formatDate(rule.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleRuleView(rule)}>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRuleEdit(rule)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {rule.isActive ? (
                                  <>
                                    <Trash className="h-4 w-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <Award className="h-4 w-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Paginação */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Exibindo {displayRules.length} de {data?.totalCount || displayRules.length} resultados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === (data?.pageCount || 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog de regra */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editMode 
                ? selectedRule 
                  ? "Editar Regra de Pontuação" 
                  : "Adicionar Nova Regra"
                : "Detalhes da Regra"
              }
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Preencha os campos abaixo para configurar a regra de pontuação."
                : "Informações detalhadas sobre a regra de pontuação."
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveRule}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Regra</Label>
                  <Input 
                    id="title" 
                    name="title"
                    placeholder="Título da regra"
                    defaultValue={selectedRule?.title || ""}
                    disabled={!editMode}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pointsAmount">Quantidade de Pontos</Label>
                  <Input 
                    id="pointsAmount" 
                    name="pointsAmount"
                    type="number"
                    placeholder="0"
                    defaultValue={selectedRule?.pointsAmount || ""}
                    disabled={!editMode}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Descreva como os usuários ganham pontos com esta regra..."
                  rows={3}
                  defaultValue={selectedRule?.description || ""}
                  disabled={!editMode}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    name="category"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    defaultValue={selectedRule?.category || "engagement"}
                    disabled={!editMode}
                  >
                    <option value="profile">Perfil</option>
                    <option value="engagement">Engajamento</option>
                    <option value="surveys">Pesquisas</option>
                    <option value="content">Conteúdo</option>
                    <option value="social">Social</option>
                    <option value="referral">Indicação</option>
                  </select>
                </div>
                
                <div className="space-y-2 flex items-center justify-end">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="isActive" 
                      name="isActive"
                      defaultChecked={selectedRule?.isActive ?? true}
                      disabled={!editMode}
                    />
                    <Label htmlFor="isActive">Regra Ativa</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isRecurring" 
                    name="isRecurring"
                    defaultChecked={selectedRule?.isRecurring ?? false}
                    disabled={!editMode}
                  />
                  <Label htmlFor="isRecurring">Regra Recorrente</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ative para permitir que o usuário ganhe pontos múltiplas vezes com esta regra.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cooldownHours">Período de Recarga (horas)</Label>
                  <Input 
                    id="cooldownHours" 
                    name="cooldownHours"
                    type="number"
                    step="0.5"
                    placeholder="Ex: 24 para diário"
                    defaultValue={selectedRule?.cooldownHours || ""}
                    disabled={!editMode || !(selectedRule?.isRecurring ?? false)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo mínimo entre ocorrências (em horas). Use 0.5 para 30 minutos, 24 para diário, etc.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxOccurrences">Máximo de Ocorrências</Label>
                  <Input 
                    id="maxOccurrences" 
                    name="maxOccurrences"
                    type="number"
                    placeholder="Deixe vazio para ilimitado"
                    defaultValue={selectedRule?.maxOccurrences || ""}
                    disabled={!editMode || !(selectedRule?.isRecurring ?? false)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Número máximo de vezes que o usuário pode ganhar pontos com esta regra. Deixe vazio para ilimitado.
                  </p>
                </div>
              </div>
            </div>
            
            {editMode && (
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowRuleDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {selectedRule ? "Salvar Alterações" : "Criar Regra"}
                </Button>
              </DialogFooter>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}