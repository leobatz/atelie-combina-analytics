import { useState } from 'react';
import { Link } from 'react-router';
import { RefreshCw, UserRound } from 'lucide-react';
import EstadoPagina from '../components/EstadoPagina.jsx';
import GraficoBarras from '../components/Dashboard/GraficoBarras.jsx';
import ListaPrazos from '../components/Dashboard/ListaPrazos.jsx';
import useDadosComerciais from '../hooks/useDadosComerciais.js';
import { hojeBrasil, resumoAnual } from '../utils/dashboard.js';
import { formatarMoeda } from '../utils/pedidos.js';

export default function Dashboard() {
  const { clientes, pedidos, carregando, erro, recarregar } = useDadosComerciais();
  const [hoje, setHoje] = useState(() => hojeBrasil());
  const anoAtual = Number(hoje.slice(0, 4));
  const [ano, setAno] = useState(anoAtual);
  const anos = [...new Set([anoAtual, ano, ...pedidos.map((pedido) => Number(pedido.dataEntrega.slice(0, 4)))])].sort((a, b) => b - a);
  const resumo = resumoAnual(pedidos, ano);
  const pendentes = pedidos.filter((pedido) => pedido.status === 'pendente');
  const atrasados = pedidos.filter((pedido) => pedido.status === 'atrasado');
  const faturamento = resumo.reduce((total, mes) => total + mes.faturamentoCentavos, 0);
  const concluidos = resumo.reduce((total, mes) => total + mes.concluidos, 0);

  function atualizar() {
    setHoje(hojeBrasil());
    recarregar();
  }

  return (
    <main className="min-w-0 flex-1 bg-[#f8f8f8] px-4 py-7 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-5xl">Dashboard</h1>
            <p className="mt-2 text-sm font-normal text-gray-500">Um olhar sobre seus pedidos e clientes.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex flex-1 items-center gap-2 text-sm text-[#754052]">Ano
              <select value={ano} onChange={(event) => setAno(Number(event.target.value))} className="min-h-11 flex-1 rounded-lg border border-pink-200 bg-white px-3 outline-[#A75870]">
                {anos.map((valor) => <option key={valor} value={valor}>{valor}</option>)}
              </select>
            </label>
            <button type="button" disabled={carregando} onClick={atualizar} className="flex items-center gap-2 rounded-lg p-3 text-sm text-[#A75870] hover:bg-pink-50 disabled:opacity-50"><RefreshCw aria-hidden="true" className="size-4" /> Atualizar</button>
          </div>
        </div>

        <EstadoPagina carregando={carregando} erro={erro} onTentarNovamente={atualizar}>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1"><ListaPrazos titulo="Pedidos pendentes" pedidos={pendentes} hoje={hoje} status="pendente" /></div>

            <section className="order-first min-w-0 rounded-[24px] bg-[#EDBDCE] p-4 sm:col-span-2 sm:p-5 lg:order-none lg:col-span-2 lg:col-start-2 lg:row-start-1" aria-labelledby="titulo-faturamento">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div><h2 id="titulo-faturamento" className="text-sm">Faturamento anual</h2><p className="mt-1 text-xs font-normal text-[#754052]">Concluídos por mês de entrega · {ano}</p></div>
                <p className="text-sm text-[#683447]">{formatarMoeda(faturamento / 100)}</p>
              </div>
              <div className="max-h-64 overflow-y-auto pr-2">
                <GraficoBarras dados={resumo.map((mes) => ({ mes: mes.mes, valor: mes.faturamentoCentavos / 100 }))} formatarValor={formatarMoeda} />
              </div>
              {faturamento === 0 && <p className="mt-3 text-xs font-normal text-[#754052]">Nenhum valor de pedido concluído neste ano.</p>}
            </section>

            <div className="min-w-0 lg:col-start-1 lg:row-start-2"><ListaPrazos titulo="Pedidos atrasados" pedidos={atrasados} hoje={hoje} status="atrasado" /></div>

            <section className="min-w-0 rounded-[24px] bg-[#EDBDCE] p-4 sm:p-5 lg:col-start-2 lg:row-start-2" aria-labelledby="titulo-concluidos">
              <div className="mb-4 flex items-center justify-between gap-2"><h2 id="titulo-concluidos" className="text-sm">Pedidos concluídos</h2><span className="rounded-full bg-white/65 px-2 py-0.5 text-xs text-[#754052]">{concluidos}</span></div>
              <div className="max-h-52 overflow-y-auto pr-2">
                <GraficoBarras compacto cor="bg-[#E47798]" dados={resumo.map((mes) => ({ mes: mes.mes, valor: mes.concluidos }))} formatarValor={(valor) => String(valor)} />
              </div>
              <p className="mt-3 text-xs font-normal text-[#754052]">Por mês de entrega · {ano}</p>
            </section>

            <section className="flex min-w-0 flex-col items-center rounded-[24px] bg-[#EDBDCE] p-5 lg:col-start-3 lg:row-start-2" aria-labelledby="titulo-clientes">
              <h2 id="titulo-clientes" className="text-sm">Total de clientes</h2>
              <div className="my-6 flex size-36 flex-col items-center justify-center rounded-full border-[5px] border-[#E47798] bg-[#f8f8f8] text-[#d45d84]">
                <UserRound aria-hidden="true" strokeWidth={1.5} className="size-11" />
                <p className="mt-1 text-2xl" aria-label={`${clientes.length} clientes cadastrados`}>{clientes.length}</p>
              </div>
              <Link to="/clientes" className="mt-auto text-xs text-[#754052] underline underline-offset-4">Ver todos os clientes</Link>
            </section>
          </div>
          <p className="mt-5 text-xs font-normal text-gray-500">Faturamento: soma dos pedidos concluídos, agrupados pela data de entrega. Pendentes, atrasados e clientes mostram o total geral; o filtro de ano se aplica aos gráficos.</p>
        </EstadoPagina>
      </div>
    </main>
  );
}
