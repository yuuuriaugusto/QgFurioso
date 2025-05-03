import { ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Coins, 
  FileText, 
  ListChecks, 
  Settings, 
  Clock, 
  LogOut,
  Menu,
  ShoppingBag,
  HelpCircle,
  PackageOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { admin, logoutMutation } = useAdminAuth();
  
  // Dados do admin mockados para visualização
  const mockAdmin = admin || { 
    name: "Visualização", 
    email: "admin@furia.com",
    role: "admin"
  };
  
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Usuários",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "FURIA Coins",
      icon: Coins,
      submenu: [
        { name: "Regras de Pontos", href: "/admin/coins/rules" },
        { name: "Transações", href: "/admin/coins/transactions" },
      ],
    },
    {
      name: "Loja",
      icon: ShoppingBag,
      submenu: [
        { name: "Produtos", href: "/admin/shop/products" },
        { name: "Resgates", href: "/admin/shop/redemptions" },
      ],
    },
    {
      name: "Conteúdo",
      icon: FileText,
      submenu: [
        { name: "Notícias", href: "/admin/content/news" },
        { name: "Pesquisas", href: "/admin/content/surveys" },
      ],
    },
    {
      name: "Suporte",
      href: "/admin/support",
      icon: HelpCircle,
    },
    {
      name: "Logs de Auditoria",
      href: "/admin/audit-logs",
      icon: Clock,
    },
    {
      name: "Configurações",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  // Verifica se um item de menu ou submenu está ativo
  const isActive = (href: string) => {
    if (href === "/admin/dashboard" && location === "/admin/dashboard") return true;
    return location.startsWith(href);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/admin/login";
      },
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow overflow-y-auto border-r bg-card">
          <div className="flex h-16 shrink-0 items-center border-b px-4">
            <h1 className="text-lg font-semibold">QG FURIOSO Admin</h1>
          </div>
          <ScrollArea className="flex-1 py-4">
            <div className="px-2 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div className="space-y-1">
                      <div className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground">
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      <div className="ml-6 space-y-1">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            className={cn(
                              "block px-3 py-2 rounded-md text-sm font-medium",
                              isActive(subitem.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link 
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="shrink-0 border-t p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{mockAdmin.name || mockAdmin.email}</p>
                <p className="text-xs text-muted-foreground">{mockAdmin.role}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar móvel */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 px-0 sm:max-w-none">
          <div className="flex flex-col h-full">
            <div className="flex h-16 shrink-0 items-center border-b px-4">
              <h1 className="text-lg font-semibold">QG FURIOSO Admin</h1>
            </div>
            <ScrollArea className="flex-1 py-4">
              <div className="px-2 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.submenu ? (
                      <div className="space-y-1">
                        <div className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground">
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        <div className="ml-6 space-y-1">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className={cn(
                                "block px-3 py-2 rounded-md text-sm font-medium",
                                isActive(subitem.href)
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link 
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                          isActive(item.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="shrink-0 border-t p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{mockAdmin.name || mockAdmin.email}</p>
                  <p className="text-xs text-muted-foreground">{mockAdmin.role}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col">
        <header className="border-b bg-card shadow-sm">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="md:hidden w-8"></div>
            <h1 className="text-lg font-semibold mx-auto md:mx-0">Painel Administrativo FURIA</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}