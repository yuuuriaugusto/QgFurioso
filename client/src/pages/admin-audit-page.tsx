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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import { Download, Search, Calendar as CalendarIcon, Eye, RefreshCcw, Info, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAdminAuth } from "@/hooks/use-admin-auth";

// Componente principal
export default function AdminAuditPage() {
  const { admin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | undefined>(undefined);
  const [selectedEntityType, setSelectedEntityType] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);

  // Obter tipos de ações e entidades
  const { data: logTypes, isLoading: loadingTypes } = useQuery({
    queryKey: ["/api/admin/audit/actions"],
    queryFn: async () => {
      // Dados mockados enquanto a API não está implementada
      return {
        actions: ["create", "update", "delete", "view", "login", "logout", "process"],
        entityTypes: [
          "user", "admin_user", "news", "shop_item", "redemption", 
          "survey", "support_ticket", "match", "stream", "fan_sentiment"
        ],
      };
    },
  });

  // Obter logs de auditoria
  const { data: auditData, isLoading: loadingLogs } = useQuery({
    queryKey: ["/api/admin/audit", selectedAction, selectedEntityType, dateRange, currentPage],
    queryFn: async () => {
      // Dados mockados enquanto a API não está implementada
      return {
        logs: [
          {
            id: 1,
            adminId: 1,
            admin: {
              id: 1,
              username: "admin",
              firstName: "Admin",
              lastName: "FURIA",
              email: "admin@furia.com",
            },
            action: "create",
            entityType: "news",
            entityId: 5,
            details: {
              title: "FURIA anuncia nova contratação",
              slug: "furia-anuncia-nova-contratacao",
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
            createdAt: new Date(2025, 4, 10, 14, 30),
          },
          {
            id: 2,
            adminId: 2,
            admin: {
              id: 2,
              username: "maria",
              firstName: "Maria",
              lastName: "Costa",
              email: "maria@furia.com",
            },
            action: "update",
            entityType: "shop_item",
            entityId: 3,
            details: {
              name: "Camiseta FURIA 2025",
              oldPrice: 120,
              newPrice: 149.90,
            },
            ipAddress: "192.168.1.2",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
            createdAt: new Date(2025, 4, 9, 10, 15),
          },
          {
            id: 3,
            adminId: 1,
            admin: {
              id: 1,
              username: "admin",
              firstName: "Admin",
              lastName: "FURIA",
              email: "admin@furia.com",
            },
            action: "delete",
            entityType: "survey",
            entityId: 2,
            details: {
              title: "Pesquisa sobre novos produtos",
              reason: "Pesquisa expirada",
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
            createdAt: new Date(2025, 4, 8, 9, 45),
          },
          {
            id: 4,
            adminId: 3,
            admin: {
              id: 3,
              username: "joao",
              firstName: "João",
              lastName: "Almeida",
              email: "joao@furia.com",
            },
            action: "login",
            entityType: "admin_user",
            entityId: 3,
            details: {
              success: true,
            },
            ipAddress: "192.168.1.3",
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
            createdAt: new Date(2025, 4, 8, 8, 30),
          },
          {
            id: 5,
            adminId: 2,
            admin: {
              id: 2,
              username: "maria",
              firstName: "Maria",
              lastName: "Costa",
              email: "maria@furia.com",
            },
            action: "process",
            entityType: "redemption",
            entityId: 12,
            details: {
              status: "completed",
              userId: 42,
              item: "Ingresso para evento FURIA Day",
            },
            ipAddress: "192.168.1.2",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
            createdAt: new Date(2025, 4, 7, 15, 20),
          },
        ],
        pagination: {
          total: 87,
          page: currentPage,
          limit: 20,
          pages: 5,
        },
      };
    },
  });

  // Filtrar logs com base nos critérios
  const filteredLogs = auditData?.logs.filter(log => {
    // Filtro de pesquisa
    const matchesSearch = 
      searchTerm === "" || 
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.admin?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      String(log.entityId).includes(searchTerm);
    
    return matchesSearch;
  });

  // Função para obter badge para a ação
  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return <Badge className="bg-green-500">Criação</Badge>;
      case "update":
        return <Badge className="bg-blue-500">Atualização</Badge>;
      case "delete":
        return <Badge className="bg-red-500">Exclusão</Badge>;
      case "view":
        return <Badge variant="outline">Visualização</Badge>;
      case "login":
        return <Badge className="bg-purple-500">Login</Badge>;
      case "logout":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Logout</Badge>;
      case "process":
        return <Badge className="bg-amber-500">Processamento</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  // Função para obter nome legível para tipo de entidade
  const getEntityTypeDisplay = (entityType: string) => {
    const typeMap: Record<string, string> = {
      user: "Usuário",
      admin_user: "Admin",
      news: "Notícia",
      shop_item: "Produto",
      redemption: "Resgate",
      survey: "Pesquisa",
      support_ticket: "Ticket de Suporte",
      match: "Partida",
      stream: "Transmissão",
      fan_sentiment: "Sentimento dos Fãs",
      audit_logs: "Logs de Auditoria"
    };
    
    return typeMap[entityType] || entityType;
  };

  // Função para ver detalhes de log
  const handleViewLog = (log: any) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  // Função para exportar logs
  const handleExportLogs = () => {
    // Implementar a exportação real
    console.log("Exportando logs com filtros:", {
      action: selectedAction,
      entityType: selectedEntityType,
      dateRange,
    });
    
    // Em uma implementação real, redirecionaria para a API de exportação
    window.open(`/api/admin/audit/export?format=csv${selectedAction ? `&action=${selectedAction}` : ''}${selectedEntityType ? `&entityType=${selectedEntityType}` : ''}${dateRange.from ? `&startDate=${dateRange.from.toISOString()}` : ''}${dateRange.to ? `&endDate=${dateRange.to.toISOString()}` : ''}`, '_blank');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
            <p className="text-muted-foreground">
              Monitore todas as ações administrativas realizadas na plataforma
            </p>
          </div>
          <Button onClick={handleExportLogs} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar Logs
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </CardTitle>
            <CardDescription>
              Refine os resultados do log de auditoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar em logs..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={selectedAction}
                onValueChange={setSelectedAction}
              >
                <SelectTrigger className="w-full md:w-1/5">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as ações</SelectItem>
                  {logTypes?.actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action === "create" && "Criação"}
                      {action === "update" && "Atualização"}
                      {action === "delete" && "Exclusão"}
                      {action === "view" && "Visualização"}
                      {action === "login" && "Login"}
                      {action === "logout" && "Logout"}
                      {action === "process" && "Processamento"}
                      {!["create", "update", "delete", "view", "login", "logout", "process"].includes(action) && action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedEntityType}
                onValueChange={setSelectedEntityType}
              >
                <SelectTrigger className="w-full md:w-1/5">
                  <SelectValue placeholder="Tipo de Entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {logTypes?.entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getEntityTypeDisplay(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-1/4 justify-start text-left font-normal"
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
                    onSelect={(range) => setDateRange(range as { from: Date; to: Date })}
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
            <CardTitle>Histórico de Ações</CardTitle>
            <CardDescription>
              {auditData?.pagination.total ? `${auditData.pagination.total} registros encontrados` : "Carregando registros..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Administrador</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Entidade</TableHead>
                        <TableHead>ID da Entidade</TableHead>
                        <TableHead>Endereço IP</TableHead>
                        <TableHead className="text-right">Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            {log.admin ? (
                              <div className="flex flex-col">
                                <span className="font-medium">{log.admin.firstName} {log.admin.lastName}</span>
                                <span className="text-xs text-muted-foreground">@{log.admin.username}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Admin #{log.adminId}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getActionBadge(log.action)}
                          </TableCell>
                          <TableCell>
                            {getEntityTypeDisplay(log.entityType)}
                          </TableCell>
                          <TableCell>
                            {log.entityId || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.ipAddress}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewLog(log)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {auditData?.pagination && auditData.pagination.pages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(auditData.pagination.pages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(Math.min(auditData.pagination.pages, currentPage + 1))}
                          className={currentPage === auditData.pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 text-muted-foreground">
                  <RefreshCcw className="h-12 w-12 mx-auto mb-2" />
                  <p>Nenhum log de auditoria encontrado com os filtros selecionados.</p>
                  <p className="text-sm">Tente ajustar os filtros ou selecionar um período diferente.</p>
                </div>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setSelectedAction(undefined);
                  setSelectedEntityType(undefined);
                  setDateRange({ from: undefined, to: undefined });
                }}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de detalhes do log */}
        {selectedLog && (
          <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
                <DialogDescription>
                  Informações completas sobre esta ação registrada
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">ID do Log</h3>
                    <p className="font-mono text-sm">{selectedLog.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Data/Hora</h3>
                    <p>{format(new Date(selectedLog.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Administrador</h3>
                    {selectedLog.admin ? (
                      <div>
                        <p className="font-medium">{selectedLog.admin.firstName} {selectedLog.admin.lastName}</p>
                        <p className="text-xs text-muted-foreground">@{selectedLog.admin.username} | {selectedLog.admin.email}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Admin #{selectedLog.adminId}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Endereço IP</h3>
                    <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Ação</h3>
                    <div>{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Tipo de Entidade</h3>
                    <p>{getEntityTypeDisplay(selectedLog.entityType)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">ID da Entidade</h3>
                    <p>{selectedLog.entityId || <span className="text-muted-foreground">-</span>}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">User Agent</h3>
                  <p className="text-xs font-mono break-all">{selectedLog.userAgent}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Detalhes da Ação</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md overflow-auto max-h-60">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}