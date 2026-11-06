import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Search, UsersRound } from 'lucide-react';
import ClienteForm from '../components/Clientes/ClienteForm.jsx';
import ListaClientes from '../components/Clientes/ListaClientes.jsx';
import ConfirmarExclusao from '../components/ConfirmarExclusao.jsx';
import EstadoPagina from '../components/EstadoPagina.jsx';
import { deletarCliente, listarClientes } from '../services/clientesApi.js';
import { listarPedidos } from '../services/pedidosApi.js';
import { contarPedidosPorCliente, normalizarBusca } from '../utils/dashboard.js';
import { mensagemErro } from '../utils/pedidos.js';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [atualizacao, setAtualizacao] = useState(0);
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(null);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([listarClientes(controller.signal), listarPedidos(controller.signal)])
      .then(([clientesRecebidos, pedidosRecebidos]) => {
        if (controller.signal.aborted) return;
        setClientes(clientesRecebidos);
        setPedidos(pedidosRecebidos);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setErro(mensagemErro(error, 'Não foi possível carregar os clientes. Verifique se o backend está rodando.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });
    return () => controller.abort();
  }, [atualizacao]);

  function recarregar() {
    setCarregando(true);
    setErro('');
    setAviso('');
    setAtualizacao((valor) => valor + 1);
  }

  function abrirModal(tipo, cliente = null) {
    setAviso('');
    setModal({ tipo, cliente });
  }

  function clienteSalvo(cliente, editando) {
    setClientes((anteriores) => [...anteriores.filter((atual) => atual.id !== cliente.id), cliente]);
    setModal(null);
    setAviso(editando ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.');
  }

  async function excluirCliente() {
    const id = modal.cliente.id;
    await deletarCliente(id);
    setClientes((anteriores) => anteriores.filter((cliente) => cliente.id !== id));
    setModal(null);
    setAviso('Cliente excluído com sucesso.');
  }

  const totais = contarPedidosPorCliente(pedidos);
  const termo = normalizarBusca(busca);
  const digitos = busca.replace(/\D/g, '');
  const filtrados = clientes.filter((cliente) =>
    normalizarBusca(cliente.nome).includes(termo)
    || normalizarBusca(cliente.telefone).includes(termo)
    || (digitos.length > 0 && /^[\d\s()+.-]+$/.test(busca) && cliente.telefone.replace(/\D/g, '').includes(digitos))
  ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <main className="min-w-0 flex-1 bg-[#f8f8f8] px-4 py-7 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-5xl">Clientes</h1>
            <p className="mt-2 text-sm font-normal text-gray-500">Sua agenda de contatos e pedidos em um só lugar.</p>
          </div>
          <button type="button" disabled={carregando || Boolean(erro)} onClick={() => abrirModal('formulario')} className="flex w-full items-center justify-center gap-3 rounded-md bg-[#E47798] px-5 py-2 text-sm text-white transition hover:brightness-95 disabled:opacity-50 sm:w-auto">
            Novo cliente <Plus aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Buscar cliente por nome ou telefone</span>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A75870]" />
            <input type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar nome ou telefone" className="w-full rounded-lg border border-pink-200 bg-white py-3 pl-10 pr-3 text-sm font-normal outline-[#A75870]" />
          </label>
          <button type="button" disabled={carregando} onClick={recarregar} className="flex items-center justify-center gap-2 rounded-lg p-3 text-sm text-[#A75870] hover:bg-pink-50 disabled:opacity-50"><RefreshCw aria-hidden="true" className="size-4" /> Atualizar</button>
        </div>

        <p role="status" className="mt-4 text-sm font-normal text-[#754052]">{aviso}</p>
        <EstadoPagina carregando={carregando} erro={erro} onTentarNovamente={recarregar}>
          <p className="mb-3 mt-4 text-xs font-normal text-gray-500">{filtrados.length} de {clientes.length} clientes · Totais de pedidos não cancelados</p>
          {filtrados.length ? (
            <ListaClientes clientes={filtrados} totais={totais} onEditar={(cliente) => abrirModal('formulario', cliente)} onExcluir={(cliente) => abrirModal('excluir', cliente)} />
          ) : (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-white px-4 py-14 text-center">
              <UsersRound aria-hidden="true" className="mx-auto mb-3 size-9 text-[#E47798]" />
              <h2 className="text-[#754052]">{clientes.length ? 'Nenhum cliente encontrado' : 'Sua lista de clientes começa aqui'}</h2>
              <p className="mt-2 text-sm font-normal text-gray-500">{clientes.length ? 'Experimente outro nome ou telefone.' : 'Clique em Novo cliente para cadastrar o primeiro contato.'}</p>
            </div>
          )}
        </EstadoPagina>
      </div>
      {modal?.tipo === 'formulario' && <ClienteForm cliente={modal.cliente} onFechar={() => setModal(null)} onSalvo={clienteSalvo} />}
      {modal?.tipo === 'excluir' && (
        <ConfirmarExclusao titulo="Excluir cliente" onFechar={() => setModal(null)} onConfirmar={excluirCliente}>
          Deseja excluir {modal.cliente.nome}? Esta ação é definitiva. Clientes vinculados a pedidos não podem ser excluídos.
        </ConfirmarExclusao>
      )}
    </main>
  );
}
