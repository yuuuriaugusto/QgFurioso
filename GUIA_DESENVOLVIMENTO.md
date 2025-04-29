# QG FURIOSO - Guia de Desenvolvimento

Este guia fornece instruções detalhadas para desenvolvedores que trabalham na plataforma QG FURIOSO. Ele abrange o ambiente de desenvolvimento, práticas recomendadas, convenções de código e fluxos de trabalho para cada componente do sistema.

## Índice

1. [Configuração do Ambiente](#configuração-do-ambiente)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Guia do Backend](#guia-do-backend)
4. [Guia do Frontend](#guia-do-frontend)
5. [Guia do Painel Admin](#guia-do-painel-admin)
6. [Banco de Dados](#banco-de-dados)
7. [Fluxos de Trabalho Comuns](#fluxos-de-trabalho-comuns)
8. [Testes](#testes)
9. [Implantação](#implantação)
10. [Solução de Problemas](#solução-de-problemas)

## Configuração do Ambiente

### Requisitos

- Node.js v18+
- PostgreSQL 15+
- npm ou yarn
- Git

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/your-organization/qg-furioso.git
   cd qg-furioso
   ```

2. Instale dependências:
   ```bash
   # Instalar dependências do backend
   cd qg-furioso-backend
   npm install
   
   # Instalar dependências do frontend
   cd ../qg-furioso-frontend
   npm install
   
   # Instalar dependências do painel admin
   cd ../qg-furioso-admin
   npm install
   ```

3. Configure o banco de dados:
   ```bash
   # Crie um banco de dados PostgreSQL
   createdb qg_furioso
   
   # No diretório backend, crie o arquivo .env com a seguinte configuração
   echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/qg_furioso" > .env
   echo "SESSION_SECRET=your_session_secret" >> .env
   echo "PORT=5000" >> .env
   echo "NODE_ENV=development" >> .env
   ```

4. Execute as migrações do banco de dados:
   ```bash
   cd qg-furioso-backend
   npm run db:push
   ```

5. Inicie o sistema:
   ```bash
   cd ..
   bash start-both.sh
   ```

## Estrutura do Projeto

```
qg-furioso/
├── qg-furioso-backend/
│   ├── auth.ts                # Autenticação e autorização
│   ├── database-storage.ts    # Camada de armazenamento
│   ├── db.ts                  # Configurações de banco de dados
│   ├── index.ts               # Ponto de entrada
│   ├── routes.ts              # Definições de rotas
│   └── schema.ts              # Schema do banco de dados
├── qg-furioso-frontend/
│   ├── public/                # Recursos estáticos
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── lib/               # Utilitários 
│   │   └── pages/             # Páginas/rotas
├── qg-furioso-admin/
│   ├── public/                # Recursos estáticos 
│   ├── src/
│   │   ├── api/               # Clientes de API
│   │   ├── components/        # Componentes UI
│   │   └── pages/             # Páginas/rotas
├── run-backend.sh             # Script para iniciar o backend
├── run-frontend.sh            # Script para iniciar o frontend
├── run-admin.sh               # Script para iniciar o painel admin
└── start-both.sh              # Script para iniciar tudo
```

## Guia do Backend

### Convenções de Nomenclatura

- **Arquivos**: Use `kebab-case` para nomes de arquivos (ex: `user-service.ts`)
- **Classes**: Use `PascalCase` para nomes de classes (ex: `DatabaseStorage`)
- **Funções/Métodos**: Use `camelCase` para funções (ex: `getUserByEmail`)
- **Constantes**: Use `UPPER_SNAKE_CASE` para constantes globais (ex: `DEFAULT_PAGE_SIZE`)

### Organização do Código

- Agrupe as APIs logicamente por recursos
- Mantenha os controladores separados da lógica de negócios
- Use a pasta `middleware` para middleware reutilizável

### Tratamento de Erros

O backend usa um esquema padronizado de tratamento de erros:

```typescript
// Exemplo de middleware de erro
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  
  console.error(`[ERROR] ${status} - ${message}`);
  console.error(err.stack);
  
  res.status(status).json({
    status: status,
    message: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});
```

### Manipulação de Rotas

Organize as rotas por recursos usando o roteador Express:

```typescript
// Exemplo de organização de rotas
const userRouter = express.Router();
userRouter.get('/', listUsers);
userRouter.get('/:id', getUserById);
userRouter.post('/', createUser);

app.use('/api/users', userRouter);
```

### Validação de Dados

Use schemas Zod para validação de entrada:

```typescript
// Exemplo de validação com Zod
import { z } from 'zod';

const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8)
});

function validateCreateUser(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = createUserSchema.parse(req.body);
    next();
  } catch (error) {
    next(new ValidationError('Dados de entrada inválidos', error));
  }
}
```

## Guia do Frontend

### Convenções de Nomenclatura

- **Componentes**: Use `PascalCase` para componentes (ex: `UserProfileCard.tsx`)
- **Hooks**: Prefixe hooks personalizados com "use" (ex: `useAuth.tsx`)
- **Páginas**: Use o sufixo "-page" (ex: `profile-page.tsx`)

### Estrutura de Componentes

Organize componentes por tipo:

```
components/
├── common/             # Componentes compartilhados (botões, cards, etc)
├── layout/             # Componentes de layout (Header, Footer, etc)
├── profile/            # Componentes específicos do perfil
├── shop/               # Componentes específicos da loja
└── ui/                 # Componentes de UI elementares
```

### Boas Práticas

- Use componentes funcionais e hooks
- Evite props drilling; use context quando necessário
- Extraia lógica complexa para hooks personalizados
- Componentes devem ter uma única responsabilidade
- Use lazy loading para componentes grandes

### Gerenciamento de Estado

Use React Query para gerenciamento de estado de servidor:

```typescript
// Exemplo de uso do React Query
function UserProfile() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/user'],
    queryFn: () => fetch('/api/user').then(res => res.json())
  });
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <UserProfileDisplay user={user} />;
}
```

### Rotas

Use Wouter para roteamento:

```typescript
// Configuração de rotas com Wouter
function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/shop" component={ShopPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
```

## Guia do Painel Admin

### Convenções de Nomenclatura

Siga as mesmas convenções do frontend, com a adição:

- **APIs**: Agrupe por recurso em arquivos separados (ex: `content.ts`, `users.ts`)

### Organização de Páginas

Estruture páginas por recursos:

```
pages/
├── dashboard/            # Dashboard principal
├── users/                # Gerenciamento de usuários
├── content/              # Gerenciamento de conteúdo
│   ├── NewsContentPage.tsx  # Página de notícias
│   └── SurveysPage.tsx   # Página de pesquisas
├── shop/                 # Gerenciamento da loja
└── audit/                # Logs de auditoria
```

### Formulários

Use o padrão de formulário com Ant Design e validação:

```typescript
// Exemplo de formulário com validação
const [form] = Form.useForm();

function handleSubmit() {
  form.validateFields()
    .then(values => {
      // Chame a API com valores validados
    })
    .catch(info => {
      console.log('Validate Failed:', info);
    });
}

// No JSX
<Form form={form} layout="vertical" onFinish={handleSubmit}>
  <Form.Item 
    name="title" 
    label="Título"
    rules={[{ required: true, message: 'Por favor, digite um título' }]}
  >
    <Input />
  </Form.Item>
  {/* Outros campos */}
  <Button type="primary" htmlType="submit">Salvar</Button>
</Form>
```

### Tabelas e Filtros

Implemente tabelas com filtragem:

```typescript
// Exemplo de tabela com filtros e ordenação
<Table
  columns={columns}
  dataSource={data}
  rowKey="id"
  loading={isLoading}
  onChange={handleTableChange}
  pagination={{
    current: pagination.page,
    pageSize: pagination.pageSize,
    total: totalItems,
    showSizeChanger: true,
  }}
/>
```

## Banco de Dados

### Modelo de Dados

Veja o arquivo `schema.ts` para a definição completa do modelo de dados.

### Migrações

Use o comando `npm run db:push` para aplicar alterações no schema:

```bash
# No diretório backend
npm run db:push
```

Para migrações mais complexas, use scripts SQL manuais.

### Boas Práticas

- Sempre defina chaves estrangeiras e relações explicitamente
- Use índices para campos frequentemente consultados
- Evite consultas N+1 usando `JOIN`
- Use transações para operações que envolvem múltiplas tabelas

### Tipos Comuns

```typescript
// Exemplos de tipos derivados do schema
type User = typeof users.$inferSelect;
type InsertUser = z.infer<typeof insertUserSchema>;
```

## Fluxos de Trabalho Comuns

### Adicionar um Novo Recurso

1. **Planeje o recurso**:
   - Defina o modelo de dados necessário
   - Defina os endpoints da API
   - Esboce o UI necessário

2. **Implemente no Backend**:
   - Atualize o schema (`schema.ts`)
   - Atualize o armazenamento (`database-storage.ts`)
   - Adicione rotas (`routes.ts`)

3. **Implemente no Frontend/Admin**:
   - Adicione API client
   - Crie componentes UI
   - Implemente páginas
   - Conecte com a API

4. **Teste o recurso**:
   - Teste cada endpoint
   - Teste fluxos de usuário
   - Verifique tratamento de erros

### Modificar um Recurso Existente

1. **Analise o impacto da mudança**:
   - Identifique todos os componentes afetados
   - Verifique se é necessário migração de dados

2. **Implemente mudanças**:
   - Atualize os modelos
   - Atualize as APIs
   - Atualize os componentes UI

3. **Teste alterações**:
   - Teste regressão
   - Verifique compatibilidade

## Testes

### Backend

Use Jest para testes unitários e de integração:

```typescript
// Exemplo de teste unitário
describe('UserService', () => {
  it('should return user by id', async () => {
    const user = await userService.getUserById(1);
    expect(user).toBeDefined();
    expect(user.id).toBe(1);
  });
});
```

### Frontend

Use React Testing Library para testes de componente:

```typescript
// Exemplo de teste de componente
import { render, screen } from '@testing-library/react';

test('renders user profile correctly', () => {
  render(<UserProfile user={{ name: 'Test User' }} />);
  expect(screen.getByText('Test User')).toBeInTheDocument();
});
```

## Implantação

### Preparação para Produção

1. Construa os artefatos de produção:
   ```bash
   # Frontend
   cd qg-furioso-frontend
   npm run build
   
   # Admin
   cd ../qg-furioso-admin
   npm run build
   ```

2. Configure variáveis de ambiente para produção:
   ```
   NODE_ENV=production
   DATABASE_URL=...
   SESSION_SECRET=...
   ```

3. Inicie o servidor em modo de produção:
   ```bash
   cd qg-furioso-backend
   npm run start:prod
   ```

### Monitoramento

- Use Winston para logging
- Implemente health checks
- Configure monitoramento de aplicativo

## Solução de Problemas

### Problemas Comuns e Soluções

- **Erro de conexão com o banco de dados**:
  - Verifique se o PostgreSQL está em execução
  - Verifique a URL de conexão
  - Verifique permissões do usuário

- **Erro 401 Unauthorized**:
  - Verifique se o usuário está autenticado
  - Verifique se o cookie de sessão está presente
  - Verifique se a sessão não expirou

- **Frontend não se conecta ao backend**:
  - Verifique a configuração CORS
  - Verifique URL base da API
  - Verifique se o servidor backend está em execução

- **Problemas de dependência**:
  - Limpe o cache de node_modules: `rm -rf node_modules && npm install`
  - Verifique compatibilidade de versões no package.json

### Logs

Para debugging mais detalhado no backend:

```typescript
// Configurar logs detalhados
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

---

## Referências

- [Documentação do Node.js](https://nodejs.org/docs)
- [Documentação do Express](https://expressjs.com/)
- [Documentação do React](https://reactjs.org/docs)
- [Documentação do Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Documentação do Ant Design](https://ant.design/docs/react/introduce)

---

Este guia é um documento vivo. Sinta-se à vontade para contribuir com atualizações conforme o projeto evolui.

© 2025 QG FURIOSO. Todos os direitos reservados.