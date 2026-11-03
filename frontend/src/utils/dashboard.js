export const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function hojeBrasil(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(agora);
  const obter = (tipo) => partes.find((parte) => parte.type === tipo).value;
  return `${obter('year')}-${obter('month')}-${obter('day')}`;
}

export function diasParaEntrega(dataEntrega, hoje) {
  return Math.round((Date.parse(`${dataEntrega}T00:00:00Z`) - Date.parse(`${hoje}T00:00:00Z`)) / 86400000);
}

export function resumoAnual(pedidos, ano) {
  const resultado = meses.map((mes) => ({ mes, faturamentoCentavos: 0, concluidos: 0 }));
  for (const pedido of pedidos) {
    if (pedido.canceladoEm || pedido.status !== 'concluido' || !pedido.dataEntrega?.startsWith(`${ano}-`)) continue;
    const indice = Number(pedido.dataEntrega.slice(5, 7)) - 1;
    if (!resultado[indice]) continue;
    resultado[indice].concluidos += 1;
    resultado[indice].faturamentoCentavos += Math.round(Number(pedido.valorTotal) * 100);
  }
  return resultado;
}

export function contarPedidosPorCliente(pedidos) {
  const totais = new Map();
  for (const pedido of pedidos) {
    if (!pedido.canceladoEm) totais.set(pedido.clienteId, (totais.get(pedido.clienteId) || 0) + 1);
  }
  return totais;
}

export function normalizarBusca(valor) {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}
