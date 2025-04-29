# QG FURIOSO - Frontend

Frontend da plataforma de engajamento de fãs do QG FURIOSO da FURIA Esports.

## 📋 Requisitos

- Node.js 18.x ou superior
- npm ou yarn

## 🚀 Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/qg-furioso-frontend.git
cd qg-furioso-frontend
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

## 🏃‍♂️ Executando

### Em desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

O aplicativo estará disponível em `http://localhost:5173`.

### Construindo para produção
```bash
npm run build
npm run preview
# ou
yarn build
yarn preview
```

## 🛠️ Principais Tecnologias

- TypeScript - Linguagem
- React - Biblioteca de UI
- Vite - Ferramenta de build
- TanStack Query - Gerenciamento de estado e cache
- Tailwind CSS - Framework CSS
- Shadcn/UI - Componentes de UI
- Wouter - Roteamento
- React Hook Form - Gerenciamento de formulários
- Zod - Validação de esquemas

## 📦 Estrutura do Projeto

```
/
├── public/           # Arquivos estáticos
├── src/
│   ├── components/   # Componentes reutilizáveis
│   │   ├── layout/   # Componentes de layout (Header, Footer, etc)
│   │   └── ui/       # Componentes de UI (Buttons, Cards, etc)
│   ├── hooks/        # Hooks customizados
│   ├── lib/          # Utilitários e configurações
│   ├── pages/        # Páginas da aplicação
│   ├── shared/       # Tipos e interfaces compartilhados
│   ├── App.tsx       # Componente principal da aplicação
│   ├── main.tsx      # Ponto de entrada da aplicação
│   └── index.css     # Estilos globais
├── tailwind.config.ts # Configuração do Tailwind CSS
└── vite.config.ts     # Configuração do Vite
```

## 🖥️ Páginas

- **Auth** (`/auth`) - Página de login e registro
- **Home** (`/`) - Página inicial com feeds e destaques
- **Content** (`/content`) - Hub de conteúdo e notícias
- **Shop** (`/shop`) - Loja com itens resgatáveis
- **Live** (`/live`) - Streams ao vivo
- **Schedule** (`/schedule`) - Agenda de partidas
- **Profile** (`/profile`) - Perfil do usuário
- **Settings** (`/settings`) - Configurações da conta
- **Surveys** (`/surveys`) - Pesquisas e questionários

## 🎨 Tema e Design

O projeto utiliza o tema oficial da FURIA Esports, com suas cores e identidade visual. Os componentes são construídos usando Tailwind CSS e a biblioteca Shadcn/UI para garantir um design consistente e responsivo.

## 📄 Licença

Este projeto está sob a licença FURIA Esports. Todos os direitos reservados.