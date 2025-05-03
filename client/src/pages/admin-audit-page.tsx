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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Calendar } from "@/components/ui/calendar";
import { Search, Calendar as CalendarIcon, Download, Eye, AlertCircle } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";

// Tipo para as entradas de log
type AuditLog = {
  id: number;
  adminId: number;
  adminName: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: number | null;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
};

export default function AdminAuditPage() {
  const { admin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | undefined>(undefined);
  const [selectedEntityType, setSelectedEntityType] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);

  // Dados mockados para visualização, substituir com dados reais da API posteriormente
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["/api/admin/audit-logs", dateRange],
    queryFn: async () => {
      // Dados mockados para visualização
      return [
        {
          id: 1,
          adminId: 1,
          adminName: "Admin FURIA",
          adminEmail: "admin@furia.com",
          action: "create",
          entityType: "news",
          entityId: 123,
          details: {
            title: "FURIA anuncia nova linha de produtos oficiais",
            status: "published",
          },
          ipAddress: "187.122.45.198",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          createdAt: new Date(2025, 4, 10, 15, 30),
        },
        {
          id: 2,
          adminId: 1,
          adminName: "Admin FURIA",
          adminEmail: "admin@furia.com",
          action: "update",
          entityType: "user",
          entityId: 456,
          details: {
            changedFields: ["status"],
            oldValues: { status: "pending_verification" },
            newValues: { status: "verified" },
          },
          ipAddress: "187.122.45.198",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          createdAt: new Date(2025, 4, 10, 16, 45),
        },
        {
          id: 3,
          adminId: 2,
          adminName: "Maria Costa",
          adminEmail: "maria@furia.com",
          action: "delete",
          entityType: "comment",
          entityId: 789,
          details: {
            reason: "Conteúdo inapropriado",
            content: "Texto do comentário que foi removido por violar regras da comunidade",
          },
          ipAddress: "45.167.89.103",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
          createdAt: new Date(2025, 4, 9, 11, 20),
        },
        {
          id: 4,
          adminId: 1,
          adminName: "Admin FURIA",
          adminEmail: "admin@furia.com",
          action: "update",
          entityType: "shop_item",
          entityId: 42,
          details: {
            changedFields: ["price", "stock"],
            oldValues: { price: 150, stock: 10 },
            newValues: { price: 130, stock: 15 },
          },
          ipAddress: "187.122.45.198",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          createdAt: new Date(2025, 4, 9, 10, 0),
        },
        {
          id: 5,
          adminId: 3,
          adminName: "João Almeida",
          adminEmail: "joao@furia.com",
          action: "process",
          entityType: "redemption",
          entityId: 567,
          details: {
            status: "shipped",
            trackingCode: "BR1234567890X",
            userId: 789,
          },
          ipAddress: "200.145.67.89",
          userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
          createdAt: new Date(2025, 4, 8, 14, 15),
        }
      ];
    },
  });

  // Filtragem dos logs
  const filteredLogs = auditLogs?.filter((log) => {
    const logDate = new Date(log.createdAt);
    const isWithinDateRange = 
      logDate >= dateRange.from && 
      logDate <= new Date(dateRange.to.setHours(23, 59, 59, 999));
    
    const matchesSearch = searchTerm === "" || 
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entityId?.toString() || "").includes(searchTerm);
    
    const matchesAction = !selectedAction || log.action === selectedAction;
    const matchesEntityType = !selectedEntityType || log.entityType === selectedEntityType;
    
    return isWithinDateRange && matchesSearch && matchesAction && matchesEntityType;
  });

  // Função para obter badge de ação
  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return <Badge className="bg-green-500">Criação</Badge>;
      case "update":
        return <Badge className="bg-blue-500">Atualização</Badge>;
      case "delete":
        return <Badge className="bg-red-500">Exclusão</Badge>;
      case "login":
        return <Badge className="bg-purple-500">Login</Badge>;
      case "process":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Processamento</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  // Função para obter o texto da entidade
  const getEntityTypeText = (entityType: string) => {
    switch (entityType) {
      case "user":
        return "Usuário";
      case "news":
        return "Notícia";
      case "shop_item":
        return "Produto";
      case "redemption":
        return "Resgate";
      case "comment":
        return "Comentário";
      case "survey":
        return "Pesquisa";
      default:
        return entityType;
    }
  };

  // Função para exibir detalhes do log
  const handleViewLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  // Função para exportar logs
  const handleExportLogs = () => {
    console.log("Exportando logs...", {
      dateRange,
      action: selectedAction,
      entityType: selectedEntityType,
      search: searchTerm,
    });
    
    // Aqui você chamaria a API para exportar os logs
    // Por exemplo: window.location.href = `/api/admin/audit-logs/export?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
            <p className="text-muted-foreground">
              Registros de todas as ações administrativas na plataforma
            </p>
          </div>
          <Button onClick={handleExportLogs}>
            <Download className="mr-2 h-4 w-4" /> Exportar Logs
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine os logs de auditoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por admin ou ID..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedAction}
                  onValueChange={setSelectedAction}
                >
                  <SelectTrigger className="w-full md:w-1/3">
                    <SelectValue placeholder="Tipo de Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as ações</SelectItem>
                    <SelectItem value="create">Criação</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="delete">Exclusão</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="process">Processamento</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedEntityType}
                  onValueChange={setSelectedEntityType}
                >
                  <SelectTrigger className="w-full md:w-1/3">
                    <SelectValue placeholder="Tipo de Entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as entidades</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="news">Notícia</SelectItem>
                    <SelectItem value="shop_item">Produto</SelectItem>
                    <SelectItem value="redemption">Resgate</SelectItem>
                    <SelectItem value="comment">Comentário</SelectItem>
                    <SelectItem value="survey">Pesquisa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
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
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle>Registros de Auditoria ({filteredLogs?.length || 0})</CardTitle>
            <CardDescription>
              Logs de ações administrativas realizadas na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data e Hora</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead className="text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.adminName}</p>
                            <p className="text-xs text-muted-foreground">{log.adminEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>{getEntityTypeText(log.entityType)}</TableCell>
                        <TableCell>{log.entityId || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewLogDetails(log)}>
                            <Eye className="h-4 w-4 mr-1" /> Ver
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
                  <p>Nenhum registro de auditoria encontrado no período selecionado.</p>
                  <p className="text-sm">Tente ajustar os filtros ou selecionar um período diferente.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de detalhes do log */}
        {selectedLog && (
          <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Log #{selectedLog.id}</DialogTitle>
                <DialogDescription>
                  Registro criado em {format(new Date(selectedLog.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Administrador</h3>
                    <p>{selectedLog.adminName} ({selectedLog.adminEmail})</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Ação</h3>
                    <p className="flex items-center gap-2">
                      {getActionBadge(selectedLog.action)}
                      <span className="capitalize">{selectedLog.action}</span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Entidade</h3>
                    <p>{getEntityTypeText(selectedLog.entityType)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">ID da Entidade</h3>
                    <p>{selectedLog.entityId || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Endereço IP</h3>
                    <p>{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">User Agent</h3>
                    <p className="truncate">{selectedLog.userAgent}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Detalhes da Operação</h3>
                  <Card>
                    <CardContent className="p-4 overflow-x-auto">
                      <pre className="text-xs whitespace-pre-wrap break-all font-mono bg-muted p-2 rounded">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLogDetails(false)}>
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