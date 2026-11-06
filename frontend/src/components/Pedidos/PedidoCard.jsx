import { Package } from 'lucide-react';
import { formatarData, formatarMoeda } from '../../utils/pedidos.js';

export default function PedidoCard({ pedido, onDetalhes, onCancelar }) {
  return (
    <article className="rounded-xl bg-[#EDA3BC] p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-lg bg-white p-2 text-[#E47798]">
            <Package aria-hidden="true" className="size-6" />
          </div>
          <div className="min-w-0">
            <h2 className="break-words font-bold text-black">{pedido.cliente.nome}</h2>
            <p className="text-xs text-black">{pedido.cliente.telefone}</p>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => onDetalhes(pedido)}
            aria-label={`Ver detalhes do pedido ${pedido.id}`}
            className="min-h-11 flex-1 rounded-md bg-[#E47798] px-4 py-1.5 text-xs font-medium text-white transition hover:brightness-95 sm:min-h-0 sm:flex-none"
          >
            Detalhes
          </button>
          <button
            type="button"
            onClick={() => onCancelar(pedido)}
            aria-label={`Cancelar pedido ${pedido.id}`}
            className="min-h-11 flex-1 rounded-md bg-white px-4 py-1.5 text-xs font-medium text-red-600 transition hover:brightness-95 sm:min-h-0 sm:flex-none"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs text-[#512337]">
        {pedido.itens.map((item) => (
          <div key={item.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span className="min-w-0 break-words uppercase">{item.nome}</span>
            <span className="inline-flex shrink-0 items-baseline gap-3 whitespace-nowrap">
              <span>{item.quantidade} UN</span>
              <span>{formatarMoeda(item.precoUnitario)}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-black">
        <span className="text-xs">Entrega: {formatarData(pedido.dataEntrega)}</span>
        <p className="ml-auto font-bold">Total: {formatarMoeda(pedido.valorTotal)}</p>
      </div>
    </article>
  );
}
