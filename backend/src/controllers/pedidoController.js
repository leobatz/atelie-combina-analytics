import database from '../config/database.js';
import { Clientes, Pedidos, ItensPedido } from '../models/relacionamentos.js';
import { apresentarPedido, statusPedidos, validarId, validarObjeto, validarPedido } from '../services/pedidoService.js';
import HttpError from '../utils/HttpError.js';

const include = [
    { model: Clientes, as: 'cliente', attributes: ['id', 'nome', 'telefone'] },
    { model: ItensPedido, as: 'itens' },
];

async function buscarAtivo(id, opcoes = {}) {
    const pedido = await Pedidos.findByPk(id, opcoes);
    if (!pedido || pedido.canceladoEm) throw new HttpError(404, 'Pedido não encontrado.');
    return pedido;
}

export async function listarPedidos(req, res) {
    const { status } = req.query;
    if (status !== undefined && !statusPedidos.includes(status)) {
        throw new HttpError(400, 'Status de pedido inválido.');
    }
    const pedidos = await Pedidos.findAll({
        where: { canceladoEm: null }, include,
        order: [['dataEntrega', 'ASC'], ['id', 'DESC'], [{ model: ItensPedido, as: 'itens' }, 'id', 'ASC']],
    });
    const resultado = pedidos.map(apresentarPedido);
    res.json(status ? resultado.filter((pedido) => pedido.status === status) : resultado);
}

export async function detalharPedido(req, res) {
    const id = validarId(req.params.id);
    const pedido = await buscarAtivo(id, { include });
    res.json(apresentarPedido(pedido));
}

export async function criarPedido(req, res) {
    const dados = validarPedido(req.body);
    const pedido = await database.transaction(async (transaction) => {
        let cliente;
        if (dados.clienteId) {
            cliente = await Clientes.findByPk(dados.clienteId, { transaction });
            if (!cliente) throw new HttpError(404, 'Cliente não encontrado.');
        } else {
            cliente = await Clientes.create(dados.cliente, { transaction });
        }

        const criado = await Pedidos.create({
            clienteId: cliente.id,
            dataEntrega: dados.dataEntrega,
            observacoes: dados.observacoes,
            valorTotal: dados.valorTotal,
        }, { transaction });

        await ItensPedido.bulkCreate(dados.itens.map((item) => ({ ...item, pedidoId: criado.id })), {
            transaction, validate: true,
        });
        return criado.reload({ include, transaction });
    });
    res.status(201).json(apresentarPedido(pedido));
}

export async function atualizarStatus(req, res) {
    const id = validarId(req.params.id);
    validarObjeto(req.body);
    if (!['pendente', 'concluido'].includes(req.body.status)) {
        throw new HttpError(400, 'Informe pendente ou concluido. Atraso é calculado pela data de entrega.');
    }
    const pedido = await database.transaction(async (transaction) => {
        const atual = await buscarAtivo(id, { transaction, lock: transaction.LOCK.UPDATE });
        await atual.update({ status: req.body.status }, { transaction });
        return atual.reload({ include, transaction });
    });
    res.json(apresentarPedido(pedido));
}

export async function cancelarPedido(req, res) {
    const id = validarId(req.params.id);
    await database.transaction(async (transaction) => {
        const pedido = await buscarAtivo(id, { transaction, lock: transaction.LOCK.UPDATE });
        await pedido.update({ canceladoEm: new Date() }, { transaction });
    });
    res.json({ message: 'Pedido cancelado. Os dados foram preservados no banco.' });
}
