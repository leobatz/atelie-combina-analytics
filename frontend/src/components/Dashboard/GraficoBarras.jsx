export default function GraficoBarras({ dados, formatarValor, cor = 'bg-white', compacto = false }) {
  const maior = Math.max(...dados.map((item) => item.valor), 1);

  return (
    <ul className={compacto ? 'space-y-2' : 'space-y-2.5'}>
      {dados.map((item) => (
        <li key={item.mes} className="flex min-w-0 items-center gap-2 text-xs sm:gap-3">
          <span className="w-9 shrink-0 capitalize" title={item.mes}>{item.mes.slice(0, 3)}</span>
          <div className="relative h-6 min-w-0 flex-1 overflow-hidden rounded bg-white/35">
            <div aria-hidden="true" className={`absolute inset-y-0 left-0 rounded transition-[width] duration-500 ${cor}`} style={{ width: `${(item.valor / maior) * 100}%` }} />
            <span className="relative flex h-full items-center justify-end px-2 text-[#45232f]">{formatarValor(item.valor)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
