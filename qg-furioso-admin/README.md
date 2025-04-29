# Painel Administrativo QG FURIOSO

Este repositório contém o painel administrativo do projeto QG FURIOSO - FURIA Esports. Esta aplicação é destinada à equipe interna da FURIA para gerenciar usuários, sistema de recompensas, conteúdo, e monitorar a plataforma.

## Tecnologias Utilizadas

- **React** - Biblioteca para construção de interfaces
- **TypeScript** - Superset tipado de JavaScript
- **Ant Design** - Biblioteca de componentes UI
- **React Query** - Gerenciamento de estado e chamadas de API
- **Recharts** - Biblioteca para criação de gráficos
- **React Quill** - Editor rich text para conteúdo
- **Zustand** - Gerenciamento de estado global simplificado

## Estrutura do Projeto

```
src/
  ├── api/         # Chamadas de API para o backend
  ├── components/  # Componentes reutilizáveis
  │   ├── layout/   # Componentes de layout (sidebar, header)
  │   ├── ui/       # Componentes UI genéricos
  │   ├── forms/    # Componentes de formulário
  │   ├── tables/   # Componentes de tabela
  │   └── charts/   # Componentes de gráficos
  ├── pages/       # Páginas da aplicação
  │   ├── auth/     # Páginas de autenticação
  │   ├── dashboard/ # Dashboard principal
  │   ├── users/    # Gerenciamento de usuários
  │   ├── rewards/  # Sistema de recompensas
  │   ├── content/  # Gerenciamento de conteúdo
  │   └── audit/    # Logs de auditoria
  ├── store/       # Gerenciamento de estado global
  ├── hooks/       # Hooks personalizados
  ├── utils/       # Utilitários e funções auxiliares
  └── types/       # Definições de tipos TypeScript
```

## Funcionalidades

### 1. Autenticação
- Login com credenciais de administrador
- Proteção de rotas (somente usuários autenticados)
- Gerenciamento de sessão

### 2. Dashboard
- Métricas principais (usuários, moedas, etc.)
- Gráficos e visualizações de dados
- Filtros por período

### 3. Gerenciamento de Usuários
- Listagem de usuários com filtros e pesquisa
- Visualização detalhada de perfis
- Ações administrativas (suspender/ativar, resetar senha, ajustar coins)

### 4. Sistema de Recompensas
- Gerenciamento de itens da loja
- Processamento de resgates
- Configuração de regras para ganho de coins

### 5. Gerenciamento de Conteúdo
- Criação e edição de notícias
- Gerenciamento de pesquisas e análise de respostas
- Editor rich text para conteúdo

### 6. Logs de Auditoria
- Rastreamento de ações administrativas
- Filtragem por tipo de ação e administrador

## Pré-requisitos

- Node.js 16+
- Acesso ao backend do QG FURIOSO

## Instalação

1. Clone o repositório
```bash
git clone [url-do-repositorio]
```

2. Instale as dependências
```bash
cd qg-furioso-admin
npm install
```

3. Crie o arquivo .env a partir do .env.example
```bash
cp .env.example .env
```

4. Configure o .env com o URL correto da API

5. Execute o projeto
```bash
npm run dev
```

## Acesso
A aplicação estará disponível em `http://localhost:5174`

## Papéis de Administrador

- **super_admin**: Acesso completo a todas as funcionalidades
- **content_manager**: Gerenciamento de notícias e pesquisas
- **support**: Visualização de usuários e suporte
- **shop_manager**: Gerenciamento da loja e resgates
- **viewer**: Acesso somente visualização

## Backend API

Este painel administrativo consome APIs específicas para administradores, prefixadas com `/api/admin/...`. Para mais detalhes sobre os endpoints disponíveis, consulte a documentação da API.

## Integração com o Projeto Principal

O painel administrativo é parte do ecossistema QG FURIOSO, que inclui:
- **Frontend**: Interface do usuário final
- **Backend**: API e lógica de negócios
- **Painel Admin**: Esta aplicação

Utilize o script `start-both.sh` na raiz do projeto principal para iniciar todos os serviços simultaneamente.