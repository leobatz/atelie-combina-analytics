import { Clientes } from "../models/Relacionamentos.js";

//Função para listar clientes
export async function listarClientes(req, res) {
    try {
        const clientes = await Clientes.findAll();
        return res.status(200).json(clientes);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao listar clientes." });
    }
}

//Função para criar cliente
export async function criarCliente(req, res) {
  try {
    const { nome, telefone } = req.body;

    if (!nome && !telefone) {
      return res.status(400).json({ message: "Nome ou telefone indefinidos." });
    }

    const cliente = await Clientes.create({ nome, telefone });

    return res.status(201).json({ message: "Cliente criado com sucesso!", cliente });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao criar cliente." });
  }
}

//Função para editar cliente
export async function editarCliente(req, res) {
  try {
    const { id } = req.params;
    const { nome, telefone } = req.body;

    const atualizandoCliente = await Clientes.findByPk(id);

    if (!atualizandoCliente) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
    };

    atualizandoCliente.nome = nome;
    atualizandoCliente.telefone = telefone;

    await atualizandoCliente.save();

    return res.status(201).json({ message: 'Cliente atualizado com sucesso!', atualizandoCliente});

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao editar cliente." });
  }
}

//Função para deletar algum cliente
export async function deletarCliente(req, res) {
  try {
    const { id } = req.params;

    const cliente = await Clientes.findByPk(id);

    if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
    };

    await cliente.destroy();

    return res.status(201).json({ message: 'Cliente deletado com sucesso!', cliente});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao deletar cliente." });
  }
}