import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface AdvancedSkeletonProps {
  className?: string;
  count?: number;
  height?: number | string;
  width?: number | string;
  circle?: boolean;
  delay?: number; // Atraso em ms antes de mostrar o skeleton
  fadeInDuration?: number; // Duração da animação em ms
}

export function AdvancedSkeleton({
  className = "",
  count = 1,
  height,
  width,
  circle = false,
  delay = 0,
  fadeInDuration = 300,
}: AdvancedSkeletonProps) {
  const [show, setShow] = useState(delay === 0);
  
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);
  
  if (!show) return null;
  
  const style: React.CSSProperties = {
    height,
    width,
    borderRadius: circle ? "50%" : undefined,
    opacity: 0,
    animation: `fadeIn ${fadeInDuration}ms ease-in-out forwards`,
  };
  
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `
      }} />
      
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Skeleton
            key={i}
            className={className}
            style={style}
          />
        ))}
    </>
  );
}