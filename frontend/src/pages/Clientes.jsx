import { useState } from 'react';
import { Plus, RefreshCw, Search, UsersRound } from 'lucide-react';
import ClienteForm from '../components/Clientes/ClienteForm.jsx';
import ListaClientes from '../components/Clientes/ListaClientes.jsx';
import EstadoPagina from '../components/EstadoPagina.jsx';
import useDadosComerciais from '../hooks/useDadosComerciais.js';
import { contarPedidosPorCliente, normalizarBusca } from '../utils/dashboard.js';

export default function Clientes() {
  const { clientes, pedidos, carregando, erro, recarregar, setClientes } = useDadosComerciais();
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(null);
  const [aviso, setAviso] = useState('');
  const totais = contarPedidosPorCliente(pedidos);
  const termo = normalizarBusca(busca);
  const digitos = busca.replace(/\D/g, '');
  const filtrados = clientes.filter((cliente) =>
    normalizarBusca(`${cliente.nome} ${cliente.telefone} ${cliente.cidade || ''}`).includes(termo)
    || (digitos.length > 0 && /^[\d\s()+.-]+$/.test(busca) && cliente.telefone.replace(/\D/g, '').includes(digitos))
  ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  function abrirFormulario(cliente = null) {
    setAviso('');
    setModal({ cliente });
  }

  function clienteSalvo(cliente, editando) {
    setClientes((anteriores) => [...anteriores.filter((atual) => atual.id !== cliente.id), cliente]);
    setModal(null);
    setAviso(editando ? 'Prévia de edição aplicada. As alterações não foram gravadas e serão descartadas ao sair ou atualizar a página.' : cliente.cidade ? 'Cliente cadastrado. A cidade está somente na prévia local.' : 'Cliente cadastrado com sucesso.');
  }

  return (
    <main className="min-w-0 flex-1 bg-[#f8f8f8] px-4 py-7 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-5xl">Clientes</h1>
            <p className="mt-2 text-sm font-normal text-gray-500">Sua agenda de contatos e pedidos em um só lugar.</p>
          </div>
          <button type="button" disabled={carregando || Boolean(erro)} onClick={() => abrirFormulario()} className="flex w-full items-center justify-center gap-3 rounded-md bg-[#E47798] px-5 py-2 text-sm text-white transition hover:brightness-95 disabled:opacity-50 sm:w-auto">
            Novo cliente <Plus aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Buscar cliente por nome, telefone ou cidade</span>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A75870]" />
            <input type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar nome, telefone ou cidade" className="w-full rounded-lg border border-pink-200 bg-white py-3 pl-10 pr-3 text-sm font-normal outline-[#A75870]" />
          </label>
          <button type="button" disabled={carregando} onClick={() => { setAviso(''); recarregar(); }} className="flex items-center justify-center gap-2 rounded-lg p-3 text-sm text-[#A75870] hover:bg-pink-50 disabled:opacity-50"><RefreshCw aria-hidden="true" className="size-4" /> Atualizar</button>
        </div>

        <p role="status" className="mt-4 text-sm font-normal text-[#754052]">{aviso}</p>
        <EstadoPagina carregando={carregando} erro={erro} onTentarNovamente={recarregar}>
          <p className="mb-3 mt-4 text-xs font-normal text-gray-500">{filtrados.length} de {clientes.length} clientes · Totais de pedidos não cancelados</p>
          {filtrados.length ? (
            <ListaClientes clientes={filtrados} totais={totais} onEditar={abrirFormulario} />
          ) : (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-white px-4 py-14 text-center">
              <UsersRound aria-hidden="true" className="mx-auto mb-3 size-9 text-[#E47798]" />
              <h2 className="text-[#754052]">{clientes.length ? 'Nenhum cliente encontrado' : 'Sua lista de clientes começa aqui'}</h2>
              <p className="mt-2 text-sm font-normal text-gray-500">{clientes.length ? 'Experimente outro nome, telefone ou cidade.' : 'Clique em Novo cliente para cadastrar o primeiro contato.'}</p>
            </div>
          )}
        </EstadoPagina>
      </div>
      {modal && <ClienteForm cliente={modal.cliente} onFechar={() => setModal(null)} onSalvo={clienteSalvo} />}
    </main>
  );
}
