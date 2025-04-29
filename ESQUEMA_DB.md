# Documentação do Esquema de Banco de Dados - QG FURIOSO

## Visão Geral

O banco de dados do QG FURIOSO está estruturado para suportar uma plataforma de engajamento de fãs completa. Abaixo está a documentação detalhada de todas as tabelas, colunas e relações que compõem o esquema do banco de dados.

## Diagrama de Entidade-Relacionamento

```
+-------------------+     +---------------------+     +----------------------+
|      USERS        |     |    USER_PROFILES    |     |   USER_PREFERENCES   |
+-------------------+     +---------------------+     +----------------------+
| id (PK)           |<-+  | userId (PK, FK)     |     | userId (PK, FK)      |
| publicId          |  |  | firstName           |     | emailNotifications   |
| primaryIdentity   |  |  | lastName            |     | pushNotifications    |
| identityType      |  |  | birthDate           |     | marketingConsent     |
| passwordHash      |  |  | cpfEncrypted        |     | theme                |
| status            |  |  | addressStreet       |     | language             |
| lastLoginAt       |  |  | addressNumber       |     +----------------------+
| createdAt         |  |  | addressComplement   |             ^
| updatedAt         |  |  | addressNeighborhood |             |
+------+------------+  |  | addressCity         |             |
       |               |  | addressState        |             |
       |               |  | addressZipCode      |             |
       |               |  | interests           |             |
       |               |  | activitiesEvents    |             |
       |               |  | avatarUrl           |             |
       |               |  +---------------------+             |
       |               |                                      |
       |               |  +---------------------+             |
       |               +->| COIN_BALANCES       |             |
       |               |  +---------------------+             |
       |               |  | userId (PK, FK)     |             |
       |               |  | balance             |             |
       |               |  | lifetimeEarned      |             |
       |               |  | lifetimeSpent       |             |
       |               |  | updatedAt           |             |
       |               |  +---------------------+             |
       |               |                                      |
       |               |  +---------------------+             |
       |               +->| KYC_VERIFICATIONS   |             |
       |               |  +---------------------+             |
       |               |  | id (PK)             |             |
       |               |  | userId (FK)         |             |
       |               |  | status              |             |
       |               |  | providerReference   |             |
       |               |  | verificationData    |             |
       |               |  | createdAt           |             |
       |               |  | updatedAt           |             |
       |               |  +---------------------+             |
       |               |                                      |
       |               +----------------------------------+   |
       |                                                  |   |
+------v------------+  +---------------------+  +---------v---v---------+
| COIN_TRANSACTIONS |  | SOCIAL_LINKS        |  | ESPORTS_PROFILE_LINKS |
+-------------------+  +---------------------+  +-----------------------+
| id (PK)           |  | id (PK)             |  | id (PK)               |
| userId (FK)       |  | userId (FK)         |  | userId (FK)           |
| amount            |  | platform            |  | platform              |
| transactionType   |  | platformUserId      |  | profileUrl            |
| description       |  | accessToken         |  | username              |
| relatedEntityType |  | refreshToken        |  | validationStatus      |
| relatedEntityId   |  | tokenExpiry         |  | validatedAt           |
| createdAt         |  | username            |  | createdAt             |
+-------------------+  | profileUrl          |  +-----------------------+
                       | createdAt           |
                       | updatedAt           |
                       +---------------------+

+-------------------+     +---------------------+
|    SHOP_ITEMS     |     | REDEMPTION_ORDERS   |
+-------------------+     +---------------------+
| id (PK)           |<-+  | id (PK)             |
| name              |  |  | userId (FK)         |
| description       |  |  | shopItemId (FK)     |
| imageUrl          |  |  | quantity            |
| coinPrice         |  |  | coinCost            |
| type              |  |  | status              |
| stock             |  |  | shippingData        |
| isActive          |  |  | fulfillmentData     |
| createdAt         |  |  | createdAt           |
| updatedAt         |  |  | updatedAt           |
+-------------------+  |  +---------------------+
                       |
                       |  +---------------------+
                       |  | NEWS_CONTENT        |
                       |  +---------------------+
                       |  | id (PK)             |
                       |  | title               |
                       |  | slug                |
                       |  | content             |
                       |  | excerpt             |
                       |  | imageUrl            |
                       |  | category            |
                       |  | authorId (FK)       |
                       |  | publishDate         |
                       |  | isPublished         |
                       |  | updatedAt           |
                       |  +---------------------+

+-------------------+     +---------------------+     +----------------------+
|     SURVEYS       |     |  SURVEY_QUESTIONS   |     |   SURVEY_RESPONSES   |
+-------------------+     +---------------------+     +----------------------+
| id (PK)           |<-+  | id (PK)             |     | id (PK)              |
| title             |  |  | surveyId (FK)       |<-+  | surveyId (FK)        |
| description       |  |  | questionText        |  |  | userId (FK)          |
| reward            |  |  | questionType        |  |  | responses            |
| expirationDate    |  |  | options             |  |  | completedAt          |
| status            |  |  | isRequired          |  |  | rewardIssued         |
| estimatedTimeMin  |  |  | orderIndex          |  |  +----------------------+
| createdAt         |  |  +---------------------+  |
| updatedAt         |  |                           |
+-------------------+  +---------------------------+

+-------------------+     +---------------------+
|      MATCHES      |     |      STREAMS        |
+-------------------+     +---------------------+
| id (PK)           |     | id (PK)             |
| game              |     | platform            |
| tournamentName    |     | channelId           |
| teamOneName       |     | streamUrl           |
| teamOneLogoUrl    |     | title               |
| teamOneCountry    |     | thumbnailUrl        |
| teamTwoName       |     | game                |
| teamTwoLogoUrl    |     | streamerName        |
| teamTwoCountry    |     | streamerAvatarUrl   |
| scheduledDate     |     | status              |
| result            |     | viewerCount         |
| status            |     | lastCheckedAt       |
| streamUrl         |     | createdAt           |
| createdAt         |     +---------------------+
| updatedAt         |
+-------------------+
```

