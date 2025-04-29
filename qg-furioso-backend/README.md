# QG FURIOSO - Backend

API de backend para a plataforma de engajamento de fãs do QG FURIOSO da FURIA Esports.

## 📋 Requisitos

- Node.js 18.x ou superior
- PostgreSQL
- npm ou yarn

## 🚀 Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/qg-furioso-backend.git
cd qg-furioso-backend
```

2. Instale as dependências
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco de dados
```bash
npm run db:push
# ou
yarn db:push
```

## 🏃‍♂️ Executando

### Em desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

### Em produção
```bash
npm run build
npm start
# ou
yarn build
yarn start
```

## 🛠️ Principais Tecnologias

- TypeScript - Linguagem
- Express - Framework web
- Drizzle ORM - ORM para banco de dados
- Passport - Autenticação
- Zod - Validação de esquemas

## 📦 Estrutura do Projeto

```
/
├── auth.ts           # Configuração de autenticação
├── database-storage.ts # Implementação de armazenamento
├── db.ts             # Configuração do banco de dados
├── index.ts          # Ponto de entrada do aplicativo
├── routes.ts         # Definição de rotas da API
├── schema.ts         # Esquemas de dados e modelos
├── storage.ts        # Interface de armazenamento
└── vite.ts           # Configuração para desenvolvimento
```

## 📝 API Endpoints

### Autenticação
- `POST /api/register` - Registro de novo usuário
- `POST /api/login` - Login de usuário
- `POST /api/logout` - Logout de usuário
- `GET /api/user` - Obter usuário autenticado

### Conteúdo
- `GET /api/content/news` - Listar notícias
- `GET /api/content/news/:slug` - Obter notícia por slug

### Stream e Partidas
- `GET /api/streams` - Listar streams
- `GET /api/matches` - Listar partidas

### Loja e Recompensas
- `GET /api/shop/items` - Listar itens da loja
- `POST /api/shop/redeem` - Resgatar item

### Perfil e Preferências
- `GET /api/profile` - Obter perfil do usuário
- `PATCH /api/profile` - Atualizar perfil
- `GET /api/preferences` - Obter preferências
- `PATCH /api/preferences` - Atualizar preferências

### Pesquisas
- `GET /api/surveys` - Listar pesquisas disponíveis
- `GET /api/surveys/:id` - Obter pesquisa específica
- `POST /api/surveys/:id/respond` - Responder pesquisa

## 📄 Licença

Este projeto está sob a licença FURIA Esports. Todos os direitos reservados.