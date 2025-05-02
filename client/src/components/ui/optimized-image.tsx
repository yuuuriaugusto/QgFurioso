import { useState, useEffect, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  width?: number;
  height?: number;
  skeletonClassName?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  fallback,
  width,
  height,
  skeletonClassName,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
  }, [src]);

  // Determine actual src based on error state
  const actualSrc = error && fallback ? fallback : src;

  return (
    <div className="relative" style={{ width, height }}>
      {!isLoaded && (
        <Skeleton 
          className={cn(
            "absolute inset-0", 
            skeletonClassName
          )}
          style={{ width, height }}
        />
      )}
      <img
        src={actualSrc}
        alt={alt}
        className={cn(
          className,
          !isLoaded && "invisible",
        )}
        style={{ 
          width, 
          height,
          objectFit: "cover" 
        }}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setError(true);
          if (fallback) {
            // If there's a fallback, we'll keep isLoaded false until the fallback loads
            setIsLoaded(false);
          } else {
            // Otherwise, consider it "loaded" even though it failed
            setIsLoaded(true);
          }
        }}
        {...props}
      />
    </div>
  );
}