## Descrição das Tabelas

### Tabela: `users`
Armazena informações básicas sobre os usuários da plataforma.

| Coluna           | Tipo      | Descrição                                             |
|------------------|-----------|-------------------------------------------------------|
| id               | serial    | Identificador único do usuário (PK)                   |
| publicId         | uuid      | ID público para uso em URLs e referências externas    |
| primaryIdentity  | text      | Email ou telefone principal (único)                   |
| identityType     | text      | Tipo de identidade ("email" ou "phone")               |
| passwordHash     | text      | Hash da senha do usuário                              |
| status           | text      | Status da conta (default: "pending_verification")     |
| lastLoginAt      | timestamp | Data e hora do último login                           |
| createdAt        | timestamp | Data e hora da criação da conta                       |
| updatedAt        | timestamp | Data e hora da última atualização                     |

### Tabela: `user_profiles`
Armazena informações detalhadas do perfil do usuário.

| Coluna               | Tipo     | Descrição                                        |
|----------------------|----------|-------------------------------------------------|
| userId               | integer  | ID do usuário (PK, FK → users.id)               |
| firstName            | text     | Nome do usuário                                 |
| lastName             | text     | Sobrenome do usuário                            |
| birthDate            | date     | Data de nascimento                              |
| cpfEncrypted         | text     | CPF criptografado                               |
| addressStreet        | text     | Rua do endereço                                 |
| addressNumber        | text     | Número do endereço                              |
| addressComplement    | text     | Complemento do endereço                         |
| addressNeighborhood  | text     | Bairro                                          |
| addressCity          | text     | Cidade                                          |
| addressState         | text     | Estado                                          |
| addressZipCode       | text     | CEP                                             |
| interests            | jsonb    | Interesses do usuário (JSON)                    |
| activitiesEvents     | text     | Atividades e eventos de interesse               |
| avatarUrl            | text     | URL da imagem de avatar                         |

### Tabela: `user_preferences`
Armazena preferências de configuração do usuário.

| Coluna             | Tipo     | Descrição                                     |
|--------------------|----------|-----------------------------------------------|
| userId             | integer  | ID do usuário (PK, FK → users.id)            |
| emailNotifications | boolean  | Receber notificações por email (default: true) |
| pushNotifications  | boolean  | Receber notificações push (default: true)     |
| marketingConsent   | boolean  | Consentimento para marketing (default: false) |
| theme              | text     | Tema da interface (default: "dark")           |
| language           | text     | Idioma preferido (default: "pt-BR")           |

