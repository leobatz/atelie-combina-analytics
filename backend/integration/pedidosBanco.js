import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import database from '../src/config/database.js';
import { Clientes, Pedidos } from '../src/models/relacionamentos.js';
import { hojeBrasil } from '../src/services/pedidoService.js';

// Executado apenas por npm run test:banco. Todos os registros ficam numa
// transação revertida ao final, inclusive quando uma asserção falha.
test('fluxo HTTP completo usando o Postgres real, com rollback dos dados de teste', async (t) => {
    let server;
    let transaction;
    database.options.logging = false;
    try {
        await database.authenticate();
        assert.ok(process.env.JWT_SECRET, 'JWT_SECRET precisa estar configurado.');
        transaction = await database.transaction();

        // As transações de cada controller participam da transação externa do teste.
        // As consultas GET também enxergam os registros ainda não confirmados.
        t.mock.method(database, 'transaction', async (callback) => callback(transaction));
        for (const model of [Clientes, Pedidos]) {
            model.addHook('beforeFind', 'transacaoDoTeste', (options) => { options.transaction = transaction; });
        }

        await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
        const base = `http://127.0.0.1:${server.address().port}`;
        const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1m' });
        async function chamar(method, caminho, body) {
            const resposta = await fetch(base + caminho, {
                method,
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                ...(body ? { body: JSON.stringify(body) } : {}),
            });
            return { status: resposta.status, dados: await resposta.json() };
        }

        const criado = await chamar('POST', '/pedidos', {
            cliente: { nome: 'Cliente temporário do teste automatizado', telefone: '(47) 91234-5678' },
            dataEntrega: hojeBrasil(),
            observacoes: 'Registro revertido ao final da transação de teste.',
            itens: [{ nome: 'Item temporário', quantidade: 3, precoUnitario: '10.90' }],
            valorTotal: '0.01',
        });
        assert.equal(criado.status, 201, JSON.stringify(criado.dados));
        const id = criado.dados.id;
        assert.equal(criado.dados.valorTotal, '32.70');
        assert.equal(criado.dados.status, 'pendente');
        assert.equal(criado.dados.itens.length, 1);
        assert.equal(criado.dados.itens[0].pedidoId, id);
        assert.equal(criado.dados.cliente.id, criado.dados.clienteId);

        const detalhe = await chamar('GET', `/pedidos/${id}`);
        assert.equal(detalhe.status, 200);
        assert.equal(detalhe.dados.id, id);
        const lista = await chamar('GET', '/pedidos?status=pendente');
        assert.equal(lista.status, 200);
        assert.ok(lista.dados.some((pedido) => pedido.id === id));
        const clientes = await chamar('GET', '/clientes');
        assert.equal(clientes.status, 200);
        assert.ok(clientes.dados.some((cliente) => cliente.id === criado.dados.clienteId));

        const concluido = await chamar('PATCH', `/pedidos/${id}/status`, { status: 'concluido' });
        assert.equal(concluido.status, 200);
        assert.equal(concluido.dados.status, 'concluido');
        const reaberto = await chamar('PATCH', `/pedidos/${id}/status`, { status: 'pendente' });
        assert.equal(reaberto.status, 200);
        assert.equal(reaberto.dados.status, 'pendente');
        const cancelado = await chamar('PATCH', `/pedidos/${id}/cancelar`);
        assert.equal(cancelado.status, 200);
        assert.equal((await chamar('GET', `/pedidos/${id}`)).status, 404);
        assert.equal((await chamar('GET', '/pedidos')).dados.some((pedido) => pedido.id === id), false);
        const preservado = await Pedidos.findByPk(id, { transaction });
        assert.ok(preservado.canceladoEm, 'Cancelamento deve preservar o registro.');

        const reutilizado = await chamar('POST', '/pedidos', {
            clienteId: criado.dados.clienteId,
            dataEntrega: '2000-01-01',
            itens: [{ nome: 'Outro item temporário', quantidade: 1, precoUnitario: '5.00' }],
        });
        assert.equal(reutilizado.status, 201);
        assert.equal(reutilizado.dados.cliente.id, criado.dados.clienteId);
        assert.equal(reutilizado.dados.status, 'atrasado');
    } finally {
        if (server) await new Promise((resolve) => server.close(resolve));
        for (const model of [Clientes, Pedidos]) model.removeHook('beforeFind', 'transacaoDoTeste');
        if (transaction && !transaction.finished) await transaction.rollback();
        await database.close();
    }
});
