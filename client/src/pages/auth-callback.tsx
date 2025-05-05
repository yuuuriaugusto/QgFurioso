import { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

/**
 * Esta página é onde o usuário será redirecionado depois da autenticação do Google.
 * Processa os parâmetros de consulta e redireciona para a página apropriada.
 */
export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ provider: string }>('/auth/callback/:provider');
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Se o usuário já está autenticado, redirecionar para home
    if (user && !isLoading) {
      setLocation('/');
    }
    
    // Se o usuário não está autenticado e não estamos mais carregando,
    // pode ser que ocorreu um erro no processo de autenticação
    if (!user && !isLoading) {
      setLocation('/auth?error=auth-failed');
    }
    
    // O usuário deve ser redirecionado automaticamente após o carregamento da sessão
  }, [user, isLoading, setLocation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-bold mb-2">Processando autenticação...</h1>
      <p className="text-muted-foreground">
        Aguarde enquanto processamos sua autenticação com{' '}
        {params?.provider === 'google' ? 'Google' : 'provedor externo'}.
      </p>
    </div>
  );
}