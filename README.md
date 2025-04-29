# QG FURIOSO - Plataforma de Engajamento de Fãs

Este projeto contém uma plataforma de engajamento de fãs para FURIA Esports, dividida em duas partes: backend e frontend.

## Estrutura do Projeto

O projeto está organizado em dois repositórios separados:

- **qg-furioso-backend** - API REST em Express/TypeScript com banco de dados PostgreSQL
- **qg-furioso-frontend** - Interface de usuário em React/TypeScript com Tailwind CSS

## Inicialização

Você pode iniciar cada parte individualmente ou ambas ao mesmo tempo:

### Iniciar apenas o backend
```bash
./run-backend.sh
```

### Iniciar apenas o frontend
```bash
./run-frontend.sh
```

### Iniciar ambos (backend e frontend)
```bash
./start-both.sh
```
Nota: O script `start-both.sh` utiliza `tmux` para executar ambos os serviços ao mesmo tempo.

## Desenvolvimento

### Backend

O backend está configurado com:
- Express para API REST
- Drizzle ORM para acesso ao banco de dados PostgreSQL
- Passport para autenticação
- Express Session para gerenciar sessões

Para mais detalhes, consulte o [README do backend](./qg-furioso-backend/README.md).

### Frontend

O frontend está configurado com:
- React para construção da interface
- Vite como ferramenta de build
- TanStack Query para gerenciamento de estado e cache
- Tailwind CSS para estilização
- Shadcn/UI para componentes
- Wouter para roteamento

Para mais detalhes, consulte o [README do frontend](./qg-furioso-frontend/README.md).

## Configuração de Ambientes

Cada repositório contém arquivos `.env.example` que devem ser copiados para `.env` e configurados corretamente:

### Backend (.env)
- `DATABASE_URL` - URL de conexão com o PostgreSQL
- `SESSION_SECRET` - Chave secreta para criptografia de sessões
- `PORT` - Porta onde o servidor será executado (padrão: 5000)
- `CORS_ORIGIN` - Origem permitida para requisições CORS (em desenvolvimento: http://localhost:5173)

### Frontend (.env)
- `VITE_API_URL` - URL da API do backend (em desenvolvimento: http://localhost:5000)

## Credenciais de Teste

O sistema cria automaticamente um usuário de teste com as seguintes credenciais:

- **Email**: teste@furia.com
- **Senha**: furiafan123

## Licença

© FURIA Esports - Todos os direitos reservados.