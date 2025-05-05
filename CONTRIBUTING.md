# Guia de Contribuição - QG FURIOSO

**Data da última atualização:** 04 de Maio de 2025  
**Versão da plataforma:** 2.5.0

Este documento fornece diretrizes para contribuir com o desenvolvimento do projeto QG FURIOSO, plataforma de engajamento de fãs da FURIA Esports.

## Índice

1. [Código de Conduta](#código-de-conduta)
2. [Fluxo de Trabalho Git](#fluxo-de-trabalho-git)
3. [Estilo de Código](#estilo-de-código)
4. [Commit Messages](#commit-messages)
5. [Pull Requests](#pull-requests)
6. [Testes](#testes)
7. [Política de Branches](#política-de-branches)

## Código de Conduta

* Trate todos os colaboradores com respeito
* Comunique-se de forma construtiva e profissional
* Aceite feedback construtivo
* Foque nas soluções, não nos problemas
* Documente seu trabalho adequadamente

## Fluxo de Trabalho Git

Utilizamos o workflow Git Flow para organizar nosso desenvolvimento:

* `main` - Branch de produção, sempre estável
* `develop` - Branch de desenvolvimento, integração contínua
* `feature/*` - Branches para novas funcionalidades
* `bugfix/*` - Branches para correções de bugs
* `release/*` - Branches para preparação de releases
* `hotfix/*` - Branches para correções urgentes em produção

### Criando uma Nova Feature

```bash
# Certifique-se de estar na branch develop atualizada
git checkout develop
git pull origin develop

# Crie uma nova branch de feature
git checkout -b feature/nome-da-feature

# Faça seus commits e, quando finalizar
git push origin feature/nome-da-feature

# Crie um Pull Request no GitHub para develop
```

## Estilo de Código

### TypeScript/JavaScript

* Utilizamos ESLint com configuração estendida do Airbnb
* 2 espaços para indentação
* Ponto-e-vírgula no final das linhas
* Utilize tipos explícitos sempre que possível no TypeScript
* Siga a convenção de nomes:
  * `PascalCase` para componentes, classes e tipos
  * `camelCase` para variáveis, funções e métodos
  * `UPPER_SNAKE_CASE` para constantes
  * `kebab-case` para nomes de arquivos de componentes

### CSS/Tailwind

* Use Tailwind CSS quando possível
* Organize as classes na ordem: layout, posicionamento, dimensões, estilo, responsividade
* Use módulos CSS para estilos personalizados quando necessário

### Comentários

* Escreva comentários que explicam "por quê", não "como"
* Documente funções complexas com JSDoc
* Mantenha comentários atualizados, remova comentários obsoletos

## Commit Messages

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

Tipos comuns:
* `feat`: Nova funcionalidade
* `fix`: Correção de bug
* `docs`: Alterações na documentação
* `style`: Alterações de formatação
* `refactor`: Refatoração de código
* `test`: Adição ou modificação de testes
* `chore`: Alterações no processo de build ou ferramentas auxiliares

Exemplos:
```
feat(auth): implementa autenticação com Google

fix(shop): corrige cálculo de preço total no carrinho

docs: atualiza documentação da API
```

## Pull Requests

* Crie PRs focados que abordam um único problema ou feature
* Preencha o template do PR com todos os detalhes necessários
* Vincule o PR a issues relacionadas
* Certifique-se que todos os testes estão passando
* Solicite revisão de pelo menos um mantenedor do projeto
* Responda aos feedbacks e faça as alterações necessárias

## Testes

* Escreva testes para todas as novas funcionalidades
* Mantenha a cobertura de testes em pelo menos 80%
* Tipos de testes a implementar:
  * Testes unitários para funções e componentes
  * Testes de integração para fluxos completos
  * Testes end-to-end para funcionalidades críticas

```bash
# Rodar todos os testes
npm test

# Rodar testes de uma única feature
npm test -- --testPathPattern=auth
```

## Política de Branches

### Proteções de Branch

* `main` e `develop` são branches protegidas
* Não é permitido push direto para branches protegidas
* PRs para branches protegidas requerem pelo menos uma aprovação
* Status checks devem passar antes do merge

### Ciclo de Vida de uma Branch

1. Crie a branch a partir de `develop`
2. Desenvolva a funcionalidade e faça commits
3. Mantenha a branch atualizada fazendo `git rebase develop` regularmente
4. Quando concluído, abra um PR para `develop`
5. Após aprovação e testes, a branch será mesclada
6. A branch será excluída após o merge

## Processo de Release

1. Uma branch `release/vX.Y.Z` é criada a partir de `develop`
2. Ajustes finais e correções de bugs são feitos nesta branch
3. Quando pronto, a release é mesclada em `main` e em `develop`
4. A versão é etiquetada em `main`
5. A branch `release/*` é excluída

## Perguntas e Suporte

Se você tiver dúvidas sobre o processo de contribuição, entre em contato com a equipe de desenvolvimento através do canal #desenvolvimento no Slack interno do projeto.

---

Agradecemos por contribuir para o QG FURIOSO! Seu esforço ajuda a melhorar a experiência de fãs da FURIA Esports em todo o mundo.