import { Link as WouterLink } from "wouter";
import { ReactNode, useCallback } from "react";
import { prefetchHomeData, prefetchContentData, prefetchShopData } from "@/lib/queryClient";

interface OptimizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function OptimizedLink({ href, children, className, onClick }: OptimizedLinkProps) {
  const handleMouseEnter = useCallback(() => {
    // Prefetch data baseado na rota
    if (href === "/") {
      prefetchHomeData();
    } else if (href === "/conteudo") {
      prefetchContentData();
    } else if (href === "/loja") {
      prefetchShopData();
    }
    // Adicione outros prefetches conforme necessário
  }, [href]);

  return (
    <WouterLink 
      href={href} 
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </WouterLink>
  );
}