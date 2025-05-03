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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Calendar as CalendarIcon,
  Filter,
  Search,
  Smile,
  Frown,
  Meh,
  MessageSquare,
  Download,
  ExternalLink,
  Info,
  AlignLeft,
  TrendingUp,
  Clock,
  Hash,
  Heart,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminFanSentimentPage() {
  const { admin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSentiment, setSelectedSentiment] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

  // Carregar análises de sentimento
  const { data: sentimentData, isLoading } = useQuery({
    queryKey: ["/api/admin/fan-sentiment", selectedCategory, selectedSentiment, dateRange],
    queryFn: async () => {
      // Dados mockados para visualização
      return {
        summary: {
          totalFeedbacks: 486,
          averageRating: 3.8,
          sentimentDistribution: {
            positive: 289,
            neutral: 124,
            negative: 73,
          },
          topCategories: [
            { category: "game_experience", count: 145, label: "Experiência de Jogo" },
            { category: "content", count: 112, label: "Conteúdo" },
            { category: "platform", count: 98, label: "Plataforma" },
            { category: "events", count: 75, label: "Eventos" },
            { category: "merchandise", count: 56, label: "Produtos" },
          ],
          recentTrend: "stable", // "improving", "declining", "stable"
        },
        feedbacks: [
          {
            id: 1,
            userId: 42,
            category: "game_experience",
            sentiment: "positive",
            rating: 5,
            text: "Adorei a cobertura da última partida do CS2. A análise pós-jogo foi muito detalhada e me ajudou a entender melhor as estratégias do time. Parabéns!",
            createdAt: new Date(2025, 4, 10, 9, 30),
            source: "in_app",
            relatedTo: "match_123",
            hasResponse: false,
            tags: ["cs2", "match_coverage", "analysis"],
          },
          {
            id: 2,
            userId: 15,
            category: "platform",
            sentiment: "negative",
            rating: 2,
            text: "O aplicativo está travando muito quando tento assistir aos VODs. Já desinstalei e instalei novamente mas continua com o mesmo problema. Por favor, corrijam isso.",
            createdAt: new Date(2025, 4, 9, 14, 15),
            source: "app_store",
            relatedTo: null,
            hasResponse: true,
            tags: ["app_performance", "vods", "bug"],
          },
          {
            id: 3,
            userId: 28,
            category: "merchandise",
            sentiment: "positive",
            rating: 4,
            text: "A nova camiseta da FURIA chegou super rápido e a qualidade do material é excelente! Só achei que o tamanho está um pouco menor do que o esperado, mas nada que atrapalhe.",
            createdAt: new Date(2025, 4, 8, 10, 20),
            source: "survey",
            relatedTo: "shop_item_456",
            hasResponse: false,
            tags: ["merchandise", "jersey", "quality"],
          },
          {
            id: 4,
            userId: 56,
            category: "content",
            sentiment: "neutral",
            rating: 3,
            text: "Os conteúdos exclusivos estão bons, mas esperava mais variedade. Seria legal ter mais vídeos dos bastidores e entrevistas com os jogadores sobre a rotina deles.",
            createdAt: new Date(2025, 4, 7, 8, 45),
            source: "in_app",
            relatedTo: "content_section",
            hasResponse: false,
            tags: ["content", "suggestion", "behind_scenes"],
          },
          {
            id: 5,
            userId: 34,
            category: "events",
            sentiment: "positive",
            rating: 5,
            text: "O FURIA Day foi incrível! Consegui tirar foto com todos os jogadores e a organização do evento estava impecável. Mal posso esperar pelo próximo!",
            createdAt: new Date(2025, 4, 6, 16, 10),
            source: "social_media",
            relatedTo: "event_furia_day",
            hasResponse: true,
            tags: ["event", "furia_day", "meetup"],
          },
          {
            id: 6,
            userId: 108,
            category: "game_experience",
            sentiment: "negative",
            rating: 1,
            text: "Muito decepcionado com a performance do time no último campeonato. Parece que eles não estavam preparados e a comunicação estava terrível. Esperava mais.",
            createdAt: new Date(2025, 4, 5, 11, 25),
            source: "in_app",
            relatedTo: "tournament_789",
            hasResponse: false,
            tags: ["team_performance", "tournament", "criticism"],
          },
        ],
        wordCloud: {
          "experiência": 78,
          "qualidade": 65,
          "FURIA": 120,
          "time": 95,
          "jogo": 88,
          "conteúdo": 56,
          "jogadores": 72,
          "amor": 45,
          "ótimo": 67,
          "ruim": 23,
          "melhorar": 34,
          "evento": 48,
          "app": 39,
          "camiseta": 28,
          "streaming": 31,
          "problemas": 25,
          "rápido": 19,
          "lento": 14,
          "incrível": 42,
          "decepcionante": 18,
        },
        timeSeriesData: {
          dates: ["01/05/2025", "02/05/2025", "03/05/2025", "04/05/2025", "05/05/2025", "06/05/2025", "07/05/2025"],
          series: {
            positive: [42, 38, 45, 52, 48, 36, 47],
            neutral: [18, 22, 19, 15, 20, 17, 16],
            negative: [10, 8, 12, 7, 15, 9, 6],
          }
        },
        categories: [
          { id: "game_experience", label: "Experiência de Jogo" },
          { id: "content", label: "Conteúdo" },
          { id: "platform", label: "Plataforma" },
          { id: "events", label: "Eventos" },
          { id: "merchandise", label: "Produtos" },
          { id: "community", label: "Comunidade" },
          { id: "other", label: "Outros" },
        ],
      };
    },
  });

  // Carregar detalhes de um feedback específico
  const { data: feedbackDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/admin/fan-sentiment", selectedFeedback?.id],
    queryFn: async () => {
      if (!selectedFeedback) return null;
      
      // Dados mockados para visualização
      return {
        feedback: selectedFeedback,
        user: {
          id: selectedFeedback.userId,
          username: `user${selectedFeedback.userId}`,
          email: `user${selectedFeedback.userId}@example.com`,
          profile: {
            firstName: "João",
            lastName: "Silva",
            avatarUrl: null,
          },
          joinedAt: new Date(2024, 2, 15),
          feedbacksCount: 5,
          sentimentDistribution: {
            positive: 3,
            neutral: 1,
            negative: 1,
          },
        },
        responses: selectedFeedback.hasResponse ? [
          {
            id: 1,
            adminId: 1,
            adminName: "Admin FURIA",
            text: "Obrigado pelo seu feedback! Estamos analisando a situação e iremos resolver o problema o mais rápido possível. Fique à vontade para entrar em contato novamente caso precise de mais informações.",
            createdAt: new Date(new Date(selectedFeedback.createdAt).getTime() + 120 * 60000),
          }
        ] : [],
        similarFeedbacks: [
          {
            id: 101,
            category: selectedFeedback.category,
            sentiment: selectedFeedback.sentiment,
            rating: selectedFeedback.rating,
            text: "Tenho o mesmo problema com o app. Está muito lento e trava quando tento assistir aos vídeos.",
            createdAt: new Date(2025, 4, 8, 14, 33),
          },
          {
            id: 102,
            category: selectedFeedback.category,
            sentiment: selectedFeedback.sentiment,
            rating: selectedFeedback.rating,
            text: "Concordo totalmente com esse feedback. O problema também está acontecendo comigo.",
            createdAt: new Date(2025, 4, 7, 10, 15),
          },
        ],
        relatedContent: selectedFeedback.relatedTo ? {
          type: selectedFeedback.relatedTo.includes("match") ? "match" :
                selectedFeedback.relatedTo.includes("event") ? "event" :
                selectedFeedback.relatedTo.includes("shop") ? "product" : "content",
          id: selectedFeedback.relatedTo.split("_")[1],
          title: selectedFeedback.relatedTo.includes("match") ? "FURIA vs Team Liquid - IEM São Paulo 2025" :
                selectedFeedback.relatedTo.includes("event") ? "FURIA Day 2025" :
                selectedFeedback.relatedTo.includes("shop") ? "Camiseta FURIA Oficial 2025" : "Conteúdo Exclusivo",
          url: `/admin/${selectedFeedback.relatedTo.includes("match") ? "matches" :
                          selectedFeedback.relatedTo.includes("event") ? "events" :
                          selectedFeedback.relatedTo.includes("shop") ? "shop/products" : "content"}/${selectedFeedback.relatedTo.split("_")[1]}`,
        } : null,
      };
    },
    enabled: !!selectedFeedback,
  });

  // Filtrar feedbacks com base nos critérios
  const filteredFeedbacks = sentimentData?.feedbacks?.filter(feedback => {
    // Aplicar filtros selecionados
    const matchesCategory = !selectedCategory || feedback.category === selectedCategory;
    const matchesSentiment = !selectedSentiment || feedback.sentiment === selectedSentiment;
    
    // Aplicar filtro de data
    const matchesDateRange = 
      (!dateRange.from || new Date(feedback.createdAt) >= dateRange.from) &&
      (!dateRange.to || new Date(feedback.createdAt) <= dateRange.to);
    
    // Aplicar busca de texto
    const matchesSearch = 
      searchTerm === "" || 
      feedback.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      feedback.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSentiment && matchesDateRange && matchesSearch;
  });

  // Função para obter ícone do sentimento
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="text-green-500" />;
      case "neutral":
        return <Meh className="text-amber-500" />;
      case "negative":
        return <Frown className="text-red-500" />;
      default:
        return <MessageSquare />;
    }
  };

  // Função para obter badge do sentimento
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-green-500">Positivo</Badge>;
      case "neutral":
        return <Badge className="bg-amber-500">Neutro</Badge>;
      case "negative":
        return <Badge className="bg-red-500">Negativo</Badge>;
      default:
        return <Badge variant="outline">{sentiment}</Badge>;
    }
  };

  // Função para obter label da categoria
  const getCategoryLabel = (categoryId: string) => {
    const category = sentimentData?.categories.find(cat => cat.id === categoryId);
    return category?.label || categoryId;
  };

  // Função para obter label da fonte
  const getSourceLabel = (source: string) => {
    const sourceMap: Record<string, string> = {
      "in_app": "Aplicativo",
      "survey": "Pesquisa",
      "social_media": "Redes Sociais",
      "app_store": "Loja de Apps",
      "email": "E-mail",
      "support": "Suporte",
    };
    
    return sourceMap[source] || source;
  };

  // Função para formatar número de estrelas
  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Função para visualizar detalhes do feedback
  const handleViewFeedback = (feedback: any) => {
    setSelectedFeedback(feedback);
    setShowDetailDialog(true);
  };

  // Função para exportar dados
  const handleExportData = () => {
    // Em uma implementação real, redirecionaria para a API de exportação
    console.log("Exportando dados com filtros:", {
      category: selectedCategory,
      sentiment: selectedSentiment,
      dateRange,
      searchTerm,
    });
    
    window.open(`/api/admin/fan-sentiment/export?format=csv${selectedCategory ? `&category=${selectedCategory}` : ''}${selectedSentiment ? `&sentiment=${selectedSentiment}` : ''}${dateRange.from ? `&from=${dateRange.from.toISOString()}` : ''}${dateRange.to ? `&to=${dateRange.to.toISOString()}` : ''}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`, '_blank');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Análise de Sentimento dos Fãs</h1>
            <p className="text-muted-foreground">
              Monitore e analise o feedback dos fãs em diversas fontes e categorias
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" /> Exportar Dados
            </Button>
          </div>
        </div>

        {/* Cards de métricas principais */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-[110px]">
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse w-16 h-16 rounded-full bg-muted"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : sentimentData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sentimentData.summary.totalFeedbacks}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>Última semana</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sentimentData.summary.averageRating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">
                  {renderStars(Math.round(sentimentData.summary.averageRating))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Distribuição de Sentimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-500 flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" /> Positivo
                    </span>
                    <span>{sentimentData.summary.sentimentDistribution.positive}</span>
                  </div>
                  <Progress 
                    value={(sentimentData.summary.sentimentDistribution.positive / sentimentData.summary.totalFeedbacks) * 100} 
                    className="h-1.5 bg-muted" 
                    indicatorClassName="bg-green-500"
                  />
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-500 flex items-center">
                      <Meh className="h-3 w-3 mr-1" /> Neutro
                    </span>
                    <span>{sentimentData.summary.sentimentDistribution.neutral}</span>
                  </div>
                  <Progress 
                    value={(sentimentData.summary.sentimentDistribution.neutral / sentimentData.summary.totalFeedbacks) * 100} 
                    className="h-1.5 bg-muted" 
                    indicatorClassName="bg-amber-500"
                  />
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-red-500 flex items-center">
                      <ThumbsDown className="h-3 w-3 mr-1" /> Negativo
                    </span>
                    <span>{sentimentData.summary.sentimentDistribution.negative}</span>
                  </div>
                  <Progress 
                    value={(sentimentData.summary.sentimentDistribution.negative / sentimentData.summary.totalFeedbacks) * 100} 
                    className="h-1.5 bg-muted" 
                    indicatorClassName="bg-red-500"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tendência Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {sentimentData.summary.recentTrend === "improving" ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="text-xl font-medium text-green-500">Melhorando</span>
                    </>
                  ) : sentimentData.summary.recentTrend === "declining" ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />
                      <span className="text-xl font-medium text-red-500">Piorando</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5 text-amber-500 rotate-90" />
                      <span className="text-xl font-medium text-amber-500">Estável</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Baseado nos últimos 7 dias
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Análise de dados e visualizações */}
        <Tabs defaultValue="feedbacks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="word-cloud">Palavras-chave</TabsTrigger>
          </TabsList>
          
          {/* Aba de Feedbacks */}
          <TabsContent value="feedbacks" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Feedbacks dos Fãs</CardTitle>
                <CardDescription>
                  {filteredFeedbacks?.length || 0} feedbacks encontrados
                </CardDescription>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar feedbacks..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {sentimentData?.categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={selectedSentiment}
                    onValueChange={setSelectedSentiment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os sentimentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os sentimentos</SelectItem>
                      <SelectItem value="positive">Positivo</SelectItem>
                      <SelectItem value="neutral">Neutro</SelectItem>
                      <SelectItem value="negative">Negativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.from && !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                          )
                        ) : (
                          <span>Filtrar por data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        locale={ptBR}
                      />
                      {(dateRange.from || dateRange.to) && (
                        <div className="flex justify-end p-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDateRange({ from: undefined, to: undefined })}
                          >
                            Limpar
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse space-y-2">
                        <div className="h-4 w-1/3 bg-muted rounded-md"></div>
                        <div className="h-16 bg-muted rounded-md"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredFeedbacks && filteredFeedbacks.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFeedbacks.map((feedback) => (
                      <Card key={feedback.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewFeedback(feedback)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1">
                                {getSentimentIcon(feedback.sentiment)}
                              </div>
                              <div>
                                <Badge className="mr-2">{getCategoryLabel(feedback.category)}</Badge>
                                {getSentimentBadge(feedback.sentiment)}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-3">
                              <div className="text-amber-500 font-medium">
                                {renderStars(feedback.rating)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(feedback.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm line-clamp-2">{feedback.text}</p>
                          <div className="flex justify-between mt-2">
                            <div className="flex flex-wrap gap-1">
                              {feedback.tags.map((tag: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs font-normal">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{getSourceLabel(feedback.source)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum feedback encontrado</h3>
                    <p className="text-muted-foreground max-w-md">
                      Não foram encontrados feedbacks com os filtros selecionados. Tente modificar os critérios de busca.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory(undefined);
                        setSelectedSentiment(undefined);
                        setDateRange({ from: undefined, to: undefined });
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Aba de Tendências */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Sentimento</CardTitle>
                <CardDescription>
                  Evolução dos sentimentos dos fãs nos últimos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : sentimentData?.timeSeriesData ? (
                  <div className="h-[300px]">
                    {/* Simulação simplificada de gráfico */}
                    <div className="w-full h-full flex flex-col">
                      <div className="flex-1 flex relative">
                        {/* Gráfico simulado de barras */}
                        <div className="absolute inset-0 flex items-end w-full">
                          {sentimentData.timeSeriesData.dates.map((date, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full px-1">
                              <div className="w-full flex flex-col-reverse">
                                <div 
                                  className="w-full bg-green-500 rounded-t-sm" 
                                  style={{ 
                                    height: `${(sentimentData.timeSeriesData.series.positive[index] / 60) * 100}%` 
                                  }}
                                ></div>
                                <div 
                                  className="w-full bg-amber-500 rounded-t-sm" 
                                  style={{ 
                                    height: `${(sentimentData.timeSeriesData.series.neutral[index] / 60) * 100}%` 
                                  }}
                                ></div>
                                <div 
                                  className="w-full bg-red-500 rounded-t-sm" 
                                  style={{ 
                                    height: `${(sentimentData.timeSeriesData.series.negative[index] / 60) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs mt-2">{date}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-center mt-8 space-x-6">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                          <span className="text-sm">Positivo</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-amber-500 rounded-sm mr-2"></div>
                          <span className="text-sm">Neutro</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                          <span className="text-sm">Negativo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Aba de Categorias */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categorias</CardTitle>
                <CardDescription>
                  Feedbacks agrupados por categoria e sentimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse space-y-2">
                        <div className="h-4 w-1/4 bg-muted rounded-md"></div>
                        <div className="h-8 bg-muted rounded-md"></div>
                      </div>
                    ))}
                  </div>
                ) : sentimentData?.summary?.topCategories ? (
                  <div className="space-y-6">
                    {sentimentData.summary.topCategories.map((category, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">{category.label}</h3>
                          <span className="text-sm text-muted-foreground">{category.count} feedbacks</span>
                        </div>
                        <div className="w-full h-8 bg-muted rounded-md overflow-hidden flex">
                          {/* Simulação de distribuição de sentimento dentro da categoria */}
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${60 + (Math.random() * 20)}%` }}
                          ></div>
                          <div 
                            className="h-full bg-amber-500" 
                            style={{ width: `${15 + (Math.random() * 15)}%` }}
                          ></div>
                          <div 
                            className="h-full bg-red-500" 
                            style={{ width: `${5 + (Math.random() * 15)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Nenhum dado disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Aba de Nuvem de Palavras */}
          <TabsContent value="word-cloud" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nuvem de Palavras</CardTitle>
                <CardDescription>
                  Palavras mais frequentes nos feedbacks dos fãs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : sentimentData?.wordCloud ? (
                  <div className="p-4 h-[400px] flex items-center justify-center flex-wrap gap-4">
                    {/* Simulação simplificada de nuvem de palavras */}
                    {Object.entries(sentimentData.wordCloud).map(([word, count], i) => (
                      <div 
                        key={i} 
                        className="text-primary hover:text-primary/80 transition-colors"
                        style={{ 
                          fontSize: `${Math.max(0.8, (count as number) / 120 * 2.5)}rem`,
                          opacity: Math.max(0.5, (count as number) / 120),
                          transform: `rotate(${Math.random() > 0.5 ? 1 : -1}deg)`,
                        }}
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de detalhes do feedback */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Feedback</DialogTitle>
            <DialogDescription>
              Feedback #{selectedFeedback?.id} - {format(selectedFeedback?.createdAt ? new Date(selectedFeedback.createdAt) : new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : feedbackDetails ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-muted">
                        {getSentimentIcon(feedbackDetails.feedback.sentiment)}
                      </div>
                      <div>
                        <Badge className="mr-2">{getCategoryLabel(feedbackDetails.feedback.category)}</Badge>
                        {getSentimentBadge(feedbackDetails.feedback.sentiment)}
                      </div>
                      <div className="ml-auto text-amber-500 font-medium">
                        {renderStars(feedbackDetails.feedback.rating)}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-md">
                      <p>{feedbackDetails.feedback.text}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {feedbackDetails.feedback.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Fonte: {getSourceLabel(feedbackDetails.feedback.source)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(feedbackDetails.feedback.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                    
                    {feedbackDetails.relatedContent && (
                      <div className="pt-4 border-t">
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          Conteúdo Relacionado
                        </Label>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div>
                            <p className="font-medium">{feedbackDetails.relatedContent.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Tipo: {
                                feedbackDetails.relatedContent.type === "match" ? "Partida" : 
                                feedbackDetails.relatedContent.type === "event" ? "Evento" :
                                feedbackDetails.relatedContent.type === "product" ? "Produto" : "Conteúdo"
                              }
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={feedbackDetails.relatedContent.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" /> Ver
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {feedbackDetails.responses.length > 0 && (
                      <div className="pt-4 border-t">
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          Respostas da Administração
                        </Label>
                        {feedbackDetails.responses.map((response: any, i: number) => (
                          <div key={i} className="p-3 bg-primary/5 rounded-md mb-2 border-l-2 border-primary">
                            <div className="flex justify-between mb-1">
                              <p className="text-sm font-medium">{response.adminName}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(response.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            <p className="text-sm">{response.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {feedbackDetails.similarFeedbacks.length > 0 && (
                      <div className="pt-4 border-t">
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          Feedbacks Similares
                        </Label>
                        {feedbackDetails.similarFeedbacks.map((feedback: any, i: number) => (
                          <div key={i} className="p-3 bg-muted rounded-md mb-2">
                            <div className="flex justify-between mb-1">
                              <div className="flex gap-2">
                                {getSentimentBadge(feedback.sentiment)}
                                <span className="text-amber-500 text-sm">{renderStars(feedback.rating)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(feedback.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <p className="text-sm">{feedback.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-3">Informações do Usuário</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Nome</Label>
                        <p>
                          {feedbackDetails.user.profile?.firstName} {feedbackDetails.user.profile?.lastName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Usuário</Label>
                        <p>{feedbackDetails.user.username}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">E-mail</Label>
                        <p>{feedbackDetails.user.email}</p>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-xs text-muted-foreground">Membro desde</Label>
                        <p>{format(new Date(feedbackDetails.user.joinedAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total de feedbacks</Label>
                        <p>{feedbackDetails.user.feedbacksCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-3">Histórico de Sentimento</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Smile className="h-4 w-4 mr-1 text-green-500" />
                          <span>Positivos</span>
                        </div>
                        <Badge variant="outline">{feedbackDetails.user.sentimentDistribution.positive}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Meh className="h-4 w-4 mr-1 text-amber-500" />
                          <span>Neutros</span>
                        </div>
                        <Badge variant="outline">{feedbackDetails.user.sentimentDistribution.neutral}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Frown className="h-4 w-4 mr-1 text-red-500" />
                          <span>Negativos</span>
                        </div>
                        <Badge variant="outline">{feedbackDetails.user.sentimentDistribution.negative}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-3">Ações</h3>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" /> Responder
                      </Button>
                      <Button className="w-full" variant="outline">
                        <AlignLeft className="h-4 w-4 mr-2" /> Ver Atividade
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Heart className="h-4 w-4 mr-2" /> Ver FURIA Coins
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum detalhe disponível</h3>
              <p className="text-muted-foreground max-w-md">
                Não foi possível carregar os detalhes deste feedback.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}