### Tabela: `social_links`
Armazena conexões com redes sociais.

| Coluna          | Tipo      | Descrição                                   |
|-----------------|-----------|---------------------------------------------|
| id              | serial    | ID único da conexão (PK)                    |
| userId          | integer   | ID do usuário (FK → users.id)               |
| platform        | text      | Nome da plataforma social                   |
| platformUserId  | text      | ID do usuário na plataforma                 |
| accessToken     | text      | Token de acesso para a API                  |
| refreshToken    | text      | Token de atualização                        |
| tokenExpiry     | timestamp | Data de expiração do token                  |
| username        | text      | Nome de usuário na plataforma               |
| profileUrl      | text      | URL do perfil na plataforma                 |
| createdAt       | timestamp | Data de criação                             |
| updatedAt       | timestamp | Data de atualização                         |

### Tabela: `kyc_verifications`
Armazena informações de verificação KYC (Know Your Customer).

| Coluna            | Tipo      | Descrição                                   |
|-------------------|-----------|---------------------------------------------|
| id                | serial    | ID único da verificação (PK)                |
| userId            | integer   | ID do usuário (FK → users.id)               |
| status            | text      | Status da verificação (default: "pending")  |
| providerReference | text      | Referência do provedor de verificação       |
| verificationData  | jsonb     | Dados da verificação (JSON)                 |
| createdAt         | timestamp | Data de criação                             |
| updatedAt         | timestamp | Data de atualização                         |

### Tabela: `esports_profile_links`
Armazena links para perfis de e-sports dos usuários.

| Coluna           | Tipo      | Descrição                                    |
|------------------|-----------|----------------------------------------------|
| id               | serial    | ID único do link (PK)                        |
| userId           | integer   | ID do usuário (FK → users.id)                |
| platform         | text      | Nome da plataforma (Steam, Epic, etc.)       |
| profileUrl       | text      | URL do perfil                                |
| username         | text      | Nome de usuário na plataforma                |
| validationStatus | text      | Status de validação (default: "pending")     |
| validatedAt      | timestamp | Data de validação                            |
| createdAt        | timestamp | Data de criação                              |

### Tabela: `coin_balances`
Armazena o saldo de moedas virtuais dos usuários.

| Coluna         | Tipo      | Descrição                                      |
|----------------|-----------|------------------------------------------------|
| userId         | integer   | ID do usuário (PK, FK → users.id)              |
| balance        | integer   | Saldo atual de moedas (default: 0)             |
| lifetimeEarned | integer   | Total de moedas ganhas (default: 0)            |
| lifetimeSpent  | integer   | Total de moedas gastas (default: 0)            |
| updatedAt      | timestamp | Data de atualização                            |

### Tabela: `coin_transactions`
Registra todas as transações de moedas.

| Coluna           | Tipo      | Descrição                                     |
|------------------|-----------|-----------------------------------------------|
| id               | serial    | ID único da transação (PK)                    |
| userId           | integer   | ID do usuário (FK → users.id)                 |
| amount           | integer   | Quantidade de moedas (positivo/negativo)      |
| transactionType  | text      | Tipo de transação                             |
| description      | text      | Descrição da transação                        |
| relatedEntityType| text      | Tipo de entidade relacionada (opcional)       |
| relatedEntityId  | integer   | ID da entidade relacionada (opcional)         |
| createdAt        | timestamp | Data da transação                             |

### Tabela: `shop_items`
Armazena itens disponíveis na loja.

| Coluna      | Tipo      | Descrição                                       |
|-------------|-----------|--------------------------------------------------|
| id          | serial    | ID único do item (PK)                            |
| name        | text      | Nome do item                                     |
| description | text      | Descrição do item                                |
| imageUrl    | text      | URL da imagem do item                            |
| coinPrice   | integer   | Preço em moedas                                  |
| type        | text      | Tipo do item (físico, digital, experiência)      |
| stock       | integer   | Quantidade em estoque (opcional)                 |
| isActive    | boolean   | Se o item está disponível (default: true)        |
| createdAt   | timestamp | Data de criação                                  |
| updatedAt   | timestamp | Data de atualização                              |

