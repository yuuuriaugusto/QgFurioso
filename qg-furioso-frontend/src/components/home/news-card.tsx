import React from "react";

interface NewsCardProps {
  news: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    coverImageUrl?: string;
    publishedAt: string;
    category: string;
  };
}

export default function NewsCard({ news }: NewsCardProps) {
  // Format date to localized string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case 'news':
        return 'Notícia';
      case 'article':
        return 'Artigo';
      case 'interview':
        return 'Entrevista';
      default:
        return category;
    }
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors">
      {/* Image */}
      {news.coverImageUrl ? (
        <img src={news.coverImageUrl} alt={news.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {getCategoryLabel(news.category)}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {formatDate(news.publishedAt)}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{news.title}</h3>
        
        {news.excerpt && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {news.excerpt}
          </p>
        )}
        
        <a 
          href={`/conteudo/${news.slug}`} 
          className="text-primary hover:underline text-sm font-medium"
        >
          Ler mais →
        </a>
      </div>
    </div>
  );
}