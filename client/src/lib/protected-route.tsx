import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useLocation, Link } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Special case for the root route handling
  if (path === '/') {
    // If loading, show loading indicator
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    // If not authenticated, redirect to auth page
    if (!user) {
      setTimeout(() => setLocation('/auth'), 0);
      return null;
    }
    
    // If authenticated, render the component
    return <Component />;
  }
  
  // For other protected routes
  return (
    <Route path={path}>
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
    </Route>
  );
}

// Wrapper to handle the actual Route component from wouter
function Route({ 
  path, 
  children 
}: { 
  path: string, 
  children: React.ReactNode 
}) {
  const [location] = useLocation();
  const matches = location === path;
  
  return matches ? <>{children}</> : null;
}