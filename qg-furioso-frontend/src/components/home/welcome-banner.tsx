import { useAuth } from "@/hooks/use-auth";

export default function WelcomeBanner() {
  const { user } = useAuth();
  
  // Get current time to display appropriate greeting
  const currentHour = new Date().getHours();
  let greeting = "Olá";
  
  if (currentHour < 12) {
    greeting = "Bom dia";
  } else if (currentHour < 18) {
    greeting = "Boa tarde";
  } else {
    greeting = "Boa noite";
  }

  return (
    <div className="bg-furia-gradient rounded-xl p-6 mb-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          {greeting}, {user?.profile?.firstName || "Furioso"}!
        </h1>
        <p className="text-white/80 mt-2">
          Bem-vindo ao QG FURIOSO, o seu hub central para acompanhar todas as novidades da FURIA Esports.
        </p>
        {user?.coinBalance && (
          <div className="mt-4 inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-white/80 mr-2">Seu saldo:</span>
            <span className="font-bold text-white flex items-center">
              {user.coinBalance.balance}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12" />
                <path d="M8 12h8" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}