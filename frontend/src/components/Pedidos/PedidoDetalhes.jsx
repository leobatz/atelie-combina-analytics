import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { atualizarStatusPedido, buscarPedido } from '../../services/pedidosApi.js';
import { abasPedidos, formatarData, formatarMoeda, mensagemErro } from '../../utils/pedidos.js';
import Modal from '../Modal.jsx';

export default function PedidoDetalhes({ pedidoId, onFechar, onAtualizado }) {
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    buscarPedido(pedidoId, controller.signal)
      .then(setPedido)
      .catch((error) => {
        if (!controller.signal.aborted) setErro(mensagemErro(error, 'Não foi possível carregar o pedido.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });
    return () => controller.abort();
  }, [pedidoId]);

  async function alterarStatus() {
    if (salvando) return;
    setSalvando(true);
    setErro('');
    try {
      const atualizado = await atualizarStatusPedido(pedido.id, pedido.status === 'concluido' ? 'pendente' : 'concluido');
      onAtualizado(atualizado);
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível atualizar o pedido.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={`Pedido #${pedidoId}`} onFechar={onFechar} ocupado={salvando}>
      {carregando && <p role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Carregando...</p>}
      {erro && <p role="alert" className="mb-4 text-sm text-red-700">{erro}</p>}
      {pedido && (
        <div className="space-y-4">
          <div className="break-words">
            <h3 className="text-lg">{pedido.cliente.nome}</h3>
            <p className="text-sm font-normal">{pedido.cliente.telefone}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <p>Entrega: {formatarData(pedido.dataEntrega)}</p>
            <p>Status: {abasPedidos.find((aba) => aba.valor === pedido.status)?.nome}</p>
          </div>
          <ul className="divide-y divide-pink-200">
            {pedido.itens.map((item) => (
              <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span className="min-w-0 break-words">{item.nome}</span>
                <span className="ml-auto whitespace-nowrap font-normal">{item.quantidade} × {formatarMoeda(item.precoUnitario)}</span>
              </li>
            ))}
          </ul>
          {pedido.observacoes && <p className="whitespace-pre-wrap break-words text-sm font-normal"><strong>Observações:</strong> {pedido.observacoes}</p>}
          <p className="text-right">Total: {formatarMoeda(pedido.valorTotal)}</p>
          <button type="button" disabled={salvando} onClick={alterarStatus} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#A75870] p-3 text-white disabled:opacity-50">
            {salvando && <Loader2 className="size-4 animate-spin" />}
            {salvando ? 'Salvando...' : pedido.status === 'concluido' ? 'Reabrir pedido' : 'Concluir pedido'}
          </button>
        </div>
      )}
    </Modal>
  );
}
