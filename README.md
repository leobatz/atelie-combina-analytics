# Ateliê Combina Analytics

Aplicação web para acompanhar clientes, pedidos e resultados do Ateliê Combina. O sistema reúne uma interface em português, uma API com autenticação e dados armazenados em PostgreSQL.

## Funcionalidades atuais

- Login com usuário e senha; a API protege as rotas de clientes e pedidos com JWT.
- Cadastro e consulta de clientes, com busca por nome ou telefone.
- Criação de pedidos com um cliente existente ou novo, data de entrega, observações e um ou mais itens.
- Consulta de pedidos por situação: pendentes, atrasados e concluídos. É possível concluir, reabrir e cancelar pedidos; o cancelamento preserva o registro no banco.
- Dashboard com total de clientes, listas de pedidos pendentes e atrasados, quantidade de pedidos concluídos e faturamento anual dos pedidos concluídos, agrupado pelo mês de entrega.

**Limites da versão atual:** a edição de clientes e o campo cidade são apenas uma prévia local na interface. A API ainda não oferece edição ou exclusão de clientes, edição de itens de pedidos, catálogo de produtos nem uma rota própria de dashboard. Os indicadores são calculados no frontend a partir das listas de clientes e pedidos.

## Tecnologias e estrutura

| Camada | Tecnologias | Pasta |
| --- | --- | --- |
| Interface | React, Vite, Tailwind CSS e Axios | [`frontend/`](frontend/) |
| API | Node.js, Express, Sequelize e JWT | [`backend/`](backend/) |
| Persistência | PostgreSQL | Configurada em `backend/.env` |

```text
.
├── backend/    # API, modelos, regras de pedidos e testes
├── frontend/   # Telas de login, dashboard, clientes e pedidos
└── Diagramas/  # Diagramas de fluxos e modelagem inicial
```

## Executar localmente

**Pré-requisitos:** Node.js e npm compatíveis com as dependências do projeto, além de um banco PostgreSQL acessível. Crie o banco antes de iniciar a API.

1. Instale as dependências da API:

   ```bash
   cd backend
   npm ci
   ```

2. Crie `backend/.env` com os dados do seu banco e uma chave para os tokens. Use valores próprios; o arquivo é ignorado pelo Git:

   ```dotenv
   DB_NAME=nome_do_banco
   DB_USER=usuario_do_banco
   DB_PASSWORD=senha_do_banco
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=uma_chave_secreta_forte
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

3. Ainda em `backend/`, prepare as tabelas de pedidos e inicie a API:

   ```bash
   npm run preparar-pedidos
   npm run dev
   ```

   A API usa `http://localhost:3000` por padrão. Deixe esse terminal aberto.

4. No primeiro uso, depois que a API tiver iniciado e criado a tabela de usuários, defina `ADMIN_USERNAME` e `ADMIN_PASSWORD` no mesmo `backend/.env`. Em outro terminal, dentro de `backend/`, execute **uma vez**:

   ```bash
   npm run criar-usuario
   ```

5. Em outro terminal, instale e inicie a interface:

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

   Acesse `http://localhost:5173` e entre com o usuário criado. Se a API estiver em outro endereço, configure `VITE_API_URL` em `frontend/.env` com a URL base da API. Se o frontend estiver em outra origem, ajuste `FRONTEND_URL` no backend.

## API

`POST /login` recebe `username` e `senha` e devolve um token. As demais rotas abaixo exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Uso |
| --- | --- | --- |
| `GET` | `/clientes` | Listar clientes |
| `POST` | `/clientes` | Cadastrar cliente |
| `GET` | `/pedidos` | Listar pedidos ativos; aceita filtro `?status=pendente`, `atrasado` ou `concluido` |
| `GET` | `/pedidos/:id` | Consultar um pedido ativo |
| `POST` | `/pedidos` | Criar pedido e seus itens |
| `PATCH` | `/pedidos/:id/status` | Concluir ou reabrir pedido |
| `PATCH` | `/pedidos/:id/cancelar` | Cancelar pedido sem apagar os dados |

O corpo esperado para criar pedidos e as regras de validação estão em [`backend/PEDIDOS.md`](backend/PEDIDOS.md).

## Diagramas do projeto

Os diagramas registram os fluxos e a modelagem **proposta inicialmente** para o sistema. Para entender o banco em uso, consulte os modelos em [`backend/src/models/`](backend/src/models/): a implementação atual possui `Usuarios`, `Clientes`, `Pedidos` e `ItensPedido`. Os itens guardam nome e preço diretamente; a tabela `Produtos` mostrada nos diagramas ainda não existe no código.

### Casos de uso

![Diagrama de casos de uso do Ateliê Combina Analytics](Diagramas/Diagrama%20de%20Casos%20de%20Uso.jpg)

### Fluxo de usuário

![Fluxo de login e cadastro de pedidos e clientes](Diagramas/Diagrama%20de%20Fluxo%20de%20Usu%C3%A1rio.png)

### Modelo conceitual de dados

![Diagrama de entidades e relacionamentos conceitual](Diagramas/Modelo%20Conceitual%20DER.jpeg)

### Modelagem inicial do banco de dados

![Diagrama de modelagem inicial do banco de dados](Diagramas/Modelagem%20do%20Banco%20de%20Dados.jpeg)

## Verificação

Na pasta `backend/`, `npm test` executa os testes de regras e HTTP sem conectar ao banco. `npm run test:banco` executa os testes de integração com o PostgreSQL configurado. Na pasta `frontend/`, use `npm run build` para conferir a compilação e `npm run lint` para verificar o código.
