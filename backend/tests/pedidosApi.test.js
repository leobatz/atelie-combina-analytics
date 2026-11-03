import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import database from '../src/config/database.js';

let server;
let url;
// Estes testes não abrem conexão com o banco nem usam credenciais reais.
const segredoAnterior = process.env.JWT_SECRET;
let token;

before(async () => {
    process.env.JWT_SECRET = 'segredo-exclusivo-dos-testes-locais';
    token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
    url = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (segredoAnterior === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = segredoAnterior;
    await new Promise((resolve) => server.close(resolve));
    await database.close();
});

test('todas as rotas de pedidos e clientes exigem autenticação', async () => {
    for (const [method, caminho] of [
        ['GET', '/pedidos'], ['GET', '/pedidos/1'], ['POST', '/pedidos'],
        ['PATCH', '/pedidos/1/status'], ['PATCH', '/pedidos/1/cancelar'],
        ['GET', '/clientes'], ['POST', '/clientes'],
    ]) {
        const resposta = await fetch(url + caminho, { method });
        assert.equal(resposta.status, 401, `${method} ${caminho}`);
        await resposta.json();
    }
});

test('token inválido é recusado', async () => {
    const resposta = await fetch(url + '/pedidos', { headers: { Authorization: 'Bearer invalido' } });
    assert.equal(resposta.status, 401);
    await resposta.json();
});

test('com token válido, erros de entrada retornam 400 antes de consultar o banco', async () => {
    for (const [method, caminho, body] of [
        ['POST', '/pedidos', {}], ['POST', '/clientes', { nome: '', telefone: '123' }],
        ['PATCH', '/pedidos/1/status', { status: 'atrasado' }],
        ['PATCH', '/pedidos/0/cancelar'], ['GET', '/pedidos/abc'], ['GET', '/pedidos?status=inexistente'],
    ]) {
        const resposta = await fetch(url + caminho, {
            method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
        assert.equal(resposta.status, 400, `${method} ${caminho}`);
        assert.equal(typeof (await resposta.json()).message, 'string');
    }
});

test('JSON inválido retorna mensagem utilizável pelo frontend', async () => {
    const resposta = await fetch(url + '/pedidos', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{',
    });
    assert.equal(resposta.status, 400);
    assert.equal((await resposta.json()).message, 'JSON inválido.');
});

test('preflight autoriza a origem do frontend e o header de token', async () => {
    const resposta = await fetch(url + '/pedidos', {
        method: 'OPTIONS', headers: {
            Origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'authorization,content-type',
        },
    });
    assert.equal(resposta.status, 204);
    assert.equal(resposta.headers.get('access-control-allow-origin'), process.env.FRONTEND_URL || 'http://localhost:5173');
    assert.match(resposta.headers.get('access-control-allow-headers'), /authorization/);
});
