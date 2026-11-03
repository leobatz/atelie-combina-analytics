# Pedidos: organização e uso

O fluxo usa Express + Sequelize + PostgreSQL. O frontend continua usando a instância Axios de `frontend/src/services/api.js`, que já envia o JWT e redireciona para o login quando ele expira.

## Arquivos e responsabilidades

- `src/models/Clientes.js`: nome e telefone do cliente.
- `src/models/Pedidos.js`: cliente, data de entrega, status, observações, valor total e data de cancelamento.
- `src/models/ItensPedido.js`: descrição, quantidade e preço unitário de cada item. O Sequelize cria a tabela `ItensPedidos`.
- `src/models/relacionamentos.js`: centraliza as associações e carrega os models antes de sincronizar o banco.
- `src/services/pedidoService.js`: valida entradas, calcula o total em centavos e determina o atraso.
- `src/controllers/*Controller.js`: consultas e gravações, incluindo as transações.
- `src/routes/*Routes.js`: URLs, métodos HTTP e proteção pelo middleware existente `verificarToken`.
- `src/middlewares/tratarErro.js`: respostas de erro com `message`, sem enviar detalhes internos do banco ao navegador.
- `src/app.js`: configuração do Express e registro das rotas. Não inicia servidor nem conecta ao banco, permitindo testes isolados.
- `src/server.js`: conexão com o banco, sincronização e abertura da porta HTTP.

## Relacionamentos

`Clientes.id → Pedidos.clienteId`: um cliente pode ter vários pedidos. O banco impede excluir um cliente ainda referenciado.

`Pedidos.id → ItensPedidos.pedidoId`: um pedido pode ter vários itens. Se um pedido for excluído diretamente no banco, seus itens acompanham a exclusão. A ação de cancelar da aplicação não exclui registros.

Não foi criado um vínculo artificial com `Usuarios`: o sistema tem um único operador e as rotas são protegidas por autenticação.

## Endpoints (todos exigem Authorization: Bearer TOKEN)

| Método | URL | Função |
| --- | --- | --- |
| GET | `/clientes` | Lista clientes para seleção no formulário |
| POST | `/clientes` | Cadastra um cliente com nome e telefone |
| GET | `/pedidos` | Lista pedidos ativos com cliente e itens |
| GET | `/pedidos?status=atrasado` | Filtra por pendente, atrasado ou concluido |
| GET | `/pedidos/:id` | Consulta detalhes |
| POST | `/pedidos` | Cria pedido e itens; pode cadastrar um novo cliente |
| PATCH | `/pedidos/:id/status` | Conclui ou reabre com `{ "status": "concluido" }` ou `pendente` |
| PATCH | `/pedidos/:id/cancelar` | Preenche canceladoEm e retira da lista ativa |

Exemplo de corpo para POST `/pedidos`:

```json
{
  "cliente": { "nome": "Ana", "telefone": "(47) 91234-5678" },
  "dataEntrega": "2026-12-20",
  "observacoes": "Embalar para presente",
  "itens": [
    { "nome": "Toalha personalizada", "quantidade": 3, "precoUnitario": "10.90" }
  ]
}
```

Para reutilizar um cliente, substitua `cliente` por `"clienteId": 1`. Não envie ambos. O total é calculado pelo backend, independentemente de qualquer valor enviado pelo navegador. Preços são armazenados em DECIMAL e retornam como strings.

## Regras

- Pedido vencido significa data de entrega anterior ao dia atual em America/Sao_Paulo. Entrega para hoje permanece pendente.
- O atraso é calculado em cada consulta; o status persistido pode continuar pendente. Não depende de cron e não modifica o banco durante um GET.
- Concluídos permanecem concluídos mesmo depois do prazo. Ao reabrir um pedido vencido, ele volta para atrasados.
- Cancelamentos são lógicos: cliente, pedido e itens permanecem no banco, mas o pedido deixa de aparecer nas abas e no endpoint de detalhes ativo. Não há tela de recuperação de cancelados nesta versão.
- A criação usa uma transação: novo cliente, pedido e itens são confirmados juntos, ou todos são revertidos.
- Quantidade inteira positiva, data real, telefone com DDD, pelo menos um item e preços com no máximo duas casas decimais são validados no backend.

## Executar

Na pasta `backend`:

```powershell
npm run preparar-pedidos
npm run dev
```

O primeiro comando cria tabelas ausentes, adiciona canceladoEm se necessário e estabelece chaves estrangeiras em tabelas já existentes. Pode ser executado novamente. Não usa sync com force/alter e não apaga dados. Relacionamentos inválidos existentes causam erro e rollback para serem corrigidos conscientemente.

O backend usa o `.env` existente: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT e JWT_SECRET. FRONTEND_URL é opcional (padrão http://localhost:5173); PORT é opcional (padrão 3000). Nenhuma chave do Supabase é necessária no frontend.

Na pasta `frontend`, execute `npm run dev`, faça login e abra `/pedidos`.

## Verificação

`npm test` executa os testes de regras e HTTP sem conexão com o banco. `npm run test:banco` executa o fluxo completo contra o banco configurado: criar, listar, detalhar, concluir, reabrir, cancelar e reutilizar cliente. Os registros temporários ficam em uma transação revertida ao final, inclusive em falhas. Sequências de IDs do PostgreSQL podem avançar mesmo com rollback.

Na interface, foram adicionados estados de carregamento e erro, atualização da lista, formulário com vários itens, detalhes e confirmação de cancelamento. As janelas usam dialog nativo, com foco contido e fechamento por Escape quando nenhuma gravação está em andamento.
