import database from "../config/database.js";
import { Clientes, Pedidos, ItensPedido } from "../models/Relacionamentos.js";

const relacionamentos = [
  { model: Clientes, as: "cliente", attributes: ["id", "nome", "telefone"] },
  { model: ItensPedido, as: "itens" },
];

// Os auxiliares ficam neste arquivo para manter o controller independente.
function erroDaRequisicao(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validarId(valor) {
  if (
    !["number", "string"].includes(typeof valor) ||
    !/^\d+$/.test(String(valor)) ||
    Number(valor) < 1 ||
    Number(valor) > 2147483647
  ) {
    throw erroDaRequisicao(400, "Informe um ID válido.");
  }
  return Number(valor);
}

function validarStatus(status) {
  if (!["pendente", "concluido"].includes(status)) {
    throw erroDaRequisicao(400, "Informe pendente ou concluido. O atraso é calculado pela data de entrega.");
  }
  return status;
}

function validarItens(itens) {
  if (!Array.isArray(itens) || itens.length < 1 || itens.length > 100) {
    throw erroDaRequisicao(400, "O pedido deve ter entre 1 e 100 itens.");
  }

  let totalCentavos = 0;
  const itensValidados = itens.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw erroDaRequisicao(400, "Item de pedido inválido.");
    }
    const { nome, quantidade, precoUnitario } = item;

    if (typeof nome !== "string" || !nome.trim() || nome.trim().length > 200) {
      throw erroDaRequisicao(400, "Cada item precisa de um nome de até 200 caracteres.");
    }
    if (
      !["number", "string"].includes(typeof quantidade) ||
      !Number.isInteger(Number(quantidade)) ||
      Number(quantidade) < 1 ||
      Number(quantidade) > 1000000
    ) {
      throw erroDaRequisicao(400, "A quantidade deve ser um inteiro entre 1 e 1.000.000.");
    }
    if (
      !["number", "string"].includes(typeof precoUnitario) ||
      !/^\d{1,8}([.,]\d{1,2})?$/.test(String(precoUnitario))
    ) {
      throw erroDaRequisicao(400, "Informe um preço não negativo com até duas casas decimais.");
    }

    // Converte diretamente para centavos, sem multiplicar valores decimais.
    const [inteiro, decimal = ""] = String(precoUnitario).replace(",", ".").split(".");
    const centavos = Number(inteiro) * 100 + Number(decimal.padEnd(2, "0"));
    totalCentavos += centavos * Number(quantidade);

    return {
      nome: nome.trim(),
      quantidade: Number(quantidade),
      precoUnitario: (centavos / 100).toFixed(2),
    };
  });

  if (totalCentavos > 9999999999) {
    throw erroDaRequisicao(400, "O total não pode ultrapassar R$ 99.999.999,99.");
  }

  return { itens: itensValidados, valorTotal: (totalCentavos / 100).toFixed(2) };
}

function validarDados(dados, parcial = false) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw erroDaRequisicao(400, "Envie os dados do pedido em JSON.");
  }

  const resultado = {};
  if (!parcial || dados.clienteId !== undefined) {
    resultado.clienteId = validarId(dados.clienteId);
  }
  if (!parcial || dados.dataEntrega !== undefined) {
    const { dataEntrega } = dados;
    const data = typeof dataEntrega === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dataEntrega)
      ? new Date(dataEntrega + "T12:00:00Z")
      : new Date(NaN);
    if (
      Number.isNaN(data.getTime()) ||
      data.toISOString().slice(0, 10) !== dataEntrega ||
      dataEntrega < "1900-01-01"
    ) {
      throw erroDaRequisicao(400, "Informe uma data de entrega válida no formato AAAA-MM-DD.");
    }
    resultado.dataEntrega = dataEntrega;
  }
  if (dados.observacoes !== undefined) {
    if (dados.observacoes !== null && (typeof dados.observacoes !== "string" || dados.observacoes.length > 5000)) {
      throw erroDaRequisicao(400, "As observações devem ser um texto de até 5.000 caracteres ou null.");
    }
    resultado.observacoes = dados.observacoes === null ? null : dados.observacoes.trim();
  }
  if (dados.status !== undefined) resultado.status = validarStatus(dados.status);
  if (!parcial || dados.itens !== undefined) Object.assign(resultado, validarItens(dados.itens));
  if (parcial && Object.keys(resultado).length === 0) {
    throw erroDaRequisicao(400, "Informe ao menos um campo do pedido para editar.");
  }
  return resultado;
}

function apresentarPedido(model) {
  const pedido = model.toJSON();
  // Uma consulta não precisa alterar o banco para identificar pedidos vencidos.
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const obter = (tipo) => partes.find((parte) => parte.type === tipo).value;
  const hoje = obter("year") + "-" + obter("month") + "-" + obter("day");

  if (pedido.status !== "concluido") {
    pedido.status = pedido.dataEntrega < hoje ? "atrasado" : "pendente";
  }
  return pedido;
}

async function buscarPedidoAtivo(id, opcoes = {}) {
  const pedido = await Pedidos.findByPk(id, opcoes);
  if (!pedido || pedido.canceladoEm) {
    throw erroDaRequisicao(404, "Pedido não encontrado.");
  }
  return pedido;
}

async function verificarCliente(clienteId, transaction) {
  const cliente = await Clientes.findByPk(clienteId, { transaction });
  if (!cliente) throw erroDaRequisicao(404, "Cliente não encontrado.");
}

