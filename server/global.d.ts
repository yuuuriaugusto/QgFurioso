import { WebSocketServer } from 'ws';
import { 
  User as BaseUser, 
  UserProfile, 
  CoinBalance, 
  SocialLink, 
  EsportsProfileLink, 
  UserPreferences 
} from '@shared/schema';

declare global {
  var webSocketServer: WebSocketServer;
  
  function getWebSocketManager(): {
    broadcast: (type: string, payload: any) => void;
    server: WebSocketServer;
  };
  
  namespace Express {
    interface User extends BaseUser {
      profile?: UserProfile;
      coinBalance?: CoinBalance;
      preferences?: UserPreferences;
      socialLinks?: SocialLink[];
      esportsProfiles?: EsportsProfileLink[];
    }
  }
}