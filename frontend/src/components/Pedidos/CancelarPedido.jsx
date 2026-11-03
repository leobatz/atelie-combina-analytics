import { useState } from 'react';
import { cancelarPedido } from '../../services/pedidosApi.js';
import { mensagemErro } from '../../utils/pedidos.js';
import Modal from '../Modal.jsx';

export default function CancelarPedido({ pedido, onFechar, onCancelado }) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function confirmar() {
    if (salvando) return;
    setSalvando(true);
    setErro('');
    try {
      await cancelarPedido(pedido.id);
      onCancelado(pedido.id);
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível cancelar o pedido.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal titulo="Cancelar pedido" onFechar={onFechar} ocupado={salvando}>
      <p className="break-words font-normal">Deseja cancelar o pedido #{pedido.id} de {pedido.cliente.nome}? Ele deixará de aparecer na lista de pedidos.</p>
      {erro && <p role="alert" className="mt-4 text-sm text-red-700">{erro}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" disabled={salvando} onClick={onFechar} className="rounded-lg border border-pink-200 px-4 py-3 disabled:opacity-50">Voltar</button>
        <button type="button" disabled={salvando} onClick={confirmar} className="rounded-lg bg-red-700 px-4 py-3 text-white disabled:opacity-50">{salvando ? 'Cancelando...' : 'Confirmar cancelamento'}</button>
      </div>
    </Modal>
  );
}