function responderErro(res, error, mensagem) {
  if (error.status) return res.status(error.status).json({ message: error.message });
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({ message: "Verifique os dados informados." });
  }
  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({ message: "O cliente informado não existe ou o registro está em uso." });
  }
  console.error(mensagem, error);
  return res.status(500).json({ message: mensagem });
}

// Lista pedidos ativos, acompanhados do cliente e dos itens.
export async function listarPedidos(req, res) {
  try {
    const status = req.query.status;
    if (status !== undefined && !["pendente", "atrasado", "concluido"].includes(status)) {
      throw erroDaRequisicao(400, "Status de pedido inválido.");
    }
    const pedidos = await Pedidos.findAll({
      where: { canceladoEm: null },
      include: relacionamentos,
      order: [
        ["dataEntrega", "ASC"], ["id", "DESC"],
        [{ model: ItensPedido, as: "itens" }, "id", "ASC"],
      ],
    });
    const resultado = pedidos.map(apresentarPedido);
    return res.status(200).json(status ? resultado.filter((pedido) => pedido.status === status) : resultado);
  } catch (error) {
    return responderErro(res, error, "Erro ao listar pedidos.");
  }
}

// Consulta um pedido específico com todos os seus itens.
export async function detalharPedido(req, res) {
  try {
    const id = validarId(req.params.id);
    const pedido = await buscarPedidoAtivo(id, {
      include: relacionamentos,
      order: [[{ model: ItensPedido, as: "itens" }, "id", "ASC"]],
    });
    return res.status(200).json(apresentarPedido(pedido));
  } catch (error) {
    return responderErro(res, error, "Erro ao consultar pedido.");
  }
}

// Cria o pedido primeiro e usa o ID gerado para cadastrar seus itens.
export async function criarPedido(req, res) {
  try {
    const { itens, ...dados } = validarDados(req.body);
    const pedidoCriado = await database.transaction(async (transaction) => {
      await verificarCliente(dados.clienteId, transaction);
      const pedido = await Pedidos.create(dados, { transaction });
      await ItensPedido.bulkCreate(
        itens.map((item) => ({ ...item, pedidoId: pedido.id })),
        { transaction, validate: true }
      );
      return pedido.reload({ include: relacionamentos, transaction });
    });
    return res.status(201).json(apresentarPedido(pedidoCriado));
  } catch (error) {
    return responderErro(res, error, "Erro ao criar pedido.");
  }
}

// Campos omitidos permanecem iguais. Se enviar itens, envie a lista completa.
export async function editarPedido(req, res) {
  try {
    const id = validarId(req.params.id);
    const { itens, ...dados } = validarDados(req.body, true);
    const pedidoAtualizado = await database.transaction(async (transaction) => {
      const pedido = await buscarPedidoAtivo(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (dados.clienteId !== undefined) await verificarCliente(dados.clienteId, transaction);

      await pedido.update(dados, { transaction });
      if (itens !== undefined) {
        // A lista substituta recebe novos IDs; itens de outros pedidos não são alterados.
        await ItensPedido.destroy({ where: { pedidoId: id }, transaction });
        await ItensPedido.bulkCreate(
          itens.map((item) => ({ ...item, pedidoId: id })),
          { transaction, validate: true }
        );
      }
      return pedido.reload({ include: relacionamentos, transaction });
    });
    return res.status(200).json(apresentarPedido(pedidoAtualizado));
  } catch (error) {
    return responderErro(res, error, "Erro ao editar pedido.");
  }
}

// Exclusão definitiva. Remove os itens explicitamente dentro da mesma transação.
export async function deletarPedido(req, res) {
  try {
    const id = validarId(req.params.id);
    await database.transaction(async (transaction) => {
      const pedido = await buscarPedidoAtivo(id, { transaction, lock: transaction.LOCK.UPDATE });
      await ItensPedido.destroy({ where: { pedidoId: id }, transaction });
      await pedido.destroy({ transaction });
    });
    return res.status(200).json({ message: "Pedido e itens excluídos com sucesso." });
  } catch (error) {
    return responderErro(res, error, "Erro ao excluir pedido.");
  }
}

// Mantém a rota já utilizada pelos botões de concluir/reabrir no frontend.
export async function atualizarStatus(req, res) {
  try {
    const id = validarId(req.params.id);
    const status = validarStatus(req.body?.status);
    const pedidoAtualizado = await database.transaction(async (transaction) => {
      const pedido = await buscarPedidoAtivo(id, { transaction, lock: transaction.LOCK.UPDATE });
      await pedido.update({ status }, { transaction });
      return pedido.reload({ include: relacionamentos, transaction });
    });
    return res.status(200).json(apresentarPedido(pedidoAtualizado));
  } catch (error) {
    return responderErro(res, error, "Erro ao atualizar status do pedido.");
  }
}

// Cancelamento não é exclusão: preserva pedido e itens, mas retira da lista ativa.
export async function cancelarPedido(req, res) {
  try {
    const id = validarId(req.params.id);
    await database.transaction(async (transaction) => {
      const pedido = await buscarPedidoAtivo(id, { transaction, lock: transaction.LOCK.UPDATE });
      await pedido.update({ canceladoEm: new Date() }, { transaction });
    });
    return res.status(200).json({ message: "Pedido cancelado com sucesso." });
  } catch (error) {
    return responderErro(res, error, "Erro ao cancelar pedido.");
  }
}
