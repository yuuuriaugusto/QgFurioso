import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Plus, Trash, Edit, Eye, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAdminAuth } from "@/hooks/use-admin-auth";

// Componente principal
export default function AdminSurveysPage() {
  const { admin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Dados mockados para visualização, substituir com dados reais da API posteriormente
  const { data: surveys, isLoading } = useQuery({
    queryKey: ["/api/admin/surveys"],
    queryFn: async () => {
      return [
        {
          id: 1,
          title: "Satisfação com Eventos da FURIA",
          description: "Pesquisa para avaliar a satisfação dos fãs com os eventos recentes da FURIA",
          reward: 50,
          status: "active",
          questionCount: 10,
          responseCount: 142,
          estimatedTimeMinutes: 5,
          expirationDate: new Date(2025, 5, 15),
          createdAt: new Date(2025, 4, 1),
        },
        {
          id: 2,
          title: "Preferências de Conteúdo",
          description: "Ajude-nos a entender que tipo de conteúdo você prefere ver da FURIA",
          reward: 30,
          status: "draft",
          questionCount: 8,
          responseCount: 0,
          estimatedTimeMinutes: 3,
          expirationDate: new Date(2025, 6, 20),
          createdAt: new Date(2025, 4, 10),
        },
        {
          id: 3,
          title: "Feedback sobre Novos Produtos",
          description: "Sua opinião sobre os novos produtos lançados na loja da FURIA",
          reward: 100,
          status: "expired",
          questionCount: 15,
          responseCount: 287,
          estimatedTimeMinutes: 10,
          expirationDate: new Date(2025, 3, 30),
          createdAt: new Date(2025, 3, 1),
        },
      ];
    },
  });

  // Filtra pesquisas com base nos critérios
  const filteredSurveys = surveys?.filter((survey) => {
    const matchesSearch = searchTerm === "" || 
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || survey.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Formatação de status para exibição
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Ativa</Badge>;
      case "draft":
        return <Badge variant="outline">Rascunho</Badge>;
      case "expired":
        return <Badge variant="secondary">Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Pesquisas</h1>
            <p className="text-muted-foreground">
              Crie e gerencie pesquisas para os usuários da plataforma.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Pesquisa
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine a lista de pesquisas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <div className="relative w-full md:w-2/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar pesquisas..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-full md:w-1/3">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="expired">Expirada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle>Pesquisas ({filteredSurveys?.length || 0})</CardTitle>
            <CardDescription>Lista de todas as pesquisas disponíveis na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredSurveys && filteredSurveys.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recompensa</TableHead>
                      <TableHead>Respostas</TableHead>
                      <TableHead>Expiração</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSurveys.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-medium">{survey.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {survey.questionCount} perguntas · {survey.estimatedTimeMinutes} min
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(survey.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                            {survey.reward} moedas
                          </Badge>
                        </TableCell>
                        <TableCell>{survey.responseCount}</TableCell>
                        <TableCell>
                          {format(survey.expirationDate, "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-muted-foreground mb-4">Nenhuma pesquisa encontrada.</p>
                <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Criar Nova Pesquisa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de criação de pesquisa */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Pesquisa</DialogTitle>
              <DialogDescription>
                Preencha os detalhes básicos da pesquisa. Você poderá adicionar perguntas depois.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título da Pesquisa</Label>
                <Input id="title" placeholder="Ex: Satisfação com Eventos da FURIA" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o objetivo desta pesquisa para os usuários"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reward">Recompensa (Moedas)</Label>
                  <Input
                    id="reward"
                    type="number"
                    min="0"
                    placeholder="Ex: 50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estimatedTime">Tempo Estimado (minutos)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="1"
                    placeholder="Ex: 5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data de Expiração</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Selecionar data</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="draft">
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="active">Ativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Pesquisa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}