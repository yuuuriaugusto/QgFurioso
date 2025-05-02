import { Link, useLocation } from "wouter";
import { 
  prefetchHomeData, 
  prefetchContentData, 
  prefetchShopData, 
  prefetchProfileData 
} from "@/lib/queryClient";
import { ReactNode, useCallback, useState } from "react";

interface OptimizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  prefetch?: boolean;
}

export default function OptimizedLink({ 
  href, 
  children, 
  className = "", 
  onClick,
  prefetch = true
}: OptimizedLinkProps) {
  const [, navigate] = useLocation();
  const [isPrefetched, setIsPrefetched] = useState(false);

  // Determine which prefetch function to use based on the destination route
  const getPrefetchFunction = useCallback(() => {
    if (href === "/") return prefetchHomeData;
    if (href === "/conteudo") return prefetchContentData;
    if (href === "/furia-coins") return prefetchShopData;
    if (href === "/meu-qg") return prefetchProfileData;
    return undefined;
  }, [href]);

  // Handle hover to prefetch data
  const handleHover = useCallback(() => {
    if (!prefetch || isPrefetched) return;
    
    const prefetchFunction = getPrefetchFunction();
    if (prefetchFunction) {
      prefetchFunction().catch(console.error);
      setIsPrefetched(true);
    }
  }, [isPrefetched, prefetch, getPrefetchFunction]);

  // Handle navigation with transition
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // User defined onClick
    if (onClick) onClick();
    
    // Prefetch on click if not already prefetched
    if (prefetch && !isPrefetched) {
      const prefetchFunction = getPrefetchFunction();
      if (prefetchFunction) {
        prefetchFunction().catch(console.error);
      }
    }
    
    // Navigate to the route
    navigate(href);
  }, [href, navigate, onClick, prefetch, isPrefetched, getPrefetchFunction]);

  return (
    <Link 
      href={href}
      onClick={handleClick}
      onMouseEnter={handleHover}
      onFocus={handleHover}
      className={className}
    >
      {children}
    </Link>
  );
}