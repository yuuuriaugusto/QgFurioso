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
  CardFooter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Search, Calendar as CalendarIcon, ThumbsUp, ThumbsDown, BarChart, Plus, MessageSquare, Upload, Eye, AlertCircle, RefreshCcw } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";

// Dados mockados para os gráficos (usando rect para simplicidade, em produção usar Recharts)
const sentimentOverTime = [
  { date: "01/05", positive: 75, neutral: 20, negative: 5 },
  { date: "02/05", positive: 70, neutral: 22, negative: 8 },
  { date: "03/05", positive: 68, neutral: 24, negative: 8 },
  { date: "04/05", positive: 65, neutral: 25, negative: 10 },
  { date: "05/05", positive: 60, neutral: 25, negative: 15 },
  { date: "06/05", positive: 72, neutral: 18, negative: 10 },
  { date: "07/05", positive: 78, neutral: 16, negative: 6 },
  { date: "08/05", positive: 80, neutral: 15, negative: 5 },
  { date: "09/05", positive: 82, neutral: 13, negative: 5 },
  { date: "10/05", positive: 85, neutral: 10, negative: 5 },
];

// Componente principal
export default function AdminFanSentimentPage() {
  const { admin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined);
  const [selectedSentiment, setSelectedSentiment] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [showEntryDetails, setShowEntryDetails] = useState(false);

  // Dados mockados para visualização
  const { data: sentimentData, isLoading } = useQuery({
    queryKey: ["/api/admin/fan-sentiment", dateRange],
    queryFn: async () => {
      // Dados mockados de sentimentos
      return {
        summary: {
          totalEntries: 253,
          positivePercentage: 74,
          neutralPercentage: 16,
          negativePercentage: 10,
          averageScore: 0.68,
        },
        topTopics: [
          { name: "Novos produtos", sentiment: "positive", count: 42 },
          { name: "Evento CS Championship", sentiment: "positive", count: 38 },
          { name: "Novo jogador", sentiment: "positive", count: 35 },
          { name: "App móvel", sentiment: "neutral", count: 30 },
          { name: "Ingressos evento", sentiment: "negative", count: 18 },
        ],
        entries: [
          {
            id: 1,
            source: "twitter",
            sourceId: "1234567890",
            content: "Amei a nova linha de camisetas da FURIA! Já comprei a minha #FURIANation",
            sentiment: "positive",
            sentimentScore: 0.92,
            topics: ["produtos", "loja", "camisetas"],
            date: new Date(2025, 4, 10, 15, 30),
            platform: "twitter",
            relatedEntityType: "shop_item",
            relatedEntityId: "123",
          },
          {
            id: 2,
            source: "survey",
            sourceId: "survey_123_resp_456",
            content: "O evento foi muito bem organizado, mas a fila para autógrafos estava muito desorganizada.",
            sentiment: "neutral",
            sentimentScore: 0.2,
            topics: ["evento", "autógrafos", "organização"],
            date: new Date(2025, 4, 9, 18, 45),
            platform: "survey",
            relatedEntityType: "event",
            relatedEntityId: "789",
          },
          {
            id: 3,
            source: "instagram",
            sourceId: "comment_987654321",
            content: "Não consigo acessar a área de membros há 3 dias! Alguém pode resolver isso? @furia",
            sentiment: "negative",
            sentimentScore: -0.75,
            topics: ["site", "acesso", "problemas técnicos"],
            date: new Date(2025, 4, 8, 9, 20),
            platform: "instagram",
            relatedEntityType: "platform",
            relatedEntityId: "website",
          },
          {
            id: 4,
            source: "twitter",
            sourceId: "2345678901",
            content: "A live de ontem foi sensacional! O jogador novo é incrível, vai dar show no próximo campeonato! #GOFURIA",
            sentiment: "positive",
            sentimentScore: 0.88,
            topics: ["jogador", "live", "campeonato"],
            date: new Date(2025, 4, 7, 22, 10),
            platform: "twitter",
            relatedEntityType: "player",
            relatedEntityId: "45",
          },
          {
            id: 5,
            source: "survey",
            sourceId: "survey_124_resp_789",
            content: "Gostei dos novos benefícios para membros, mas poderiam melhorar as recompensas dos níveis iniciais.",
            sentiment: "neutral",
            sentimentScore: 0.3,
            topics: ["membros", "benefícios", "recompensas"],
            date: new Date(2025, 4, 6, 11, 30),
            platform: "survey",
            relatedEntityType: "membership",
            relatedEntityId: "membership_program",
          },
        ],
      };
    },
  });

  // Filtragem dos dados
  const filteredEntries = sentimentData?.entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const isWithinDateRange = 
      entryDate >= dateRange.from && 
      entryDate <= new Date(dateRange.to.setHours(23, 59, 59, 999));
    
    const matchesSearch = searchTerm === "" || 
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = !selectedSource || entry.source === selectedSource;
    const matchesSentiment = !selectedSentiment || entry.sentiment === selectedSentiment;
    
    return isWithinDateRange && matchesSearch && matchesSource && matchesSentiment;
  });

  // Função para obter badge de sentimento
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-green-500">Positivo</Badge>;
      case "neutral":
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Neutro</Badge>;
      case "negative":
        return <Badge className="bg-red-500">Negativo</Badge>;
      default:
        return <Badge variant="outline">{sentiment}</Badge>;
    }
  };

  // Função para obter texto da fonte
  const getSourceText = (source: string) => {
    switch (source) {
      case "twitter":
        return "Twitter";
      case "instagram":
        return "Instagram";
      case "facebook":
        return "Facebook";
      case "survey":
        return "Pesquisa";
      default:
        return source;
    }
  };

  // Função para exibir detalhes da entrada
  const handleViewEntryDetails = (entry: any) => {
    setSelectedEntry(entry);
    setShowEntryDetails(true);
  };

  // Componente para renderizar o gráfico de evolução de sentimento
  const renderSentimentChart = () => {
    const maxBarHeight = 100;
    const barWidth = 100 / sentimentOverTime.length - 2;
    
    return (
      <div className="w-full h-64 mt-4">
        <div className="flex flex-col h-full">
          <div className="flex flex-grow relative border-b border-l">
            {sentimentOverTime.map((day, index) => (
              <div key={index} className="flex flex-col items-center" style={{ width: `${barWidth}%` }}>
                <div className="flex flex-col h-full w-full justify-end">
                  <div 
                    className="bg-green-500 w-full" 
                    style={{ height: `${(day.positive / 100) * maxBarHeight}%` }}
                  ></div>
                  <div 
                    className="bg-gray-300 w-full" 
                    style={{ height: `${(day.neutral / 100) * maxBarHeight}%` }}
                  ></div>
                  <div 
                    className="bg-red-500 w-full" 
                    style={{ height: `${(day.negative / 100) * maxBarHeight}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">{day.date}</div>
              </div>
            ))}
            
            {/* Eixo Y */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
              <span style={{ transform: "translateX(-20px)" }}>100%</span>
              <span style={{ transform: "translateX(-20px)" }}>50%</span>
              <span style={{ transform: "translateX(-20px)" }}>0%</span>
            </div>
          </div>
          
          {/* Legenda */}
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 mr-1"></div>
              <span className="text-xs">Positivo</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-300 mr-1"></div>
              <span className="text-xs">Neutro</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 mr-1"></div>
              <span className="text-xs">Negativo</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Análise de Sentimento dos Fãs</h1>
            <p className="text-muted-foreground">
              Monitore e analise como os fãs se sentem em relação à FURIA e seus produtos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="mr-2 h-4 w-4" /> Importar Dados
            </Button>
            <Button onClick={() => setShowAnalyzeModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nova Análise
            </Button>
          </div>
        </div>

        {/* Cards de resumo */}
        {!isLoading && sentimentData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                  Sentimento Positivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{sentimentData.summary.positivePercentage}%</div>
                <Progress value={sentimentData.summary.positivePercentage} className="bg-muted h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <BarChart className="mr-2 h-4 w-4 text-amber-500" />
                  Sentimento Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{sentimentData.summary.averageScore.toFixed(2)}</div>
                <Progress 
                  value={(sentimentData.summary.averageScore + 1) * 50} 
                  className="bg-muted h-2" 
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>-1</span>
                  <span>0</span>
                  <span>+1</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <ThumbsDown className="mr-2 h-4 w-4 text-red-500" />
                  Sentimento Negativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{sentimentData.summary.negativePercentage}%</div>
                <Progress value={sentimentData.summary.negativePercentage} className="bg-muted h-2" />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Evolução de Sentimento */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Evolução de Sentimento</CardTitle>
              <CardDescription>Tendência de sentimento dos últimos 10 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {renderSentimentChart()}
            </CardContent>
          </Card>

          {/* Tópicos Principais */}
          <Card>
            <CardHeader>
              <CardTitle>Tópicos Principais</CardTitle>
              <CardDescription>Assuntos mais mencionados pelos fãs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : sentimentData && (
                <div className="space-y-4">
                  {sentimentData.topTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 text-muted-foreground">{index + 1}.</span>
                        <span className="font-medium">{topic.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm mr-2">{topic.count}</span>
                        <div 
                          className={cn(
                            "w-3 h-3 rounded-full",
                            topic.sentiment === "positive" && "bg-green-500",
                            topic.sentiment === "neutral" && "bg-gray-400",
                            topic.sentiment === "negative" && "bg-red-500"
                          )}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1 mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine os dados de sentimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <div className="relative w-full md:w-2/5">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar conteúdo ou tópicos..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={selectedSource}
                onValueChange={setSelectedSource}
              >
                <SelectTrigger className="w-full md:w-1/5">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as fontes</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="survey">Pesquisas</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedSentiment}
                onValueChange={setSelectedSentiment}
              >
                <SelectTrigger className="w-full md:w-1/5">
                  <SelectValue placeholder="Sentimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os sentimentos</SelectItem>
                  <SelectItem value="positive">Positivo</SelectItem>
                  <SelectItem value="neutral">Neutro</SelectItem>
                  <SelectItem value="negative">Negativo</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-2/5 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione um período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => range && setDateRange(range as { from: Date; to: Date })}
                    locale={ptBR}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle>Dados de Sentimento ({filteredEntries?.length || 0})</CardTitle>
            <CardDescription>Análise detalhada das menções e feedback dos fãs</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredEntries && filteredEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Conteúdo</TableHead>
                      <TableHead>Sentimento</TableHead>
                      <TableHead>Tópicos</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {format(new Date(entry.date), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {getSourceText(entry.source)}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{entry.content}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSentimentBadge(entry.sentiment)}
                            <span className="text-sm">
                              {entry.sentimentScore.toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {entry.topics.slice(0, 2).map((topic: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {entry.topics.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{entry.topics.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewEntryDetails(entry)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                  <p>Nenhum dado de sentimento encontrado com os filtros selecionados.</p>
                  <p className="text-sm">Tente ajustar os filtros ou selecionar um período diferente.</p>
                </div>
                <Button variant="outline" onClick={() => setShowAnalyzeModal(true)}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Executar Nova Análise
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal para análise de texto */}
        <Dialog open={showAnalyzeModal} onOpenChange={setShowAnalyzeModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Análise de Sentimento</DialogTitle>
              <DialogDescription>
                Insira um texto para análise ou cole um comentário de mídia social
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  placeholder="Digite ou cole o texto para análise de sentimento..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="source">Fonte</Label>
                  <Select defaultValue="manual">
                    <SelectTrigger id="source">
                      <SelectValue placeholder="Selecione a fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Entrada Manual</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="survey">Pesquisa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="related">Entidade Relacionada</Label>
                  <Select>
                    <SelectTrigger id="related">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      <SelectItem value="team">Time</SelectItem>
                      <SelectItem value="player">Jogador</SelectItem>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAnalyzeModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Analisar Sentimento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para importação de dados */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Importar Dados de Sentimento</DialogTitle>
              <DialogDescription>
                Importe dados de sentimento de diferentes fontes
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="social" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="social">Mídias Sociais</TabsTrigger>
                <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
              </TabsList>
              <TabsContent value="social" className="pt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Plataforma</Label>
                    <Select defaultValue="twitter">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Termo de Busca</Label>
                    <Input placeholder="Ex: FURIA, #FURIANation" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Período</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Selecione o período</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="upload" className="pt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Arquivo</Label>
                    <Select defaultValue="csv">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Arquivo</Label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Clique para selecionar</span> ou arraste e solte
                          </p>
                          <p className="text-xs text-muted-foreground">
                            CSV, JSON ou XLSX (máx. 10MB)
                          </p>
                        </div>
                        <Input 
                          id="dropzone-file" 
                          type="file" 
                          className="hidden" 
                          accept=".csv,.json,.xlsx"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Importar Dados</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de detalhes da entrada */}
        {selectedEntry && (
          <Dialog open={showEntryDetails} onOpenChange={setShowEntryDetails}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detalhes da Análise de Sentimento</DialogTitle>
                <DialogDescription>
                  Informações completas sobre esta entrada
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Conteúdo Original</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>{selectedEntry.content}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block mb-1">Fonte</Label>
                    <p>{getSourceText(selectedEntry.source)}</p>
                    {selectedEntry.sourceId && (
                      <p className="text-xs text-muted-foreground mt-1">ID: {selectedEntry.sourceId}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block mb-1">Data</Label>
                    <p>
                      {format(new Date(selectedEntry.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block mb-1">Sentimento</Label>
                    <div className="flex items-center gap-2">
                      {getSentimentBadge(selectedEntry.sentiment)}
                      <p>Pontuação: {selectedEntry.sentimentScore.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="block mb-1">Entidade Relacionada</Label>
                    <p>
                      {selectedEntry.relatedEntityType ? (
                        `${selectedEntry.relatedEntityType} (${selectedEntry.relatedEntityId})`
                      ) : (
                        "Nenhuma"
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="block mb-1">Tópicos Detectados</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.topics.map((topic: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEntryDetails(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}