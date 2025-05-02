import { useWebSocketContext } from "@/contexts/websocket-provider";
import { WifiIcon, WifiOffIcon, ShieldCheckIcon, ShieldXIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function WebSocketStatus() {
  const { isConnected, isAuthenticated } = useWebSocketContext();
  
  return (
    <div className="flex items-center space-x-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            {isConnected ? (
              <WifiIcon className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOffIcon className="h-4 w-4 text-red-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isConnected ? "Conexão WebSocket ativa" : "Sem conexão WebSocket"}
        </TooltipContent>
      </Tooltip>
      
      {isConnected && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {isAuthenticated ? (
                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ShieldXIcon className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isAuthenticated ? "Autenticado" : "Não autenticado"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}