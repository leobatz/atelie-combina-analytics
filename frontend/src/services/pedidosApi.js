import api from './api.js';

export async function listarPedidos(signal) {
  const { data } = await api.get('/pedidos', { signal });
  return data;
}

export async function buscarPedido(id, signal) {
  const { data } = await api.get(`/pedidos/${id}`, { signal });
  return data;
}

export async function criarPedido(pedido) {
  const { data } = await api.post('/pedidos', pedido);
  return data;
}

export async function editarPedido(id, pedido) {
  const { data } = await api.patch(`/pedidos/${id}`, pedido);
  return data;
}

export async function deletarPedido(id) {
  await api.delete(`/pedidos/${id}`);
}

export async function atualizarStatusPedido(id, status) {
  const { data } = await api.patch(`/pedidos/${id}/status`, { status });
  return data;
}

export async function cancelarPedido(id) {
  await api.patch(`/pedidos/${id}/cancelar`);
}