### Tabela: `redemption_orders`
Registra os pedidos de resgate de itens da loja.

| Coluna         | Tipo      | Descrição                                      |
|----------------|-----------|------------------------------------------------|
| id             | serial    | ID único do pedido (PK)                        |
| userId         | integer   | ID do usuário (FK → users.id)                  |
| shopItemId     | integer   | ID do item (FK → shop_items.id)                |
| quantity       | integer   | Quantidade (default: 1)                        |
| coinCost       | integer   | Custo total em moedas                          |
| status         | text      | Status do pedido (default: "pending")          |
| shippingData   | jsonb     | Dados de envio (JSON, para itens físicos)      |
| fulfillmentData| jsonb     | Dados de entrega (JSON)                        |
| createdAt      | timestamp | Data de criação                                |
| updatedAt      | timestamp | Data de atualização                            |

### Tabela: `news_content`
Armazena conteúdo de notícias e atualizações.

| Coluna      | Tipo      | Descrição                                        |
|-------------|-----------|--------------------------------------------------|
| id          | serial    | ID único do conteúdo (PK)                        |
| title       | text      | Título do conteúdo                               |
| slug        | text      | Slug para URL (único)                            |
| content     | text      | Conteúdo completo                                |
| excerpt     | text      | Resumo (opcional)                                |
| imageUrl    | text      | URL da imagem de destaque                        |
| category    | text      | Categoria do conteúdo                            |
| authorId    | integer   | ID do autor (FK → users.id)                      |
| publishDate | timestamp | Data de publicação                               |
| isPublished | boolean   | Se está publicado (default: false)               |
| updatedAt   | timestamp | Data de atualização                              |

### Tabela: `matches`
Armazena informações sobre partidas agendadas.

| Coluna          | Tipo      | Descrição                                      |
|-----------------|-----------|------------------------------------------------|
| id              | serial    | ID único da partida (PK)                       |
| game            | text      | Nome do jogo                                   |
| tournamentName  | text      | Nome do torneio                                |
| teamOneName     | text      | Nome do primeiro time                          |
| teamOneLogoUrl  | text      | URL do logo do primeiro time                   |
| teamOneCountry  | text      | País do primeiro time                          |
| teamTwoName     | text      | Nome do segundo time                           |
| teamTwoLogoUrl  | text      | URL do logo do segundo time                    |
| teamTwoCountry  | text      | País do segundo time                           |
| scheduledDate   | timestamp | Data e hora agendada                           |
| result          | text      | Resultado da partida (opcional)                |
| status          | text      | Status da partida (default: "upcoming")        |
| streamUrl       | text      | URL da transmissão (opcional)                  |
| createdAt       | timestamp | Data de criação                                |
| updatedAt       | timestamp | Data de atualização                            |

### Tabela: `streams`
Armazena informações sobre transmissões ao vivo.

| Coluna           | Tipo      | Descrição                                     |
|------------------|-----------|-----------------------------------------------|
| id               | serial    | ID único da transmissão (PK)                  |
| platform         | text      | Plataforma da transmissão                     |
| channelId        | text      | ID do canal na plataforma                     |
| streamUrl        | text      | URL da transmissão                            |
| title            | text      | Título da transmissão                         |
| thumbnailUrl     | text      | URL da miniatura                              |
| game             | text      | Jogo sendo transmitido                        |
| streamerName     | text      | Nome do streamer                              |
| streamerAvatarUrl| text      | URL do avatar do streamer                     |
| status           | text      | Status (default: "offline")                   |
| viewerCount      | integer   | Contagem de espectadores                      |
| lastCheckedAt    | timestamp | Último momento de verificação                 |
| createdAt        | timestamp | Data de criação                               |

### Tabela: `surveys`
Armazena pesquisas para os usuários.

| Coluna             | Tipo      | Descrição                                   |
|--------------------|-----------|---------------------------------------------|
| id                 | serial    | ID único da pesquisa (PK)                   |
| title              | text      | Título da pesquisa                          |
| description        | text      | Descrição da pesquisa                       |
| reward             | integer   | Recompensa em moedas                        |
| expirationDate     | timestamp | Data de expiração (opcional)                |
| status             | text      | Status da pesquisa (default: "draft")       |
| estimatedTimeMinutes| integer   | Tempo estimado para conclusão              |
| createdAt          | timestamp | Data de criação                             |
| updatedAt          | timestamp | Data de atualização                         |

