import HttpError from '../utils/HttpError.js';

const MAX_CENTAVOS = 9999999999; // Limite de DECIMAL(10, 2).
export const statusPedidos = ['pendente', 'atrasado', 'concluido'];

export function validarObjeto(valor) {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
        throw new HttpError(400, 'Envie os dados em um objeto JSON.');
    }
}

export function validarId(valor) {
    if (!['string', 'number'].includes(typeof valor) || !/^\d+$/.test(String(valor)) || !Number.isSafeInteger(Number(valor)) || Number(valor) < 1 || Number(valor) > 2147483647) {
        throw new HttpError(400, 'Identificador inválido.');
    }
    return Number(valor);
}

function texto(valor, campo, tamanho, obrigatorio = true) {
    if (typeof valor !== 'string' || (obrigatorio && !valor.trim()) || valor.trim().length > tamanho) {
        throw new HttpError(400, `${campo}: informe um texto de até ${tamanho} caracteres.`);
    }
    return valor.trim();
}

export function validarCliente(dados) {
    validarObjeto(dados);
    const nome = texto(dados.nome, 'Nome do cliente', 150);
    const telefone = texto(dados.telefone, 'Telefone', 30);
    if (!/^[\d\s()+.-]+$/.test(telefone) || !/^\d{10,15}$/.test(telefone.replace(/\D/g, ''))) {
        throw new HttpError(400, 'Informe um telefone válido com DDD.');
    }
    return { nome, telefone };
}

function validarData(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        throw new HttpError(400, 'Informe a data de entrega no formato AAAA-MM-DD.');
    }
    const data = new Date(`${valor}T12:00:00Z`);
    if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor || valor < '1900-01-01') {
        throw new HttpError(400, 'Data de entrega inválida.');
    }
    return valor;
}

function paraCentavos(valor) {
    if (!['number', 'string'].includes(typeof valor) || !/^\d{1,8}([.,]\d{1,2})?$/.test(String(valor))) {
        throw new HttpError(400, 'O preço deve ser positivo ou zero e ter no máximo duas casas decimais.');
    }
    const [inteiro, decimal = ''] = String(valor).replace(',', '.').split('.');
    return Number(inteiro) * 100 + Number(decimal.padEnd(2, '0'));
}

export function validarPedido(dados) {
    validarObjeto(dados);
    const dataEntrega = validarData(dados.dataEntrega);
    const observacoes = dados.observacoes == null ? null : texto(dados.observacoes, 'Observações', 5000, false);

    if ((dados.clienteId != null) === (dados.cliente != null)) {
        throw new HttpError(400, 'Selecione um cliente existente ou informe um novo cliente.');
    }
    const cliente = dados.clienteId != null
        ? { clienteId: validarId(dados.clienteId) }
        : { cliente: validarCliente(dados.cliente) };

    if (!Array.isArray(dados.itens) || dados.itens.length === 0 || dados.itens.length > 100) {
        throw new HttpError(400, 'Informe entre 1 e 100 itens para o pedido.');
    }

    let totalCentavos = 0;
    const itens = dados.itens.map((item) => {
        validarObjeto(item);
        const nome = texto(item.nome, 'Nome do item', 200);
        const quantidade = Number(item.quantidade);
        if (!['string', 'number'].includes(typeof item.quantidade) || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 1000000) {
            throw new HttpError(400, 'A quantidade deve ser um inteiro entre 1 e 1.000.000.');
        }
        const centavos = paraCentavos(item.precoUnitario);
        totalCentavos += quantidade * centavos;
        return { nome, quantidade, precoUnitario: (centavos / 100).toFixed(2) };
    });

    if (totalCentavos > MAX_CENTAVOS) {
        throw new HttpError(400, 'O total do pedido excede R$ 99.999.999,99.');
    }
    // O total enviado pelo navegador nunca é usado como fonte de verdade.
    return { ...cliente, dataEntrega, observacoes, itens, valorTotal: (totalCentavos / 100).toFixed(2) };
}

export function hojeBrasil(agora = new Date()) {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(agora);
    const obter = (tipo) => partes.find((parte) => parte.type === tipo).value;
    return `${obter('year')}-${obter('month')}-${obter('day')}`;
}

export function statusAtual(pedido, hoje = hojeBrasil()) {
    if (pedido.status === 'concluido') return 'concluido';
    return pedido.dataEntrega < hoje ? 'atrasado' : 'pendente';
}

export function apresentarPedido(model) {
    const pedido = model.toJSON();
    return { ...pedido, status: statusAtual(pedido) };
}
