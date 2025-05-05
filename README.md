# QG FURIOSO - Plataforma de Engajamento de Fãs

Este projeto contém uma plataforma completa de engajamento de fãs para FURIA Esports, projetada para conectar fãs ao redor do mundo através de experiências digitais imersivas e interativas.

## Visão Geral

O QG FURIOSO é uma plataforma abrangente que oferece diversas funcionalidades:

- 🏆 **Acompanhamento de Partidas e Eventos**: informações sobre competições e calendário de eventos
- 💰 **Sistema de FURIA Coins**: economia virtual para recompensas e aquisição de itens exclusivos 
- 👤 **Perfis Personalizados**: gerenciamento completo de perfis de usuário com verificação KYC
- 📊 **Pesquisas e Feedback**: sistema para coleta de opinião dos fãs com recompensas
- 📰 **Central de Conteúdo**: notícias e atualizações filtradas por jogo/categoria
- 🔴 **Transmissões Ao Vivo**: integração com streams e conteúdo em tempo real

## Estrutura do Projeto

O projeto é dividido em três componentes principais integrados:

- **Backend**: API REST em Express/TypeScript com banco de dados PostgreSQL
- **Frontend**: Interface de usuário em React/TypeScript com Tailwind CSS e Shadcn/UI
- **Painel Administrativo**: Dashboard para gerenciamento de conteúdo, usuários e relatórios

## Tecnologias Utilizadas

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL com Drizzle ORM
- Passport.js para autenticação 
- WebSockets para funcionalidades em tempo real

### Frontend & Admin
- React 
- TypeScript
- Tailwind CSS com Shadcn/UI (Frontend)
- Vite como ferramenta de build
- TanStack Query para gerenciamento de estado
- Sistema de formulários com React Hook Form e Zod

## Inicialização Rápida

Para executar o projeto:

```bash
# Inicia a aplicação completa
npm run dev
```

## Credenciais de Acesso

### Usuário Regular
- **Email**: teste@furia.com
- **Senha**: furiafan123

### Administrador
- **Email**: admin@furia.com
- **Senha**: admin123

## Documentação

Para informações mais detalhadas, consulte os seguintes documentos:

- [Documentação Técnica](./DOCUMENTACAO.md) - Visão geral técnica da arquitetura e implementação
- [Esquema de Banco de Dados](./ESQUEMA_DB.md) - Detalhes sobre o modelo de dados e relações
- [Guia para Administradores](./GUIA_ADMINISTRADORES.md) - Instruções para uso do painel administrativo
- [Guia para Usuários](./GUIA_USUARIO.md) - Instruções para navegação e uso da plataforma
- [Guia para Desenvolvedores](./GUIA_DESENVOLVIMENTO.md) - Instruções para desenvolvimento e extensão
- [WebSockets](./WEBSOCKETS.md) - Documentação sobre os recursos em tempo real

## Requisitos de Ambiente

- Node.js 18+
- PostgreSQL 14+
- Navegador moderno com suporte a ES6

## Licença

© FURIA Esports - Todos os direitos reservados.