### Tabela: `survey_questions`
Armazena perguntas das pesquisas.

| Coluna       | Tipo      | Descrição                                        |
|--------------|-----------|--------------------------------------------------|
| id           | serial    | ID único da pergunta (PK)                        |
| surveyId     | integer   | ID da pesquisa (FK → surveys.id)                 |
| questionText | text      | Texto da pergunta                                |
| questionType | text      | Tipo de pergunta (múltipla escolha, texto, etc.) |
| options      | jsonb     | Opções de resposta (JSON, para múltipla escolha) |
| isRequired   | boolean   | Se a resposta é obrigatória (default: true)      |
| orderIndex   | integer   | Ordem da pergunta na pesquisa                    |

### Tabela: `survey_responses`
Armazena respostas dos usuários às pesquisas.

| Coluna       | Tipo      | Descrição                                        |
|--------------|-----------|--------------------------------------------------|
| id           | serial    | ID único da resposta (PK)                        |
| surveyId     | integer   | ID da pesquisa (FK → surveys.id)                 |
| userId       | integer   | ID do usuário (FK → users.id)                    |
| responses    | jsonb     | Respostas às perguntas (JSON)                    |
| completedAt  | timestamp | Data de conclusão                                |
| rewardIssued | boolean   | Se a recompensa foi emitida (default: false)     |

## Relações e Restrições

- Um usuário tem:
  - Um perfil (1:1)
  - Uma configuração de preferências (1:1)
  - Um saldo de moedas (1:1)
  - Múltiplos links sociais (1:N)
  - Uma verificação KYC (1:1)
  - Múltiplos perfis de esports (1:N)
  - Múltiplas transações de moedas (1:N)
  - Múltiplos pedidos de resgate (1:N)
  - Múltiplos conteúdos de autoria (1:N)
  - Múltiplas respostas de pesquisa (1:N)

- Um item da loja tem:
  - Múltiplos pedidos de resgate (1:N)

- Uma pesquisa tem:
  - Múltiplas perguntas (1:N)
  - Múltiplas respostas (1:N)

## Índices

- `users`: índices em `id`, `publicId`, `primaryIdentity`
- `userProfiles`: índice em `userId`
- `userPreferences`: índice em `userId`
- `socialLinks`: índices em `id`, `userId`, `platform`
- `kycVerifications`: índices em `id`, `userId`, `status`
- `esportsProfileLinks`: índices em `id`, `userId`, `platform`
- `coinBalances`: índice em `userId`
- `coinTransactions`: índices em `id`, `userId`, `transactionType`
- `shopItems`: índices em `id`, `type`, `isActive`
- `redemptionOrders`: índices em `id`, `userId`, `shopItemId`, `status`
- `newsContent`: índices em `id`, `slug`, `category`, `authorId`, `isPublished`
- `matches`: índices em `id`, `game`, `status`, `scheduledDate`
- `streams`: índices em `id`, `platform`, `status`
- `surveys`: índices em `id`, `status`
- `surveyQuestions`: índices em `id`, `surveyId`
- `surveyResponses`: índices em `id`, `surveyId`, `userId`

## Integridade Referencial

- Todas as chaves estrangeiras têm restrições de integridade referencial
- Exclusão em cascata não está ativada para preservar histórico e integridade dos dados

## Esquemas de Validação

O sistema utiliza o Zod para validação de dados com esquemas para:

- Inserção de usuários
- Perfis de usuário
- Preferências de usuário
- Links sociais
- Verificações KYC
- Perfis de esports
- Transações de moedas
- Itens da loja
- Pedidos de resgate
- Conteúdo de notícias
- Partidas
- Transmissões
- Pesquisas e respostas

## Histórico e Auditoria

- A maioria das tabelas inclui campos `createdAt` e `updatedAt` para trilha de auditoria
- As transações de moedas fornecem um histórico completo da economia virtual
- O sistema de logs de auditoria é implementado separadamente e registra ações administrativas