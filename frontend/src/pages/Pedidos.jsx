import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import PedidoCard from "../components/Pedidos/PedidoCard.jsx";
import PedidoForm from "../components/Pedidos/PedidoForm.jsx";
import PedidoDetalhes from "../components/Pedidos/PedidoDetalhes.jsx";
import CancelarPedido from "../components/Pedidos/CancelarPedido.jsx";
import { listarPedidos } from "../services/pedidosApi.js";
import { abasPedidos, mensagemErro } from "../utils/pedidos.js";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [parametros, setParametros] = useSearchParams();
  const statusSolicitado = parametros.get("status");
  const abaAtiva = abasPedidos.some((aba) => aba.valor === statusSolicitado) ? statusSolicitado : "pendente";
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [modal, setModal] = useState(null);

  function setAbaAtiva(status) {
    setParametros({ status }, { replace: true });
  }

  useEffect(() => {
    const controller = new AbortController();
    listarPedidos(controller.signal)
      .then(setPedidos)
      .catch((error) => {
        if (!controller.signal.aborted) setErro(mensagemErro(error, "Não foi possível carregar os pedidos. Verifique se o servidor está rodando."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });
    return () => controller.abort();
  }, [tentativa]);

  function recarregar() {
    setCarregando(true);
    setErro("");
    setAviso("");
    setTentativa((valor) => valor + 1);
  }

  function abrirModal(tipo, pedido) {
    setAviso("");
    setModal({ tipo, pedido });
  }

  function pedidoSalvo(pedido) {
    setPedidos((anteriores) => [
      ...anteriores.filter((atual) => atual.id !== pedido.id),
      pedido,
    ].sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega) || b.id - a.id));
    setAbaAtiva(pedido.status);
    setModal(null);
    setAviso("Pedido salvo com sucesso.");
  }

  function pedidoCancelado(id) {
    setPedidos((anteriores) => anteriores.filter((pedido) => pedido.id !== id));
    setModal(null);
    setAviso("Pedido cancelado com sucesso.");
  }

  const pedidosFiltrados = pedidos.filter((pedido) => pedido.status === abaAtiva);

  return (
    <main className="min-w-0 flex-1 bg-[#f8f8f8] px-4 py-7 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold sm:text-5xl">Meus pedidos</h1>
          <button
            type="button"
            disabled={carregando || Boolean(erro)}
            onClick={() => abrirModal("novo")}
            className="flex w-full items-center justify-center gap-3 rounded-md bg-[#E47798] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50 sm:w-auto"
          >
            Novo pedido
            <Plus aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="mt-8 flex border-b-2 border-gray-400" aria-label="Filtrar pedidos por status">
          {abasPedidos.map((aba) => (
            <button
              key={aba.valor}
              type="button"
              aria-pressed={abaAtiva === aba.valor}
              onClick={() => setAbaAtiva(aba.valor)}
              className={[
                "min-w-0 flex-1 border-b-[3px] px-2 py-3 text-xs font-semibold transition sm:text-sm",
                abaAtiva === aba.valor
                  ? "border-[#A38A00] text-[#806C00]"
                  : "border-transparent text-black",
              ].join(" ")}
            >
              {aba.nome}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <p role="status" className="text-[#683447]">{aviso}</p>
          <button type="button" disabled={carregando} onClick={recarregar} className="ml-auto flex items-center gap-2 rounded-lg p-2 text-[#A75870] hover:bg-pink-50 disabled:opacity-50">
            <RefreshCw aria-hidden="true" className="size-4" /> Atualizar
          </button>
        </div>

        <section aria-label="Lista de pedidos" aria-busy={carregando} className="mt-4 space-y-4">
          {carregando ? (
            <p role="status" className="flex items-center justify-center gap-2 py-8 text-gray-600">
              <Loader2 aria-hidden="true" className="size-5 animate-spin" /> Carregando pedidos...
            </p>
          ) : erro ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {erro}
              <button type="button" onClick={recarregar} className="mt-3 block underline">Tentar novamente</button>
            </div>
          ) : pedidosFiltrados.length ? (
            pedidosFiltrados.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onDetalhes={(selecionado) => abrirModal("detalhes", selecionado)}
                onCancelar={(selecionado) => abrirModal("cancelar", selecionado)}
              />
            ))
          ) : (
            <p className="py-8 text-center text-gray-500">Nenhum pedido nesta categoria.</p>
          )}
        </section>
      </div>

      {modal?.tipo === "novo" && <PedidoForm onFechar={() => setModal(null)} onSalvo={pedidoSalvo} />}
      {modal?.tipo === "detalhes" && (
        <PedidoDetalhes key={modal.pedido.id} pedidoId={modal.pedido.id} onFechar={() => setModal(null)} onAtualizado={pedidoSalvo} />
      )}
      {modal?.tipo === "cancelar" && (
        <CancelarPedido pedido={modal.pedido} onFechar={() => setModal(null)} onCancelado={pedidoCancelado} />
      )}
    </main>
  );
}

export default Pedidos;
