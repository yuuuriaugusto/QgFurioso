import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { Loader2, Search, PlusCircle, Edit, Trash, MoreHorizontal, FileText, EyeIcon, Eye, EyeOff, Pencil } from "lucide-react";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Tipos
type NewsContent = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string | null;
  author: string;
  category: string;
  game: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewsContentResponse = {
  news: NewsContent[];
  totalCount: number;
  pageCount: number;
};

export default function AdminContentNewsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState<NewsContent | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Buscar notícias
  const { data, isLoading } = useQuery<NewsContentResponse>({
    queryKey: ["/api/admin/content/news", page, statusFilter, categoryFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (statusFilter !== "all") params.append("status", statusFilter === "published" ? "true" : "false");
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (search) params.append("search", search);
      
      // NOTA: Esta chamada API ainda não está implementada no backend
      // Está aqui para demonstrar como seria a interface de usuário
      const res = await apiRequest("GET", `/api/admin/content/news?${params.toString()}`);
      if (!res.ok) {
        return {
          news: [],
          totalCount: 0,
          pageCount: 0
        };
      }
      return await res.json();
    },
    enabled: true, // temporário para desenvolvimento
  });
  
  // Mock data para visualização da interface
  const mockNewsContent: NewsContent[] = [
    {
      id: 1,
      title: "FURIA anuncia nova lineup para CS2",
      slug: "furia-anuncia-nova-lineup-cs2",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      excerpt: "Conheça os novos jogadores que integrarão o time de CS2 da FURIA para a temporada 2023-2024.",
      featuredImageUrl: null,
      author: "Admin FURIA",
      category: "equipes",
      game: "CS2",
      tags: ["CS2", "FURIA", "Lineup", "Competitivo"],
      isPublished: true,
      publishedAt: "2023-04-01T14:30:00Z",
      createdAt: "2023-03-28T10:15:00Z",
      updatedAt: "2023-04-01T14:30:00Z"
    },
    {
      id: 2,
      title: "FURIA conquista 1º lugar no torneio ESL Pro League",
      slug: "furia-conquista-esl-pro-league",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      excerpt: "A equipe brasileira de CS2 da FURIA venceu o torneio ESL Pro League, consolidando sua posição entre as melhores do mundo.",
      featuredImageUrl: null,
      author: "Admin FURIA",
      category: "noticias",
      game: "CS2",
      tags: ["ESL", "Campeonato", "Vitória", "CS2"],
      isPublished: true,
      publishedAt: "2023-04-15T18:30:00Z",
      createdAt: "2023-04-15T15:20:00Z",
      updatedAt: "2023-04-15T18:30:00Z"
    },
    {
      id: 3,
      title: "Novo uniforme FURIA 2023 disponível na loja",
      slug: "novo-uniforme-furia-2023",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      excerpt: "O novo uniforme oficial da FURIA para 2023 já está disponível para compra na loja oficial. Garanta o seu!",
      featuredImageUrl: null,
      author: "Admin FURIA",
      category: "produtos",
      game: null,
      tags: ["Uniforme", "Loja", "Produtos"],
      isPublished: true,
      publishedAt: "2023-03-10T09:00:00Z",
      createdAt: "2023-03-08T11:45:00Z",
      updatedAt: "2023-03-10T09:00:00Z"
    },
    {
      id: 4,
      title: "Calendário de competições FURIA 2023",
      slug: "calendario-competicoes-furia-2023",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      excerpt: "Confira as datas das principais competições que a FURIA participará em 2023, em diversas modalidades.",
      featuredImageUrl: null,
      author: "Admin FURIA",
      category: "agenda",
      game: null,
      tags: ["Calendário", "Competições", "2023"],
      isPublished: false,
      publishedAt: null,
      createdAt: "2023-04-20T16:40:00Z",
      updatedAt: "2023-04-20T16:40:00Z"
    },
    {
      id: 5,
      title: "Entrevista exclusiva com o capitão da FURIA",
      slug: "entrevista-exclusiva-capitao-furia",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      excerpt: "Em entrevista exclusiva, o capitão da equipe de CS2 da FURIA fala sobre planos para 2023 e desafios da nova temporada.",
      featuredImageUrl: null,
      author: "Admin FURIA",
      category: "entrevistas",
      game: "CS2",
      tags: ["Entrevista", "Capitão", "Equipe", "CS2"],
      isPublished: true,
      publishedAt: "2023-04-25T10:30:00Z",
      createdAt: "2023-04-23T14:15:00Z",
      updatedAt: "2023-04-25T10:30:00Z"
    }
  ];
  
  const displayContent = data?.news || mockNewsContent;
  
  const handleContentEdit = (content: NewsContent) => {
    setSelectedContent(content);
    setEditMode(true);
    setShowContentDialog(true);
  };
  
  const handleContentView = (content: NewsContent) => {
    setSelectedContent(content);
    setEditMode(false);
    setShowContentDialog(true);
  };
  
  const handleAddNewContent = () => {
    setSelectedContent(null);
    setEditMode(true);
    setShowContentDialog(true);
  };
  
  // Formata data para exibição
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Status de publicação em formato badge
  const getPublishStatusBadge = (isPublished: boolean) => {
    return isPublished 
      ? <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Publicado</Badge>
      : <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Rascunho</Badge>;
  };
  
  // Categoria em formato capitalizado
  const getCategoryDisplay = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Lista de categorias
  const categories = [
    { value: "all", label: "Todas" },
    { value: "noticias", label: "Notícias" },
    { value: "equipes", label: "Equipes" },
    { value: "agenda", label: "Agenda" },
    { value: "produtos", label: "Produtos" },
    { value: "entrevistas", label: "Entrevistas" },
    { value: "eventos", label: "Eventos" },
  ];
  
  // Lista de jogos
  const games = [
    { value: "", label: "Nenhum" },
    { value: "CS2", label: "Counter-Strike 2" },
    { value: "valorant", label: "VALORANT" },
    { value: "lol", label: "League of Legends" },
    { value: "fifa", label: "FIFA" },
    { value: "apex", label: "Apex Legends" },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Notícias</h2>
          <Button className="flex items-center gap-2" onClick={handleAddNewContent}>
            <PlusCircle className="h-4 w-4" />
            Nova Notícia
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Notícias e Artigos</CardTitle>
            <CardDescription>
              Gerencie o conteúdo de notícias e artigos do QG FURIOSO.
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
                    placeholder="Buscar notícia..." 
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-36">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-36">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="published">Publicados</SelectItem>
                      <SelectItem value="draft">Rascunhos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Tabela de notícias */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Jogo</TableHead>
                      <TableHead>Autor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Publicado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-[250px] truncate" title={item.title}>
                          {item.title}
                        </TableCell>
                        <TableCell>{getCategoryDisplay(item.category)}</TableCell>
                        <TableCell>{item.game || "-"}</TableCell>
                        <TableCell>{item.author}</TableCell>
                        <TableCell>{getPublishStatusBadge(item.isPublished)}</TableCell>
                        <TableCell>{formatDate(item.publishedAt)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleContentView(item)}>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleContentEdit(item)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {item.isPublished ? (
                                <DropdownMenuItem>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Despublicar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Publicar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="h-4 w-4 mr-2" />
                                Excluir
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
                Exibindo {displayContent.length} de {data?.totalCount || displayContent.length} resultados
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
      
      {/* Dialog de conteúdo */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode 
                ? selectedContent 
                  ? "Editar Notícia" 
                  : "Criar Nova Notícia"
                : "Visualizar Notícia"
              }
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Preencha os campos abaixo para editar a notícia."
                : "Detalhes da notícia selecionada."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                placeholder="Título da notícia"
                defaultValue={selectedContent?.title || ""}
                disabled={!editMode}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo</Label>
              <Textarea 
                id="excerpt" 
                placeholder="Um breve resumo da notícia"
                rows={2}
                defaultValue={selectedContent?.excerpt || ""}
                disabled={!editMode}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select defaultValue={selectedContent?.category || "noticias"} disabled={!editMode}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.value !== "all").map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="game">Jogo Relacionado</Label>
                <Select defaultValue={selectedContent?.game || ""} disabled={!editMode}>
                  <SelectTrigger id="game">
                    <SelectValue placeholder="Selecione o jogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.value} value={game.value}>
                        {game.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <div className="border rounded-md p-4 min-h-[300px] bg-background">
                {editMode ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <FileText className="h-12 w-12" />
                    <span className="ml-4">Editor de Rich Text seria implementado aqui</span>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    {selectedContent?.content || ""}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="featured-image">URL da Imagem Destacada</Label>
              <Input 
                id="featured-image" 
                placeholder="https://exemplo.com/imagem.jpg"
                defaultValue={selectedContent?.featuredImageUrl || ""}
                disabled={!editMode}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input 
                id="tags" 
                placeholder="esports, cs2, campeonato"
                defaultValue={selectedContent?.tags.join(", ") || ""}
                disabled={!editMode}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug" 
                placeholder="titulo-da-noticia"
                defaultValue={selectedContent?.slug || ""}
                disabled={!editMode}
              />
              <p className="text-xs text-muted-foreground">
                O slug é usado na URL da notícia. Deixe em branco para gerar automaticamente a partir do título.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setShowContentDialog(false)}>
                  Cancelar
                </Button>
                <Button>
                  {selectedContent ? "Salvar Alterações" : "Criar Notícia"}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditMode(true);
                  }}
                >
                  Editar
                </Button>
                <Button onClick={() => setShowContentDialog(false)}>
                  Fechar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}