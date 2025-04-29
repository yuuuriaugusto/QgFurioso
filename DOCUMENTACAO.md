# QG FURIOSO - Documentação Técnica

## Visão Geral do Sistema

O QG FURIOSO é uma plataforma abrangente de engajamento de fãs dividida em três componentes principais:

1. **Frontend (qg-furioso-frontend)** - Interface para os usuários/fãs
2. **Backend (qg-furioso-backend)** - Servidor de API e lógica de negócios
3. **Painel Administrativo (qg-furioso-admin)** - Interface para administradores e moderadores

Esta arquitetura separada permite desenvolvimento independente e manutenção mais fácil, enquanto também fornece um sistema completo e integrado.

## Tecnologias Utilizadas

### Frontend & Admin Panel
- React.js
- TypeScript
- Ant Design (Admin)
- Tailwind CSS (Frontend)
- React Query (Tanstack Query)
- Wouter (roteamento)
- Zod (validação)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Drizzle ORM
- Passport.js (autenticação)
- WebSockets (funcionalidades em tempo real)

## Arquitetura do Sistema

```
┌────────────────────┐     ┌────────────────────┐
│                    │     │                    │
│  Frontend (React)  │     │ Admin Panel (React)│
│                    │     │                    │
└─────────┬──────────┘     └──────────┬─────────┘
          │                           │
          │   HTTP/WebSockets         │   HTTP
          │                           │
          ▼                           ▼
┌────────────────────────────────────────────────┐
│                                                │
│             Backend (Express.js)               │
│                                                │
└────────────────────┬───────────────────────────┘
                     │
                     │
                     ▼
┌────────────────────────────────────────────────┐
│                                                │
│               PostgreSQL Database              │
│                                                │
└────────────────────────────────────────────────┘
```

## Estrutura do Banco de Dados

O sistema utiliza PostgreSQL com Drizzle ORM para mapear as entidades do banco de dados. Principais tabelas:

- **users** - Informações do usuário
- **user_profiles** - Perfis dos usuários
- **kyc_verifications** - Verificações de identidade
- **coin_balances** - Saldo de moedas virtuais
- **coin_transactions** - Histórico de transações
- **shop_items** - Itens disponíveis na loja
- **redemption_orders** - Pedidos de resgate
- **news_content** - Conteúdo de notícias
- **matches** - Partidas/jogos
- **streams** - Transmissões ao vivo
- **surveys** - Pesquisas
- **survey_responses** - Respostas de pesquisas

## Backend (qg-furioso-backend)

### Principais Componentes

#### Módulo de Autenticação (`auth.ts`)

Responsável por gerenciar a autenticação dos usuários usando Passport.js.

**Funcionalidades:**
- Login de usuários
- Registro de novos usuários
- Sessões de usuário
- Verificação de permissões
- Funções de hash de senha

**Endpoints:**
- `POST /api/register` - Registrar novo usuário
- `POST /api/login` - Autenticar usuário
- `POST /api/logout` - Deslogar usuário
- `GET /api/user` - Obter dados do usuário atual

#### Armazenamento de Dados (`database-storage.ts`)

Camada que abstrai o acesso ao banco de dados PostgreSQL.

**Classes:**
- `DatabaseStorage`: Implementa a interface `IStorage`

**Métodos Principais:**
- Gerenciamento de usuários (getUser, getUserByPrimaryIdentity, createUser, updateUser)
- Gerenciamento de perfis (getUserProfile, createUserProfile, updateUserProfile)
- Gestão de moedas (getCoinBalance, updateCoinBalance, getCoinTransactions)
- Gerenciamento de conteúdo (getNewsContent, createNewsContent, updateNewsContent)
- Gerenciamento de pesquisas (getSurveys, getSurveyQuestions, getSurveyResponses)

#### Conexão com Banco de Dados (`db.ts`)

Configura a conexão com o PostgreSQL usando Drizzle ORM.

