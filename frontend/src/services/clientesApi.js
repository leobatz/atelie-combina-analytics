import api from './api.js';

export async function listarClientes(signal) {
  const { data } = await api.get('/clientes', { signal });
  return data;
}

export async function criarCliente(cliente) {
  const { data } = await api.post('/clientes', { nome: cliente.nome, telefone: cliente.telefone });
  return data.cliente;
}

export async function editarCliente(id, cliente) {
  const { data } = await api.patch(`/clientes/${id}`, { nome: cliente.nome, telefone: cliente.telefone });
  return data.atualizandoCliente;
}

export async function deletarCliente(id) {
  await api.delete(`/clientes/${id}`);
}
