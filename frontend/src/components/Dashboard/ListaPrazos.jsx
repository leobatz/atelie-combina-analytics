import { Link } from 'react-router';
import { Circle, ShoppingBag } from 'lucide-react';
import { diasParaEntrega } from '../../utils/dashboard.js';
import { abasPedidos } from '../../utils/pedidos.js';

export default function ListaPrazos({ titulo, pedidos, hoje, status }) {
  const atrasados = status === 'atrasado';
  const borda = abasPedidos.find((aba) => aba.valor === status)?.borda || 'border-transparent';
  const ordenados = [...pedidos].sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega) || a.id - b.id);

  return (
    <section className={`flex h-full min-w-0 flex-col rounded-[24px] border-2 ${borda} bg-[#EDBDCE] p-4 sm:p-5`} aria-label={titulo}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold">{titulo}</h2>
        <span className="rounded-full bg-white/65 px-2 py-0.5 text-xs text-[#754052]">{pedidos.length}</span>
      </div>
      {ordenados.length ? (
        <ul className="space-y-2">
          {ordenados.slice(0, 6).map((pedido) => {
            const dias = diasParaEntrega(pedido.dataEntrega, hoje);
            const prazo = dias === 0 ? 'Hoje' : `${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`;
            return (
              <li key={pedido.id} className="flex items-center gap-2 rounded-md bg-[#fffafa] px-2 py-2.5 text-xs">
                <Circle aria-hidden="true" className="size-3 shrink-0 text-[#E47798]" />
                <span className="min-w-0 flex-1 truncate" title={`${pedido.cliente.nome} — pedido #${pedido.id}`}>{pedido.cliente.nome}</span>
                <span className={atrasados ? 'shrink-0 text-red-700' : 'shrink-0 text-[#9e3f60]'} aria-label={atrasados ? `${prazo} de atraso` : dias === 0 ? 'Entrega hoje' : `Entrega em ${prazo}`}>{prazo}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-[#754052]">
          <ShoppingBag aria-hidden="true" className="size-7 opacity-60" />
          <p className="text-xs font-normal">{atrasados ? 'Nenhum pedido atrasado.' : 'Nenhum pedido pendente.'}</p>
        </div>
      )}
      <Link to={`/pedidos?status=${status}`} className="mt-auto pt-4 text-center text-xs text-[#754052] underline underline-offset-4">Ver todos os pedidos</Link>
    </section>
  );
}