```typescript
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

#### Rotas da API (`routes.ts`)

Define e registra todas as rotas da API Express.

**Grupos de Rotas:**
- `/api/auth/*` - Autenticação e gerenciamento de usuários
- `/api/profile/*` - Gerenciamento de perfis
- `/api/shop/*` - Loja e itens para compra
- `/api/content/*` - Conteúdo de notícias e atualizações
- `/api/surveys/*` - Pesquisas e respostas
- `/api/matches/*` - Informações sobre partidas
- `/api/streams/*` - Informações sobre transmissões ao vivo
- `/api/admin/*` - Rotas exclusivas para o painel administrativo

#### Definição do Schema (`schema.ts`)

Define o schema do banco de dados usando Drizzle ORM.

**Principais Entidades:**
- `users` - Tabela de usuários
- `userProfiles` - Tabela de perfis
- `coinBalances` - Tabela de saldos
- `shopItems` - Tabela de itens da loja
- `newsContent` - Tabela de conteúdo
- `surveys` - Tabela de pesquisas

**Relações:**
- Relações definidas explicitamente usando `relations()`
- Integridade referencial garantida

## Painel Administrativo (qg-furioso-admin)

### Principais Componentes

#### API Client (`api.ts`)

Camada que facilita a comunicação com o backend através de requisições HTTP.

**Classes:**
- `ApiError` - Classe para tratar erros de API

**Funções:**
- `get<T>` - Realiza requisições GET
- `post<T>` - Realiza requisições POST
- `patch<T>` - Realiza requisições PATCH
- `put<T>` - Realiza requisições PUT
- `del<T>` - Realiza requisições DELETE

#### API de Conteúdo (`content.ts`)

Funções específicas para gerenciar conteúdo no painel admin.

**Funcionalidades:**
- `fetchNewsContent` - Busca conteúdos de notícias com filtros e paginação
- `createNewsContent` - Cria um novo conteúdo
- `updateNewsContent` - Atualiza um conteúdo existente
- `deleteNewsContent` - Remove um conteúdo
- `fetchSurveys` - Busca pesquisas com filtros e paginação
- `createSurvey` - Cria uma nova pesquisa com perguntas
- `fetchSurveyResults` - Busca resultados agregados de uma pesquisa

#### API de Auditoria (`audit.ts`)

Funções para acessar e gerenciar logs de auditoria.

**Funcionalidades:**
- `fetchAuditLogs` - Busca logs de auditoria com filtros e paginação
- `fetchAuditLogDetails` - Busca um log de auditoria específico por ID
- `fetchAuditActionTypes` - Busca tipos de ações disponíveis para logs
- `fetchAuditStatsByAdmin` - Busca estatísticas de auditoria por administrador
- `fetchAuditStatsByAction` - Busca estatísticas de auditoria por tipo de ação

### Páginas Principais

#### Página de Gerenciamento de Notícias (`NewsContentPage.tsx`)

Interface para criar, editar e gerenciar notícias e conteúdos.

**Componentes:**
- Tabela com listagem de conteúdos
- Modal para criação/edição
- Editor de texto rico (ReactQuill)
- Upload de imagens
- Visualização prévia do conteúdo

**Funcionalidades:**
- Filtragem por status, categoria e busca textual
- Paginação e ordenação
- Publicação/despublicação de conteúdo
- Upload de imagens
- Editor de conteúdo HTML

#### Página de Pesquisas (`SurveysPage.tsx`)

Interface para gerenciar pesquisas e visualizar resultados.

**Componentes:**
- Tabela de pesquisas
- Assistente de criação em etapas
- Editor de perguntas
- Visualização de resultados com gráficos
- Listagem de respostas individuais

**Funcionalidades:**
- Criação de pesquisas com diferentes tipos de perguntas
- Visualização de estatísticas e resultados
- Ativação/desativação de pesquisas
- Filtragem e ordenação
- Visualização de respostas individuais

#### Página de Logs de Auditoria (`AuditLogsPage.tsx`)

Interface para monitorar ações realizadas no painel administrativo.

**Componentes:**
- Tabela de logs de auditoria
- Filtros detalhados
- Visualização de estatísticas
- Gráficos de atividade

**Funcionalidades:**
- Filtragem por administrador, ação, entidade e data
- Visualização detalhada de cada log
- Estatísticas de atividade por administrador
- Estatísticas de atividade por tipo de ação

## Frontend (qg-furioso-frontend)

### Principais Componentes

#### Páginas de Usuário

**Página Home (`home-page.tsx`)**
- Dashboard personalizado do usuário
- Cards de conteúdo em destaque
- Resumo de atividades recentes
- Próximos eventos e partidas

**Página de Perfil (`profile-page.tsx`)**
- Visualização e edição de dados do perfil
- Histórico de atividades
- Gerenciamento de informações pessoais
- Verificação KYC

**Página da Loja (`shop-page.tsx`)**
- Catálogo de itens disponíveis
- Sistema de compra com moedas virtuais
- Histórico de compras
- Status de entregas

**Página de Conteúdo (`content-page.tsx`)**
- Visualização de notícias e atualizações
- Filtragem por categoria
- Sistema de comentários
- Conteúdo em destaque

**Página de Pesquisas (`surveys-page.tsx`)**
- Listagem de pesquisas disponíveis
- Interface para responder pesquisas
- Histórico de pesquisas respondidas
- Indicação de recompensas

#### Componentes Comuns

**Barra de Navegação (`components/layout/header.tsx`)**
- Menu de navegação
- Status do usuário
- Indicador de saldo de moedas
- Notificações

**Menu Lateral (`components/layout/sidebar.tsx`)**
- Navegação principal
- Atalhos para principais seções
- Status do usuário
- Progresso de verificação KYC

## Fluxo de Dados e Interações

### Autenticação e Sessão

1. Usuário fornece credenciais na página de login
2. Frontend envia para `/api/login` no backend
3. Backend verifica credenciais com `passport-local`
4. Se válido, cria sessão e retorna dados do usuário
5. Frontend armazena estado de autenticação com React Query
6. Todas as requisições subsequentes incluem cookie de sessão

### Criação de Conteúdo (Admin Panel)

1. Administrador cria nova notícia no painel admin
2. Dados são enviados para `/api/admin/content/news` no backend
3. Backend valida dados e persiste no banco de dados
4. Notificação de sucesso é exibida no painel admin
5. Conteúdo torna-se disponível no frontend (se publicado)

### Resposta a Pesquisas (Frontend)

1. Usuário visualiza pesquisa disponível
2. Usuário responde perguntas e envia respostas
3. Dados são enviados para `/api/surveys/{id}/respond` no backend
4. Backend persiste respostas e atualiza saldo de moedas
5. Usuário recebe confirmação e recompensa
6. Resultados agregados ficam disponíveis no painel admin

## Scripts de Inicialização

### Iniciar Backend
```bash
# Arquivo: run-backend.sh
cd qg-furioso-backend && npm run dev
```

### Iniciar Frontend
```bash
# Arquivo: run-frontend.sh
cd qg-furioso-frontend && npm run dev
```

### Iniciar Admin Panel
```bash
# Arquivo: run-admin.sh
cd qg-furioso-admin && npm run dev
```

### Iniciar Todo o Sistema
```bash
# Arquivo: start-both.sh
# Usa tmux para iniciar todos os componentes
tmux new-session -d -s qg-furioso 'bash run-backend.sh'
tmux split-window -v 'bash run-frontend.sh'
tmux split-window -h 'bash run-admin.sh'
tmux -2 attach-session -d
```

## Considerações de Segurança

1. **Autenticação**
   - Todas as senhas são armazenadas com hash usando scrypt
   - Sessões são protegidas contra CSRF
   - Validação rigorosa de dados de entrada com Zod

2. **Auditoria**
   - Todas as ações administrativas são registradas
   - Logs incluem ID do administrador, ação, entidade, timestamp e endereço IP

3. **Permissões**
   - Sistema de permissões baseado em funções
   - Apenas administradores têm acesso ao painel admin
   - Validação de permissões em cada endpoint da API

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/register | Registrar novo usuário |
| POST | /api/login | Autenticar usuário |
| POST | /api/logout | Deslogar usuário |
| GET | /api/user | Obter dados do usuário atual |

### Perfil de Usuário

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/profile | Obter perfil do usuário atual |
| PATCH | /api/profile | Atualizar perfil do usuário |
| POST | /api/profile/avatar | Upload de avatar |
| GET | /api/profile/social-links | Obter links sociais |
| POST | /api/profile/social-links | Adicionar link social |

### Loja

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/shop/items | Listar itens da loja |
| GET | /api/shop/items/:id | Detalhes de um item |
| POST | /api/shop/purchase | Realizar compra |
| GET | /api/shop/orders | Histórico de compras |
| GET | /api/shop/balance | Saldo de moedas |

### Conteúdo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/content/news | Listar notícias |
| GET | /api/content/news/:slug | Obter notícia por slug |
| GET | /api/content/news/categories | Listar categorias |
| GET | /api/content/news/featured | Conteúdo em destaque |

### Pesquisas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/surveys | Listar pesquisas disponíveis |
| GET | /api/surveys/:id | Obter pesquisa específica |
| POST | /api/surveys/:id/respond | Responder pesquisa |
| GET | /api/surveys/user | Pesquisas respondidas pelo usuário |

### Administração

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/admin/users | Listar usuários |
| PATCH | /api/admin/users/:id | Atualizar usuário |
| GET | /api/admin/content/news | Listar conteúdos |
| POST | /api/admin/content/news | Criar conteúdo |
| PATCH | /api/admin/content/news/:id | Atualizar conteúdo |
| GET | /api/admin/surveys | Listar pesquisas |
| POST | /api/admin/surveys | Criar pesquisa |
| GET | /api/admin/audit | Listar logs de auditoria |

## Tipos de Dados Principais

### Usuário
```typescript
type User = {
  id: number;
  publicId: string;
  primaryIdentity: string; // email ou telefone
  identityType: string; // 'email' | 'phone'
  passwordHash: string;
  status: string; // 'active' | 'suspended' | 'banned'
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  coinBalance?: CoinBalance;
}
```

### Perfil de Usuário
```typescript
type UserProfile = {
  id: number;
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  birthdate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Conteúdo de Notícias
```typescript
type NewsContent = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  featuredImage: string | null;
  category: string;
  status: 'draft' | 'published';
  publishDate: Date | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Pesquisa
```typescript
type Survey = {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  coinReward: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Pergunta de Pesquisa
```typescript
type SurveyQuestion = {
  id: number;
  surveyId: number;
  questionText: string;
  questionType: 'multiple_choice' | 'text' | 'scale';
  options: string[] | null;
  isRequired: boolean;
  orderIndex: number;
}
```

### Log de Auditoria
```typescript
type AuditLog = {
  id: number;
  adminId: number;
  action: string; // 'CREATE' | 'UPDATE' | 'DELETE' | etc.
  entityType: string; // 'USER' | 'NEWS_CONTENT' | etc.
  entityId: number | null;
  details: string;
  ipAddress: string;
  timestamp: Date;
}
```

## Manutenção e Depuração

### Logs

O sistema usa logs detalhados para facilitar a depuração. Os logs incluem:
- Solicitações HTTP recebidas
- Erros encontrados
- Ações de autenticação
- Operações no banco de dados

### Ambiente de Desenvolvimento

Para executar em ambiente de desenvolvimento:

1. Clone o repositório
2. Execute `npm install` em cada diretório (frontend, backend, admin)
3. Configure o arquivo `.env` com as variáveis necessárias
4. Execute `npm run dev` em cada diretório ou use o script `start-both.sh`

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| DATABASE_URL | URL de conexão PostgreSQL | postgresql://user:pass@host:port/dbname |
| SESSION_SECRET | Segredo para cookies de sessão | random_string_here |
| PORT | Porta do servidor backend | 5000 |
| NODE_ENV | Ambiente de execução | development |
| VITE_API_BASE_URL | URL base da API para frontend | http://localhost:5000 |

## Considerações Finais

Este documento fornece uma visão geral abrangente do sistema QG FURIOSO. Para obter mais detalhes específicos sobre cada componente, consulte os comentários no código-fonte. Esta plataforma foi projetada para escalabilidade e facilidade de manutenção, utilizando as melhores práticas de desenvolvimento e arquitetura de software.

Para suporte técnico ou questões, entre em contato com a equipe de desenvolvimento.

---

© 2025 QG FURIOSO. Todos os direitos reservados.