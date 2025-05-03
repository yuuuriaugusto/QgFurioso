import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { Loader2, Search, PlusCircle, Edit, Trash, MoreHorizontal, ShoppingBag, EyeIcon, Pencil, Check, X } from "lucide-react";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Tipos
type ShopItem = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  stock: number;
  type: string;
  isActive: boolean;
  availableFrom: string | null;
  availableTo: string | null;
  createdAt: string;
  updatedAt: string;
};

type ShopItemsResponse = {
  items: ShopItem[];
  totalCount: number;
  pageCount: number;
};

export default function AdminShopProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Buscar produtos
  const { data, isLoading } = useQuery<ShopItemsResponse>({
    queryKey: ["/api/admin/shop/items", page, typeFilter, statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter === "active" ? "true" : "false");
      if (search) params.append("search", search);
      
      // NOTA: Esta chamada API ainda não está implementada no backend
      // Está aqui para demonstrar como seria a interface de usuário
      const res = await apiRequest("GET", `/api/admin/shop/items?${params.toString()}`);
      if (!res.ok) {
        return {
          items: [],
          totalCount: 0,
          pageCount: 0
        };
      }
      return await res.json();
    },
    enabled: true, // temporário para desenvolvimento
  });
  
  // Mock data para visualização da interface
  const mockShopItems: ShopItem[] = [
    {
      id: 1,
      name: "Camisa FURIA Oficial",
      description: "Camisa oficial do time FURIA Esports. Material premium, estampa de alta qualidade.",
      imageUrl: null,
      price: 500,
      stock: 150,
      type: "physical",
      isActive: true,
      availableFrom: null,
      availableTo: null,
      createdAt: "2023-01-15T14:30:00Z",
      updatedAt: "2023-04-20T10:15:00Z"
    },
    {
      id: 2,
      name: "Skin FURIA AWP (CS2)",
      description: "Skin exclusiva FURIA para AWP no Counter-Strike 2. Transferível para sua conta Steam.",
      imageUrl: null,
      price: 1000,
      stock: 50,
      type: "digital",
      isActive: true,
      availableFrom: "2023-03-01T00:00:00Z",
      availableTo: "2023-12-31T23:59:59Z",
      createdAt: "2023-02-20T09:45:00Z",
      updatedAt: "2023-04-10T18:20:00Z"
    },
    {
      id: 3,
      name: "Emoji Exclusivo (Discord)",
      description: "Pacote de emojis exclusivos FURIA para uso no servidor Discord oficial.",
      imageUrl: null,
      price: 150,
      stock: 9999,
      type: "digital",
      isActive: true,
      availableFrom: null,
      availableTo: null,
      createdAt: "2023-03-05T16:20:00Z",
      updatedAt: "2023-03-05T16:20:00Z"
    },
    {
      id: 4,
      name: "Acesso VIP Evento SãoPaulo",
      description: "Acesso VIP para o próximo evento presencial de FURIA em São Paulo. Inclui meet & greet com jogadores.",
      imageUrl: null,
      price: 1500,
      stock: 20,
      type: "event",
      isActive: false,
      availableFrom: "2023-05-01T00:00:00Z",
      availableTo: "2023-06-15T23:59:59Z",
      createdAt: "2023-04-01T13:15:00Z",
      updatedAt: "2023-04-01T13:15:00Z"
    },
    {
      id: 5,
      name: "Boné FURIA Especial",
      description: "Boné edição limitada FURIA Esports com assinatura dos jogadores.",
      imageUrl: null,
      price: 350,
      stock: 100,
      type: "physical",
      isActive: true,
      availableFrom: null,
      availableTo: null,
      createdAt: "2023-04-02T10:10:00Z",
      updatedAt: "2023-04-02T10:10:00Z"
    }
  ];
  
  const displayItems = data?.items || mockShopItems;
  
  const handleProductEdit = (product: ShopItem) => {
    setSelectedProduct(product);
    setEditMode(true);
    setShowProductDialog(true);
  };
  
  const handleProductView = (product: ShopItem) => {
    setSelectedProduct(product);
    setEditMode(false);
    setShowProductDialog(true);
  };
  
  const handleAddNewProduct = () => {
    setSelectedProduct(null);
    setEditMode(true);
    setShowProductDialog(true);
  };
  
  // Formata data para exibição
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Status do produto em formato badge
  const getProductStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Ativo</Badge>
      : <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Inativo</Badge>;
  };
  
  // Tipo do produto em formato legível
  const getProductTypeDisplay = (type: string) => {
    switch (type) {
      case "physical":
        return "Físico";
      case "digital":
        return "Digital";
      case "event":
        return "Evento";
      default:
        return type;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Produtos</h2>
          <Button className="flex items-center gap-2" onClick={handleAddNewProduct}>
            <PlusCircle className="h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Produtos da Loja</CardTitle>
            <CardDescription>
              Gerencie os produtos disponíveis para resgate com FURIA Coins.
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
                    placeholder="Buscar produto..." 
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-32">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="physical">Físico</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Tabela de produtos */}
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
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Preço (Coins)</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Disponível até</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <div className="font-medium truncate max-w-xs">{item.name}</div>
                        </TableCell>
                        <TableCell>{getProductTypeDisplay(item.type)}</TableCell>
                        <TableCell>{item.price}</TableCell>
                        <TableCell>{item.stock === 9999 ? 'Ilimitado' : item.stock}</TableCell>
                        <TableCell>{getProductStatusBadge(item.isActive)}</TableCell>
                        <TableCell>{formatDate(item.availableTo)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleProductView(item)}>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleProductEdit(item)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {item.isActive ? (
                                  <>
                                    <X className="h-4 w-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
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
                Exibindo {displayItems.length} de {data?.totalCount || displayItems.length} resultados
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
      
      {/* Dialog de produto */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editMode 
                ? selectedProduct 
                  ? "Editar Produto" 
                  : "Adicionar Novo Produto"
                : "Detalhes do Produto"
              }
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Preencha os campos abaixo para editar as informações do produto."
                : "Informações detalhadas sobre o produto."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input 
                  id="name" 
                  placeholder="Nome do produto"
                  defaultValue={selectedProduct?.name || ""}
                  disabled={!editMode}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Preço (FURIA Coins)</Label>
                <Input 
                  id="price" 
                  type="number"
                  placeholder="0"
                  defaultValue={selectedProduct?.price || ""}
                  disabled={!editMode}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                placeholder="Descrição detalhada do produto"
                rows={4}
                defaultValue={selectedProduct?.description || ""}
                disabled={!editMode}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Produto</Label>
                <Select defaultValue={selectedProduct?.type || "physical"} disabled={!editMode}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Físico</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Estoque</Label>
                <Input 
                  id="stock" 
                  type="number"
                  placeholder="0"
                  defaultValue={selectedProduct?.stock || ""}
                  disabled={!editMode}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="available-from">Disponível a partir de</Label>
                <Input 
                  id="available-from" 
                  type="date"
                  defaultValue={selectedProduct?.availableFrom 
                    ? new Date(selectedProduct.availableFrom).toISOString().substring(0, 10) 
                    : ""
                  }
                  disabled={!editMode}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="available-to">Disponível até</Label>
                <Input 
                  id="available-to" 
                  type="date"
                  defaultValue={selectedProduct?.availableTo 
                    ? new Date(selectedProduct.availableTo).toISOString().substring(0, 10) 
                    : ""
                  }
                  disabled={!editMode}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="active" 
                defaultChecked={selectedProduct?.isActive || true} 
                disabled={!editMode}
              />
              <Label htmlFor="active">Produto Ativo</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input 
                id="image" 
                placeholder="https://exemplo.com/imagem.jpg"
                defaultValue={selectedProduct?.imageUrl || ""}
                disabled={!editMode}
              />
            </div>
          </div>
          
          <DialogFooter>
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                  Cancelar
                </Button>
                <Button>
                  {selectedProduct ? "Salvar Alterações" : "Adicionar Produto"}
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
                <Button onClick={() => setShowProductDialog(false)}>
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