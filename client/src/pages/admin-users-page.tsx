import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { Loader2, Search, UserPlus, Edit, MoreHorizontal, Shield, EyeIcon, Ban, History, Coins } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipos
type User = {
  id: number;
  publicId: string;
  primaryIdentity: string;
  identityType: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  profile?: {
    displayName: string;
    avatarUrl: string | null;
    kycStatus: string;
  };
  coinBalance?: {
    amount: number;
  };
};

type UsersResponse = {
  users: User[];
  totalCount: number;
  pageCount: number;
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Buscar usuários
  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["/api/admin/users", page, statusFilter, kycFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (kycFilter !== "all") params.append("kycStatus", kycFilter);
      if (search) params.append("search", search);
      
      // NOTA: Esta chamada API ainda não está implementada no backend
      // Está aqui para demonstrar como seria a interface de usuário
      const res = await apiRequest("GET", `/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        return {
          users: [],
          totalCount: 0,
          pageCount: 0
        };
      }
      return await res.json();
    },
    enabled: true, // temporário para desenvolvimento
  });
  
  // Mock data para visualização da interface
  const mockUsers: User[] = [
    {
      id: 1,
      publicId: "USR_123456",
      primaryIdentity: "usuario1@gmail.com",
      identityType: "email",
      status: "active",
      createdAt: "2023-01-15T14:30:00Z",
      lastLoginAt: "2023-04-29T10:15:00Z",
      profile: {
        displayName: "João Silva",
        avatarUrl: null,
        kycStatus: "verified"
      },
      coinBalance: {
        amount: 1250
      }
    },
    {
      id: 2,
      publicId: "USR_789012",
      primaryIdentity: "maria.santos@outlook.com",
      identityType: "email",
      status: "active",
      createdAt: "2023-02-10T09:45:00Z",
      lastLoginAt: "2023-04-28T18:20:00Z",
      profile: {
        displayName: "Maria Santos",
        avatarUrl: null,
        kycStatus: "pending"
      },
      coinBalance: {
        amount: 750
      }
    },
    {
      id: 3,
      publicId: "USR_345678",
      primaryIdentity: "carlos.oliveira",
      identityType: "google",
      status: "inactive",
      createdAt: "2023-03-05T16:20:00Z",
      lastLoginAt: "2023-03-08T11:30:00Z",
      profile: {
        displayName: "Carlos Oliveira",
        avatarUrl: null,
        kycStatus: "not_started"
      },
      coinBalance: {
        amount: 150
      }
    },
    {
      id: 4,
      publicId: "USR_901234",
      primaryIdentity: "analuiza@gmail.com",
      identityType: "email",
      status: "suspended",
      createdAt: "2023-01-20T13:15:00Z",
      lastLoginAt: "2023-02-15T09:40:00Z",
      profile: {
        displayName: "Ana Luiza",
        avatarUrl: null,
        kycStatus: "rejected"
      },
      coinBalance: {
        amount: 0
      }
    },
    {
      id: 5,
      publicId: "USR_567890",
      primaryIdentity: "pedro.costa",
      identityType: "facebook",
      status: "active",
      createdAt: "2023-04-02T10:10:00Z",
      lastLoginAt: "2023-04-29T20:05:00Z",
      profile: {
        displayName: "Pedro Costa",
        avatarUrl: null,
        kycStatus: "verified"
      },
      coinBalance: {
        amount: 980
      }
    }
  ];
  
  const displayUsers = data?.users || mockUsers;
  
  const handleUserDetailsClick = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailsDialog(true);
  };
  
  // Formata a data para exibição
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Status do usuário em formato badge
  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Ativo</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Inativo</Badge>;
      case "suspended":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Status KYC em formato badge
  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Verificado</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pendente</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Rejeitado</Badge>;
      case "not_started":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Não Iniciado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              Gerencie os usuários da plataforma QG FURIOSO.
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
                    placeholder="Buscar usuário..." 
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-36">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                      <SelectItem value="suspended">Suspensos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-36">
                  <Select value={kycFilter} onValueChange={setKycFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="KYC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="verified">Verificados</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="rejected">Rejeitados</SelectItem>
                      <SelectItem value="not_started">Não iniciados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Tabela de usuários */}
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
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Coins</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Último Login</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.publicId}</TableCell>
                        <TableCell>
                          <div className="font-medium">{user.profile?.displayName || "-"}</div>
                          <div className="text-sm text-muted-foreground">{user.primaryIdentity}</div>
                        </TableCell>
                        <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                        <TableCell>{getKycStatusBadge(user.profile?.kycStatus || "not_started")}</TableCell>
                        <TableCell>{user.coinBalance?.amount || 0}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleUserDetailsClick(user)}>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Conceder papel admin
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Coins className="h-4 w-4 mr-2" />
                                Gerenciar moedas
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <History className="h-4 w-4 mr-2" />
                                Histórico de atividades
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Ban className="h-4 w-4 mr-2" />
                                {user.status === "suspended" ? "Reativar conta" : "Suspender conta"}
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
                Exibindo {displayUsers.length} de {data?.totalCount || displayUsers.length} resultados
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
      
      {/* Dialog de detalhes do usuário */}
      {selectedUser && (
        <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre {selectedUser.profile?.displayName || selectedUser.primaryIdentity}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="coins">FURIA Coins</TabsTrigger>
                  <TabsTrigger value="activities">Atividades</TabsTrigger>
                  <TabsTrigger value="orders">Resgates</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="font-medium">ID:</dt>
                            <dd>{selectedUser.publicId}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">Nome:</dt>
                            <dd>{selectedUser.profile?.displayName || "-"}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">Email/Identidade:</dt>
                            <dd>{selectedUser.primaryIdentity}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">Tipo de Login:</dt>
                            <dd>{selectedUser.identityType}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">Status:</dt>
                            <dd>{getUserStatusBadge(selectedUser.status)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">KYC:</dt>
                            <dd>{getKycStatusBadge(selectedUser.profile?.kycStatus || "not_started")}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Datas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="font-medium">Cadastro:</dt>
                            <dd>{formatDate(selectedUser.createdAt)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">Último Login:</dt>
                            <dd>{formatDate(selectedUser.lastLoginAt)}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                    
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Redes Sociais Vinculadas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center text-muted-foreground py-4">
                          Nenhuma rede social vinculada
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="coins" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Saldo de FURIA Coins</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold">{selectedUser.coinBalance?.amount || 0}</div>
                        <p className="text-muted-foreground mt-1">FURIA Coins</p>
                      </div>
                      
                      <div className="mt-6">
                        <Button className="w-full">Adicionar/Remover Coins</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Transações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-muted-foreground py-10">
                        Nenhuma transação encontrada
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activities" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Atividades Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-muted-foreground py-10">
                        Nenhuma atividade registrada
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="orders" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resgates Realizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-muted-foreground py-10">
                        Nenhum resgate encontrado
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDetailsDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}