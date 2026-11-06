import { Pencil, Phone, ShoppingBag, Trash2 } from 'lucide-react';

function AcoesCliente({ cliente, onEditar, onExcluir }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={() => onEditar(cliente)} aria-label={`Editar cliente ${cliente.nome}`} title="Editar cliente" className="flex size-10 items-center justify-center rounded-lg text-[#683447] hover:bg-white/50">
        <Pencil aria-hidden="true" className="size-4" />
      </button>
      <button type="button" onClick={() => onExcluir(cliente)} aria-label={`Excluir cliente ${cliente.nome}`} title="Excluir cliente" className="flex size-10 items-center justify-center rounded-lg text-red-700 hover:bg-white/50">
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

export default function ListaClientes({ clientes, totais, onEditar, onExcluir }) {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full table-fixed border-separate border-spacing-y-3 text-left text-sm">
          <caption className="sr-only">Clientes, telefones e total de pedidos não cancelados</caption>
          <thead className="text-xs text-gray-500">
            <tr>
              <th scope="col" className="w-[35%] px-4 font-semibold">Nome</th>
              <th scope="col" className="w-[30%] px-4 font-semibold">Telefone</th>
              <th scope="col" className="px-2 text-center font-semibold">Total de pedidos</th>
              <th scope="col" className="w-24"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="bg-[#EDADC3]">
                <th scope="row" className="break-words rounded-l-md px-4 py-3 font-bold">{cliente.nome}</th>
                <td className="break-words px-4 py-3 font-normal">{cliente.telefone}</td>
                <td className="px-2 py-3 text-center">{totais.get(cliente.id) || 0}</td>
                <td className="rounded-r-md pr-2"><AcoesCliente cliente={cliente} onEditar={onEditar} onExcluir={onExcluir} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {clientes.map((cliente) => (
          <article key={cliente.id} className="rounded-xl bg-[#EDADC3] p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="min-w-0 break-words py-2 text-base">{cliente.nome}</h2>
              <AcoesCliente cliente={cliente} onEditar={onEditar} onExcluir={onExcluir} />
            </div>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex items-center gap-2"><dt><Phone aria-hidden="true" className="size-4 text-[#754052]" /><span className="sr-only">Telefone</span></dt><dd className="break-all font-normal">{cliente.telefone}</dd></div>
              <div className="flex items-center gap-2"><dt><ShoppingBag aria-hidden="true" className="size-4 text-[#754052]" /><span className="sr-only">Total de pedidos</span></dt><dd className="font-normal">{totais.get(cliente.id) || 0} pedidos</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
