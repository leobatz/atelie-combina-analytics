import api from './api.js';

export async function listarClientes(signal) {
  const { data } = await api.get('/clientes', { signal });
  return data;
}

export async function criarCliente(cliente) {
  // A API atual persiste somente nome e telefone.
  const { data } = await api.post('/clientes', { nome: cliente.nome, telefone: cliente.telefone });
  return data;
}
