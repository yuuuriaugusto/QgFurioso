# WebSockets e Notificações em Tempo Real - QG FURIOSO

**Data da última atualização:** 04 de Maio de 2025  
**Versão da plataforma:** 2.5.0

## Visão Geral

O QG FURIOSO implementa um sistema de WebSockets para comunicação bidirecional em tempo real entre cliente e servidor. Este sistema fornece:

- Notificações push em tempo real de eventos no sistema
- Atualizações de conteúdo, partidas e transmissões ao vivo
- Mensagens personalizadas para usuários específicos, como recompensas

## Arquitetura

A arquitetura do sistema de WebSocket está organizada nas seguintes camadas:

### Backend

1. **websocket-server.ts**
   - Define o servidor WebSocket e gerencia conexões
   - Responsável pelo mapeamento entre conexões de socket e usuários
   - Fornece métodos para enviar mensagens para clientes específicos, usuários ou canais
   - Implementa autenticação de conexões WebSocket

2. **ws-test-routes.ts**
   - Fornece endpoints REST para testar a funcionalidade WebSocket
   - Suporta simulação de vários tipos de eventos para testes
   - Disponível apenas em ambiente de desenvolvimento

### Frontend

1. **lib/websocket.ts**
   - Define a classe `WebSocketClient` para se conectar ao servidor WebSocket
   - Gerencia reconexão automática, autenticação e manutenção da conexão
   - Implementa o sistema de pub/sub para eventos WebSocket

2. **hooks/use-websocket.tsx**
   - Hook React para integrar o WebSocket na aplicação
   - Gerencia o estado de conexão e autenticação
   - Fornece métodos para assinar e cancelar assinatura de eventos

3. **contexts/websocket-provider.tsx**
   - Provedor de contexto React para disponibilizar o WebSocket em toda aplicação
   - Gerencia o ciclo de vida da conexão WebSocket com base no estado de autenticação
   - Conecta e desconecta automaticamente quando usuário faz login/logout

4. **components/ui/notifications.tsx**
   - Interface visual para notificações em tempo real
   - Armazena e exibe histórico de notificações
   - Interage com o sistema de WebSocket para mostrar eventos em tempo real

## Tipos de Eventos

Os eventos enviados pelo servidor para o cliente estão definidos em `EventType`:

```typescript
export enum EventType {
  // Eventos de conteúdo
  CONTENT_PUBLISHED = 'content_published',
  
  // Eventos de partidas
  MATCH_CREATED = 'match_created',
  MATCH_UPDATED = 'match_updated',
  MATCH_STARTED = 'match_started',
  MATCH_ENDED = 'match_ended',
  
  // Eventos de transmissões
  STREAM_ONLINE = 'stream_online',
  STREAM_OFFLINE = 'stream_offline',
  
  // Eventos da loja
  SHOP_ITEM_ADDED = 'shop_item_added',
  SHOP_ITEM_UPDATED = 'shop_item_updated',
  
  // Eventos de pesquisas
  SURVEY_PUBLISHED = 'survey_published',
  
  // Eventos de usuário
  REWARD_EARNED = 'reward_earned',
  REDEMPTION_STATUS_CHANGED = 'redemption_status_changed',
  
  // Eventos do sistema
  PING = 'ping',
  PONG = 'pong',
  ERROR = 'error'
}
```

## Autenticação WebSocket

O processo de autenticação WebSocket funciona da seguinte forma:

1. O cliente WebSocket estabelece conexão sem autenticação
2. O cliente gera um `clientId` único e se conecta ao endpoint WebSocket
3. Após a conexão ser estabelecida, o cliente envia uma solicitação REST para `/api/ws/auth` com o `clientId`
4. O servidor associa o `clientId` ao usuário autenticado
5. A partir deste momento, mensagens para este usuário podem ser enviadas usando o ID do usuário

## Simulação de Eventos (Apenas Desenvolvimento)

Em ambiente de desenvolvimento, os seguintes endpoints estão disponíveis para simular eventos:

- `POST /api/ws-test/simulate/content` - Simula um novo conteúdo publicado
- `POST /api/ws-test/simulate/match` - Simula uma atualização de partida
- `POST /api/ws-test/simulate/stream` - Simula uma transmissão iniciada
- `POST /api/ws-test/simulate/shop-item` - Simula um novo item na loja
- `POST /api/ws-test/simulate/reward/:userId` - Simula uma recompensa recebida
- `POST /api/ws-test/simulate/redemption/:userId` - Simula um status de resgate atualizado

## Uso do WebSocket em Componentes React

Para assinar eventos em componentes React, use o hook `useWebSocketEvent`:

```typescript
import { useWebSocketEvent } from '@/contexts/websocket-provider';
import { EventType } from '@/lib/websocket';

function MyComponent() {
  useWebSocketEvent(EventType.CONTENT_PUBLISHED, (payload) => {
    console.log('Novo conteúdo publicado:', payload);
    // Processar o evento
  });
  
  // Restante do componente
}
```

## Manutenção da Conexão

O cliente WebSocket implementa:

- Reconexão automática com backoff exponencial
- Ping/pong para manter a conexão ativa
- Reconexão após falhas ou reconexão de rede

## Melhores Práticas

1. **Segurança**
   - Sempre autentique usuários antes de enviar mensagens sensíveis
   - Valide todas as mensagens recebidas do cliente

2. **Performance**
   - Use canais para mensagens difundidas a grupos de usuários
   - Evite broadcast para todos os clientes quando possível
   - Limite o tamanho das mensagens WebSocket

3. **Experiência do Usuário**
   - Mostre feedback visual quando a conexão for perdida
   - Priorize mensagens para não sobrecarregar o usuário
   - Mantenha histórico limitado de notificações para referência