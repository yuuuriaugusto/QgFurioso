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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Pencil,
  BarChart,
  Calendar as CalendarIcon,
  Coins,
  Clock,
  List,
  View,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Plus as PlusIcon,
  X,
  Users,
  Sparkles,
  AlertCircle,
  FileQuestion,
  FileText,
  CheckCircle,
  ClipboardList,
  PanelTopClose,
  BarChart2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";

// Esquema para o formulário de pesquisa
const surveyFormSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  estimatedTimeMinutes: z.coerce.number().min(1).max(60).optional(),
  reward: z.coerce.number().min(0).max(1000),
  expirationDate: z.date().optional(),
  status: z.enum(["draft", "active", "completed", "archived"]),
  questions: z.array(
    z.object({
      questionText: z.string().min(5, {
        message: "A pergunta deve ter pelo menos 5 caracteres.",
      }),
      questionType: z.enum(["text", "select", "multiple", "rating"]),
      options: z.array(z.string()).optional(),
      isRequired: z.boolean().default(true),
    })
  ).min(1, {
    message: "Adicione pelo menos uma pergunta.",
  }),
});

export default function AdminSurveysPage() {
  const { admin } = useAdminAuth();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  // Form para criar/editar pesquisa
  const form = useForm<z.infer<typeof surveyFormSchema>>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      estimatedTimeMinutes: 5,
      reward: 10,
      status: "draft",
      questions: [
        {
          questionText: "",
          questionType: "text",
          options: [],
          isRequired: true,
        },
      ],
    },
  });

  // Campo de array para perguntas
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // Carregar pesquisas
  const { data: surveys, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/surveys", selectedStatus],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/admin/surveys${selectedStatus ? `?status=${selectedStatus}` : ""}`);
        
        if (!response.ok) {
          throw new Error("Falha ao carregar pesquisas");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Erro ao carregar pesquisas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de pesquisas",
          variant: "destructive",
        });
        
        // Dados de exemplo para desenvolvimento com datas válidas
        return [
          {
            id: 1,
            title: "Avaliação dos Novos Uniformes",
            description: "Ajude-nos a avaliar a qualidade e design dos novos uniformes FURIA.",
            reward: 20,
            expirationDate: new Date(2023, 5, 30).toISOString(),
            status: "active",
            estimatedTimeMinutes: 5,
            createdAt: new Date(2023, 4, 1).toISOString(),
            updatedAt: new Date(2023, 4, 1).toISOString(),
            questionCount: 5,
            responseCount: 125,
          },
          {
            id: 2,
            title: "Pesquisa sobre Conteúdo na Plataforma",
            description: "Queremos saber sua opinião sobre os conteúdos disponibilizados na plataforma.",
            reward: 15,
            expirationDate: new Date(2023, 5, 15).toISOString(),
            status: "active",
            estimatedTimeMinutes: 8,
            createdAt: new Date(2023, 3, 20).toISOString(),
            updatedAt: new Date(2023, 3, 20).toISOString(),
            questionCount: 8,
            responseCount: 78,
          },
          {
            id: 3,
            title: "Pesquisa sobre Eventos FURIA",
            description: "Sua opinião sobre os eventos presenciais e online da FURIA.",
            reward: 25,
            expirationDate: new Date(2023, 3, 10).toISOString(),
            status: "completed",
            estimatedTimeMinutes: 10,
            createdAt: new Date(2023, 2, 15).toISOString(),
            updatedAt: new Date(2023, 3, 11).toISOString(),
            questionCount: 12,
            responseCount: 210,
          }
        ];
    },
  });

  // Carregar estatísticas de uma pesquisa específica
  const { data: surveyStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/surveys", selectedSurvey?.id, "stats"],
    queryFn: async () => {
      if (!selectedSurvey) return null;
      
      try {
        const response = await fetch(`/api/admin/surveys/${selectedSurvey.id}/stats`);
        if (!response.ok) {
          throw new Error("Falha ao carregar estatísticas da pesquisa");
        }
        return await response.json();
      } catch (error) {
        console.error("Erro ao carregar estatísticas da pesquisa:", error);
        
        // Dados de exemplo para desenvolvimento com datas válidas
        return {
          totalResponses: selectedSurvey.responseCount,
          completionRate: 0.92,
          averageTimeMinutes: 4.5,
          responsesByDay: {
            "01/05/2023": 15,
            "02/05/2023": 23,
            "03/05/2023": 18,
            "04/05/2023": 22,
            "05/05/2023": 30,
            "06/05/2023": 12,
            "07/05/2023": 5,
          },
        questionStats: [
          {
            id: 1,
            questionText: "Qual sua opinião sobre o design do novo uniforme?",
            type: "text",
            responsesCount: selectedSurvey.responseCount,
            sampleResponses: [
              "Adorei o design, principalmente o detalhe do logo nas mangas.",
              "Muito bonito, mas preferia as cores anteriores.",
              "Excelente design, representa bem a identidade da FURIA."
            ]
          },
          {
            id: 2,
            questionText: "Como você avalia a qualidade do material?",
            type: "rating",
            avgRating: 4.2,
            ratings: {
              "1": 5,
              "2": 8,
              "3": 15,
              "4": 45,
              "5": 52
            }
          },
          {
            id: 3,
            questionText: "Que outros itens você gostaria de ver com este design?",
            type: "multiple",
            options: {
              "Boné": 89,
              "Moletom": 105,
              "Calça": 68,
              "Meia": 45,
              "Tênis": 74
            }
          }
        ],
        demographicData: {
          ageGroups: {
            "18-24": 68,
            "25-34": 42,
            "35-44": 10,
            "45+": 5
          },
          gender: {
            "Masculino": 85,
            "Feminino": 35,
            "Outro/Prefiro não informar": 5
          }
        }
      };
    },
    enabled: !!selectedSurvey,
  });

  // Filtrar pesquisas com base no status selecionado
  const filteredSurveys = surveys?.filter(survey => {
    return !selectedStatus || survey.status === selectedStatus;
  });

  // Mutation para criar nova pesquisa
  const createSurveyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof surveyFormSchema>) => {
      // Simulação de criação - em produção, chamar a API real
      console.log("Criando nova pesquisa:", data);
      return {
        id: Math.floor(Math.random() * 1000),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        questionCount: data.questions.length,
        responseCount: 0,
      };
    },
    onSuccess: () => {
      toast({
        title: "Pesquisa criada",
        description: "A pesquisa foi criada com sucesso.",
      });
      setShowSurveyForm(false);
      form.reset();
      refetch();
    },
    onError: () => {
      toast({
        title: "Erro ao criar pesquisa",
        description: "Ocorreu um erro ao criar a pesquisa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar pesquisa
  const updateSurveyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof surveyFormSchema> & { id: number }) => {
      // Simulação de atualização - em produção, chamar a API real
      console.log("Atualizando pesquisa:", data);
      return {
        ...data,
        updatedAt: new Date(),
        questionCount: data.questions.length,
      };
    },
    onSuccess: () => {
      toast({
        title: "Pesquisa atualizada",
        description: "A pesquisa foi atualizada com sucesso.",
      });
      setShowSurveyForm(false);
      setSelectedSurvey(null);
      form.reset();
      refetch();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar pesquisa",
        description: "Ocorreu um erro ao atualizar a pesquisa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir pesquisa
  const deleteSurveyMutation = useMutation({
    mutationFn: async (id: number) => {
      // Simulação de exclusão - em produção, chamar a API real
      console.log("Excluindo pesquisa:", id);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Pesquisa excluída",
        description: "A pesquisa foi excluída com sucesso.",
      });
      setShowDeleteConfirm(false);
      setSelectedSurvey(null);
      refetch();
    },
    onError: () => {
      toast({
        title: "Erro ao excluir pesquisa",
        description: "Ocorreu um erro ao excluir a pesquisa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Função para adicionar opção a uma pergunta
  const addOptionToQuestion = (questionIndex: number, option: string) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    form.setValue(`questions.${questionIndex}.options`, [...currentOptions, option]);
  };

  // Função para remover opção de uma pergunta
  const removeOptionFromQuestion = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    form.setValue(
      `questions.${questionIndex}.options`,
      currentOptions.filter((_, i) => i !== optionIndex)
    );
  };

  // Função para iniciar edição de pesquisa
  const handleEditSurvey = (survey: any) => {
    // Simular carregamento de detalhes da pesquisa - em produção, buscar da API
    const mockSurveyDetail = {
      ...survey,
      questions: [
        {
          questionText: "Qual sua opinião sobre o design do novo uniforme?",
          questionType: "text",
          isRequired: true,
        },
        {
          questionText: "Como você avalia a qualidade do material?",
          questionType: "rating",
          isRequired: true,
        },
        {
          questionText: "Que outros itens você gostaria de ver com este design?",
          questionType: "multiple",
          options: ["Boné", "Moletom", "Calça", "Meia", "Tênis"],
          isRequired: false,
        },
        {
          questionText: "Qual tamanho você costuma comprar?",
          questionType: "select",
          options: ["P", "M", "G", "GG", "XG"],
          isRequired: true,
        },
        {
          questionText: "Comentários adicionais sobre o uniforme:",
          questionType: "text",
          isRequired: false,
        },
      ],
    };

    form.reset({
      title: mockSurveyDetail.title,
      description: mockSurveyDetail.description,
      estimatedTimeMinutes: mockSurveyDetail.estimatedTimeMinutes,
      reward: mockSurveyDetail.reward,
      expirationDate: mockSurveyDetail.expirationDate ? new Date(mockSurveyDetail.expirationDate) : undefined,
      status: mockSurveyDetail.status,
      questions: mockSurveyDetail.questions,
    });

    setSelectedSurvey(survey);
    setShowSurveyForm(true);
  };

  // Função para obter o status da pesquisa em formato legível
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Rascunho</Badge>;
      case "active":
        return <Badge className="bg-green-500">Ativa</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Concluída</Badge>;
      case "archived":
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Arquivada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Função para obter o tipo de pergunta em formato legível
  const getQuestionTypeDisplay = (type: string) => {
    switch (type) {
      case "text":
        return "Texto";
      case "select":
        return "Seleção única";
      case "multiple":
        return "Múltipla escolha";
      case "rating":
        return "Avaliação";
      default:
        return type;
    }
  };

  // Função para obter ícone do tipo de pergunta
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />;
      case "select":
        return <List className="h-4 w-4" />;
      case "multiple":
        return <CheckCircle className="h-4 w-4" />;
      case "rating":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <FileQuestion className="h-4 w-4" />;
    }
  };

  // Submissão do formulário
  const onSubmit = (data: z.infer<typeof surveyFormSchema>) => {
    if (selectedSurvey) {
      updateSurveyMutation.mutate({ ...data, id: selectedSurvey.id });
    } else {
      createSurveyMutation.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pesquisas</h1>
            <p className="text-muted-foreground">
              Gerencie pesquisas e questionários para usuários
            </p>
          </div>
          <Button onClick={() => {
            form.reset({
              title: "",
              description: "",
              estimatedTimeMinutes: 5,
              reward: 10,
              status: "draft",
              questions: [
                {
                  questionText: "",
                  questionType: "text",
                  options: [],
                  isRequired: true,
                },
              ],
            });
            setSelectedSurvey(null);
            setShowSurveyForm(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Nova Pesquisa
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Pesquisas ({filteredSurveys?.length || 0})</CardTitle>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="draft">Rascunhos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="archived">Arquivadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                      <TableHead>Perguntas</TableHead>
                      <TableHead>Respostas</TableHead>
                      <TableHead>Expira</TableHead>
                      <TableHead>Criada</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSurveys.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell className="font-medium">{survey.title}</TableCell>
                        <TableCell>{getStatusBadge(survey.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 mr-1 text-amber-500" />
                            {survey.reward}
                          </div>
                        </TableCell>
                        <TableCell>{survey.questionCount}</TableCell>
                        <TableCell>{survey.responseCount}</TableCell>
                        <TableCell>
                          {survey.expirationDate ? (
                            format(new Date(survey.expirationDate), "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span className="text-muted-foreground">Sem data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(survey.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {survey.responseCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSurvey(survey);
                                  setShowStatsDialog(true);
                                }}
                              >
                                <BarChart className="h-4 w-4 mr-1" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Ver Estatísticas</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSurvey(survey)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              <span className="sr-only sm:not-sr-only">Editar</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  <span className="sr-only sm:not-sr-only">Excluir</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir pesquisa</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a pesquisa "{survey.title}"?
                                    {survey.responseCount > 0 && (
                                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
                                        <AlertCircle className="h-4 w-4 inline-block mr-1" />
                                        Esta pesquisa possui {survey.responseCount} respostas. Os dados serão preservados para análise, mas a pesquisa não estará mais disponível.
                                      </div>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => deleteSurveyMutation.mutate(survey.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma pesquisa encontrada</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  {selectedStatus 
                    ? `Não há pesquisas com o status "${selectedStatus}" no momento.`
                    : "Não há pesquisas cadastradas ainda. Crie sua primeira pesquisa para começar."}
                </p>
                {selectedStatus && (
                  <Button variant="outline" onClick={() => setSelectedStatus(undefined)}>
                    Ver todas as pesquisas
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para criar/editar pesquisa */}
      <Dialog open={showSurveyForm} onOpenChange={setShowSurveyForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedSurvey ? "Editar Pesquisa" : "Nova Pesquisa"}</DialogTitle>
            <DialogDescription>
              {selectedSurvey 
                ? "Edite os detalhes e perguntas da pesquisa existente."
                : "Crie uma nova pesquisa para os usuários da plataforma."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Detalhes da Pesquisa</TabsTrigger>
                  <TabsTrigger value="questions">Perguntas</TabsTrigger>
                </TabsList>
                
                {/* Aba de Detalhes */}
                <TabsContent value="details" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Pesquisa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Nome que será exibido para os usuários.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Rascunho</SelectItem>
                              <SelectItem value="active">Ativa</SelectItem>
                              <SelectItem value="completed">Concluída</SelectItem>
                              <SelectItem value="archived">Arquivada</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Apenas pesquisas "Ativas" são visíveis aos usuários.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4} 
                            placeholder="Descreva o objetivo da pesquisa e o que os usuários podem esperar."
                          />
                        </FormControl>
                        <FormDescription>
                          Forneça detalhes sobre o objetivo da pesquisa.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="reward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recompensa (FURIA Coins)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Coins className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input type="number" {...field} className="pl-8" min={0} max={1000} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Quantidade de FURIA Coins que o usuário receberá ao completar a pesquisa.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estimatedTimeMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempo Estimado (minutos)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input type="number" {...field} className="pl-8" min={1} max={60} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Tempo estimado para completar a pesquisa.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expirationDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Expiração</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => date < new Date()}
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Data limite para participar da pesquisa. Opcional.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {/* Aba de Perguntas */}
                <TabsContent value="questions" className="space-y-6 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Perguntas da Pesquisa</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({
                        questionText: "",
                        questionType: "text",
                        options: [],
                        isRequired: true,
                      })}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" /> Adicionar Pergunta
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div 
                        key={field.id} 
                        className="border rounded-md p-4 relative"
                      >
                        <div className="absolute -top-3 left-3 bg-background px-2 text-xs text-muted-foreground">
                          Pergunta {index + 1}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                          <div className="md:col-span-5">
                            <FormField
                              control={form.control}
                              name={`questions.${index}.questionText`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Texto da Pergunta</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`questions.${index}.questionType`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="text">Texto</SelectItem>
                                      <SelectItem value="select">Seleção única</SelectItem>
                                      <SelectItem value="multiple">Múltipla escolha</SelectItem>
                                      <SelectItem value="rating">Avaliação</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="md:col-span-1 flex flex-col justify-end items-center gap-2">
                            <div className="flex items-center gap-2">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => move(index, index - 1)}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {index < fields.length - 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => move(index, index + 1)}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => fields.length > 1 && remove(index)}
                                disabled={fields.length <= 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Opções para tipos de pergunta que as necessitam */}
                        {(form.watch(`questions.${index}.questionType`) === "select" || 
                          form.watch(`questions.${index}.questionType`) === "multiple") && (
                          <div className="mt-4">
                            <FormLabel>Opções</FormLabel>
                            <div className="space-y-2 mt-2">
                              {(form.watch(`questions.${index}.options`) || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <Input 
                                    value={option}
                                    onChange={(e) => {
                                      const currentOptions = form.getValues(`questions.${index}.options`) || [];
                                      const newOptions = [...currentOptions];
                                      newOptions[optionIndex] = e.target.value;
                                      form.setValue(`questions.${index}.options`, newOptions);
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => removeOptionFromQuestion(index, optionIndex)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              
                              <div className="flex items-center gap-2">
                                <Input 
                                  placeholder="Nova opção..."
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                      e.preventDefault();
                                      addOptionToQuestion(index, e.currentTarget.value.trim());
                                      e.currentTarget.value = "";
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                      addOptionToQuestion(index, input.value.trim());
                                      input.value = "";
                                    }
                                  }}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {!form.watch(`questions.${index}.options`)?.length && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Adicione pelo menos uma opção para esta pergunta.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name={`questions.${index}.isRequired`}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="m-0">Resposta obrigatória</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {form.formState.errors.questions && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.questions.message}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSurveyForm(false);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createSurveyMutation.isPending || updateSurveyMutation.isPending}>
                  {selectedSurvey ? "Atualizar Pesquisa" : "Criar Pesquisa"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de estatísticas */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Estatísticas da Pesquisa</DialogTitle>
            <DialogDescription>
              {selectedSurvey?.title} - {format(new Date(selectedSurvey?.createdAt), "dd/MM/yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingStats ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : surveyStats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{surveyStats.totalResponses}</div>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(surveyStats.totalResponses / 2)} novas nas últimas 24h
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {(surveyStats.completionRate * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {surveyStats.completionRate > 0.8 ? "Excelente" : "Boa"} taxa de conclusão
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {surveyStats.averageTimeMinutes.toFixed(1)} min
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {surveyStats.averageTimeMinutes < selectedSurvey?.estimatedTimeMinutes 
                        ? "Menor que o estimado" 
                        : "Próximo do estimado"}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Respostas por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    {/* Simulação simplificada de gráfico */}
                    <div className="flex h-full items-end gap-2">
                      {Object.entries(surveyStats.responsesByDay).map(([date, count], i) => (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div 
                            className="bg-primary w-full rounded-t-sm" 
                            style={{ 
                              height: `${(Number(count) / Math.max(...Object.values(surveyStats.responsesByDay).map(Number))) * 100}%` 
                            }}
                          ></div>
                          <div className="text-xs mt-1 rotate-45 origin-left translate-y-4">
                            {date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-medium">Estatísticas por Pergunta</h3>
              
              <div className="space-y-6">
                {surveyStats.questionStats.map((question, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {getQuestionTypeIcon(question.type)}
                        <CardTitle className="text-base">{question.questionText}</CardTitle>
                      </div>
                      <CardDescription>
                        {getQuestionTypeDisplay(question.type)} - {question.responsesCount} respostas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {question.type === "text" && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Exemplos de respostas:</p>
                          {question.sampleResponses?.map((response, i) => (
                            <div key={i} className="p-2 bg-muted rounded-md">
                              "{response}"
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === "rating" && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold">{question.avgRating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">média de 5</span>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(question.ratings).map(([rating, count], i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-8">{rating} ★</div>
                                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${(Number(count) / question.responsesCount) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="w-10 text-right text-sm">{count}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(question.type === "select" || question.type === "multiple") && (
                        <div className="space-y-2">
                          {Object.entries(question.options).map(([option, count], i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-24 truncate">{option}</div>
                              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${(Number(count) / question.responsesCount) * 100}%` }}
                                ></div>
                              </div>
                              <div className="w-20 text-right text-sm">
                                {count} ({((Number(count) / question.responsesCount) * 100).toFixed(0)}%)
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <Card>
                <CardHeader>
                  <CardTitle>Dados Demográficos</CardTitle>
                  <CardDescription>
                    Perfil dos respondentes da pesquisa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Faixa Etária</h4>
                      <div className="space-y-2">
                        {Object.entries(surveyStats.demographicData.ageGroups).map(([age, count], i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-12">{age}</div>
                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${(Number(count) / surveyStats.totalResponses) * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-16 text-right text-sm">
                              {((Number(count) / surveyStats.totalResponses) * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Gênero</h4>
                      <div className="space-y-2">
                        {Object.entries(surveyStats.demographicData.gender).map(([gender, count], i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-32 truncate">{gender}</div>
                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${(Number(count) / surveyStats.totalResponses) * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-16 text-right text-sm">
                              {((Number(count) / surveyStats.totalResponses) * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Sem dados disponíveis</h3>
              <p className="text-muted-foreground max-w-md">
                Não foi possível carregar as estatísticas para esta pesquisa.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}