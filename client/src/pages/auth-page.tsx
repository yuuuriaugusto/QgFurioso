import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AuthForms } from "@/components/auth/auth-forms";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle loading state
  if (isLoading || !hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando...</span>
      </div>
    );
  }

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="flex-1 bg-furia-gradient p-8 flex flex-col justify-center items-center text-white md:p-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-rajdhani">QG FURIOSO</h1>
          <p className="text-xl mb-8">A plataforma central para fãs da FURIA Esports.</p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Notícias e Agenda</h3>
                <p className="text-sm text-zinc-200">Acompanhe as últimas notícias e nunca perca uma partida da FURIA.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Loja Exclusiva</h3>
                <p className="text-sm text-zinc-200">Acumule FURIA Coins e troque por produtos e experiências exclusivas.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Comunidade</h3>
                <p className="text-sm text-zinc-200">Conecte-se com outros fãs e participe de eventos exclusivos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Forms */}
      <div className="flex-1 p-8 flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <AuthForms />
        </div>
      </div>
    </div>
  );
}
