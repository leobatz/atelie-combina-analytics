import test from 'node:test';
import assert from 'node:assert/strict';
import { hojeBrasil, statusAtual, validarCliente, validarId, validarPedido } from '../src/services/pedidoService.js';

const pedidoValido = (alteracoes = {}) => ({
    cliente: { nome: ' Ana ', telefone: '(47) 91234-5678' },
    dataEntrega: '2026-11-20',
    itens: [{ nome: ' Toalha ', quantidade: 3, precoUnitario: '10.90' }],
    ...alteracoes,
});

test('calcula o total no servidor e ignora um total forjado pelo cliente', () => {
    const dados = validarPedido(pedidoValido({ valorTotal: '0.01' }));
    assert.equal(dados.valorTotal, '32.70');
    assert.equal(dados.cliente.nome, 'Ana');
    assert.equal(dados.itens[0].nome, 'Toalha');
});

test('soma em centavos e aceita vírgula no preço sem erros de ponto flutuante', () => {
    const dados = validarPedido(pedidoValido({
        itens: [
            { nome: 'A', quantidade: 3, precoUnitario: '0.10' },
            { nome: 'B', quantidade: 1, precoUnitario: '0,20' },
        ],
    }));
    assert.equal(dados.valorTotal, '0.50');
});

test('permite usar um cliente existente em vez de cadastrar outro', () => {
    const dados = validarPedido(pedidoValido({ cliente: undefined, clienteId: 5 }));
    assert.equal(dados.clienteId, 5);
    assert.equal(dados.cliente, undefined);
    assert.throws(() => validarPedido(pedidoValido({ clienteId: 5 })), { status: 400 });
});

test('rejeita datas inexistentes, quantidades inválidas, preços malformados e pedidos vazios', () => {
    for (const dataEntrega of ['2026-02-30', '20/11/2026', '', '0000-01-01', null]) {
        assert.throws(() => validarPedido(pedidoValido({ dataEntrega })), { status: 400 });
    }
    for (const quantidade of [0, -1, 0.5, true, 1000001]) {
        assert.throws(() => validarPedido(pedidoValido({ itens: [{ nome: 'A', quantidade, precoUnitario: 5 }] })), { status: 400 });
    }
    for (const precoUnitario of [-1, 'NaN', 'Infinity', '1.001', '', null, true]) {
        assert.throws(() => validarPedido(pedidoValido({ itens: [{ nome: 'A', quantidade: 1, precoUnitario }] })), { status: 400 });
    }
    assert.throws(() => validarPedido(pedidoValido({ itens: [] })), { status: 400 });
    assert.throws(() => validarPedido(pedidoValido({ itens: [null] })), { status: 400 });
    assert.throws(() => validarPedido(null), { status: 400 });
});

test('não permite ultrapassar a capacidade da coluna de total', () => {
    assert.throws(() => validarPedido(pedidoValido({
        itens: [{ nome: 'A', quantidade: 2, precoUnitario: '99999999.99' }],
    })), { status: 400 });
});

test('valida cliente e limites de IDs do PostgreSQL', () => {
    assert.throws(() => validarCliente({ nome: '', telefone: '123' }), { status: 400 });
    assert.throws(() => validarCliente({ nome: 'Ana', telefone: 'abc47912345678' }), { status: 400 });
    for (const id of [0, -1, 'abc', '1.5', 2147483648, null, [], {}]) assert.throws(() => validarId(id), { status: 400 });
    assert.equal(validarId('5'), 5);
});

test('atraso começa apenas no dia seguinte à entrega e não altera pedidos concluídos', () => {
    assert.equal(statusAtual({ status: 'pendente', dataEntrega: '2026-11-02' }, '2026-11-03'), 'atrasado');
    assert.equal(statusAtual({ status: 'pendente', dataEntrega: '2026-11-03' }, '2026-11-03'), 'pendente');
    assert.equal(statusAtual({ status: 'concluido', dataEntrega: '2026-11-01' }, '2026-11-03'), 'concluido');
    assert.equal(statusAtual({ status: 'atrasado', dataEntrega: '2026-11-04' }, '2026-11-03'), 'pendente');
});

test('usa a data de São Paulo, mesmo perto da virada do dia em UTC', () => {
    assert.equal(hojeBrasil(new Date('2026-11-03T01:00:00Z')), '2026-11-02');
    assert.equal(hojeBrasil(new Date('2026-11-03T03:00:00Z')), '2026-11-03');
});
