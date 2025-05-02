import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useLocation, Route as WouterRoute } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Special case for the root route handling
  if (path === '/') {
    return (
      <WouterRoute path="/">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : user ? (
          <Component />
        ) : (
          (() => {
            setTimeout(() => setLocation('/auth'), 0);
            return null;
          })()
        )}
      </WouterRoute>
    );
  }
  
  // For other protected routes
  return (
    <WouterRoute path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : user ? (
        <Component />
      ) : (
        (() => {
          setTimeout(() => setLocation('/auth'), 0);
          return null;
        })()
      )}
    </WouterRoute>
  );
}