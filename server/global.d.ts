import { WebSocketServer } from 'ws';

declare global {
  var webSocketServer: WebSocketServer;
  
  function getWebSocketManager(): {
    broadcast: (type: string, payload: any) => void;
    server: WebSocketServer;
  };
}