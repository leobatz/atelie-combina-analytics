import { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { criarPedido } from '../../services/pedidosApi.js';
import { listarClientes } from '../../services/clientesApi.js';
import { formatarMoeda, mensagemErro } from '../../utils/pedidos.js';
import Modal from '../Modal.jsx';

const campo = 'mt-1 w-full min-w-0 rounded-lg border border-pink-200 bg-white p-2.5 font-normal focus:outline-2 focus:outline-[#A75870]';
const itemVazio = (chave) => ({ chave, nome: '', quantidade: '1', precoUnitario: '' });

export default function PedidoForm({ onFechar, onSalvo }) {
  const [clientes, setClientes] = useState([]);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [erroClientes, setErroClientes] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState([itemVazio(1)]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const proximaChave = useRef(2);

  useEffect(() => {
    const controller = new AbortController();
    listarClientes(controller.signal)
      .then(setClientes)
      .catch((error) => {
        if (!controller.signal.aborted) setErroClientes(mensagemErro(error, 'Não foi possível carregar os clientes. Feche e abra o formulário para tentar novamente.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregandoClientes(false);
      });
    return () => controller.abort();
  }, []);

  function alterarItem(chave, propriedade, valor) {
    setItens((anteriores) => anteriores.map((item) => item.chave === chave ? { ...item, [propriedade]: valor } : item));
  }

  function adicionarItem() {
    const novo = itemVazio(proximaChave.current++);
    setItens((anteriores) => [...anteriores, novo]);
  }

  async function salvar(event) {
    event.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setErro('');
    try {
      const pedido = await criarPedido({
        ...(clienteId ? { clienteId: Number(clienteId) } : { cliente: { nome, telefone } }),
        dataEntrega,
        observacoes,
        itens: itens.map(({ nome, quantidade, precoUnitario }) => ({ nome, quantidade: Number(quantidade), precoUnitario })),
      });
      onSalvo(pedido);
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível salvar o pedido. Tente novamente.'));
    } finally {
      setSalvando(false);
    }
  }

  const totalCentavos = itens.reduce((total, item) => {
    const preco = Math.round(Number(item.precoUnitario.replace(',', '.')) * 100);
    const quantidade = Number(item.quantidade);
    return total + (Number.isFinite(preco) && Number.isFinite(quantidade) ? preco * quantidade : 0);
  }, 0);

  return (
    <Modal titulo="Novo pedido" onFechar={onFechar} ocupado={salvando}>
      <form onSubmit={salvar} className="space-y-4">
        <fieldset disabled={salvando} className="min-w-0 space-y-4 disabled:opacity-60">
          <label className="block text-sm">
            Cliente
            <select value={clienteId} onChange={(event) => setClienteId(event.target.value)} disabled={carregandoClientes} className={campo}>
              <option value="">{carregandoClientes ? 'Carregando clientes...' : 'Cadastrar novo cliente'}</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome} — {cliente.telefone}</option>
              ))}
            </select>
          </label>
          {erroClientes && <p role="alert" className="text-sm text-red-700">{erroClientes}</p>}

          {!clienteId && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="min-w-0 text-sm">Nome do cliente
                <input required maxLength={150} value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" className={campo} />
              </label>
              <label className="min-w-0 text-sm">Telefone com DDD
                <input required type="tel" maxLength={30} value={telefone} onChange={(event) => setTelefone(event.target.value)} autoComplete="tel" placeholder="(47) 91234-5678" className={campo} />
              </label>
            </div>
          )}

          <label className="block text-sm">Data de entrega
            <input required type="date" min="1900-01-01" max="9999-12-31" value={dataEntrega} onChange={(event) => setDataEntrega(event.target.value)} className={campo} />
          </label>

          <fieldset className="min-w-0 space-y-3">
            <legend className="mb-2 text-sm">Itens do pedido</legend>
            {itens.map((item, indice) => (
              <div key={item.chave} className="rounded-xl border border-pink-200 bg-pink-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm">Item {indice + 1}</span>
                  <button type="button" disabled={itens.length === 1} onClick={() => setItens((anteriores) => anteriores.filter((atual) => atual.chave !== item.chave))} aria-label={`Remover item ${indice + 1}`} className="rounded-md p-2 text-red-700 hover:bg-pink-100 disabled:opacity-30">
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
                <label className="block text-sm">Descrição
                  <input required maxLength={200} value={item.nome} onChange={(event) => alterarItem(item.chave, 'nome', event.target.value)} className={campo} />
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="min-w-0 text-sm">Quantidade
                    <input required type="number" min="1" max="1000000" step="1" value={item.quantidade} onChange={(event) => alterarItem(item.chave, 'quantidade', event.target.value)} className={campo} />
                  </label>
                  <label className="min-w-0 text-sm">Preço unitário (R$)
                    <input required type="number" min="0" max="99999999.99" step="0.01" value={item.precoUnitario} onChange={(event) => alterarItem(item.chave, 'precoUnitario', event.target.value)} className={campo} />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" disabled={itens.length >= 100} onClick={adicionarItem} className="flex items-center gap-2 rounded-lg p-2 text-sm text-[#A75870] hover:bg-pink-100 disabled:opacity-50">
              <Plus className="size-4" /> Adicionar item
            </button>
          </fieldset>

          <label className="block text-sm">Observações (opcional)
            <textarea rows={3} maxLength={5000} value={observacoes} onChange={(event) => setObservacoes(event.target.value)} className={campo} />
          </label>
        </fieldset>

        <p className="text-right font-bold">Total: {formatarMoeda(totalCentavos / 100)}</p>
        {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" disabled={salvando} onClick={onFechar} className="rounded-lg border border-pink-200 px-4 py-3 disabled:opacity-50">Voltar</button>
          <button type="submit" disabled={salvando || carregandoClientes} className="flex items-center justify-center gap-2 rounded-lg bg-[#A75870] px-4 py-3 text-white disabled:opacity-50">
            {salvando && <Loader2 className="size-4 animate-spin" />}
            {salvando ? 'Salvando...' : 'Salvar pedido'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
