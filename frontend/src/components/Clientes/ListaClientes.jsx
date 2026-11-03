import { MapPin, Pencil, Phone, ShoppingBag } from 'lucide-react';

function EditarCliente({ cliente, onEditar }) {
  return (
    <button type="button" onClick={() => onEditar(cliente)} aria-label={`Editar cliente ${cliente.nome} (prévia local)`} title="Editar cliente (prévia local)" className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[#683447] transition hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-[#A75870]">
      <Pencil aria-hidden="true" className="size-4" />
    </button>
  );
}

function NomeCliente({ cliente }) {
  return (
    <>
      <span className="break-words">{cliente.nome}</span>
      {cliente.previaLocal && <span className="ml-2 inline-block rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-normal text-[#754052]">Prévia local</span>}
    </>
  );
}

export default function ListaClientes({ clientes, totais, onEditar }) {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full table-fixed border-separate border-spacing-y-3 text-left text-sm">
          <caption className="sr-only">Clientes, telefones, cidades e total de pedidos não cancelados</caption>
          <thead className="text-xs text-gray-500">
            <tr>
              <th scope="col" className="w-[27%] px-4 font-semibold">Nome</th>
              <th scope="col" className="w-[24%] px-4 font-semibold">Telefone</th>
              <th scope="col" className="w-[25%] px-4 font-semibold">Cidade</th>
              <th scope="col" className="px-2 text-center font-semibold">Total de pedidos</th>
              <th scope="col" className="w-14"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="bg-[#EDADC3]">
                <th scope="row" className="rounded-l-md px-4 py-3 font-bold"><NomeCliente cliente={cliente} /></th>
                <td className="break-words px-4 py-3 font-normal">{cliente.telefone}</td>
                <td className="break-words px-4 py-3 font-normal">{cliente.cidade || 'Não informada'}</td>
                <td className="px-2 py-3 text-center">{totais.get(cliente.id) || 0}</td>
                <td className="rounded-r-md pr-2"><EditarCliente cliente={cliente} onEditar={onEditar} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {clientes.map((cliente) => (
          <article key={cliente.id} className="rounded-xl bg-[#EDADC3] p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="min-w-0 py-2 text-base"><NomeCliente cliente={cliente} /></h2>
              <EditarCliente cliente={cliente} onEditar={onEditar} />
            </div>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex items-center gap-2"><dt><Phone aria-hidden="true" className="size-4 text-[#754052]" /><span className="sr-only">Telefone</span></dt><dd className="break-all font-normal">{cliente.telefone}</dd></div>
              <div className="flex items-start gap-2"><dt><MapPin aria-hidden="true" className="size-4 text-[#754052]" /><span className="sr-only">Cidade</span></dt><dd className="min-w-0 break-words font-normal">{cliente.cidade || 'Cidade não informada'}</dd></div>
              <div className="flex items-center gap-2"><dt><ShoppingBag aria-hidden="true" className="size-4 text-[#754052]" /><span className="sr-only">Total de pedidos</span></dt><dd className="font-normal">{totais.get(cliente.id) || 0} pedidos</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
