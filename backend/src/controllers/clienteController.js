import { Clientes } from '../models/relacionamentos.js';
import { validarCliente } from '../services/pedidoService.js';

export async function listarClientes(req, res) {
    const clientes = await Clientes.findAll({ order: [['nome', 'ASC']] });
    res.json(clientes);
}

export async function criarCliente(req, res) {
    const dados = validarCliente(req.body);
    const cliente = await Clientes.create(dados);
    res.status(201).json(cliente);
}
