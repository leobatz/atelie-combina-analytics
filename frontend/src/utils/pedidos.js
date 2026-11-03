export const abasPedidos = [
  { valor: 'pendente', nome: 'Pendentes' },
  { valor: 'atrasado', nome: 'Atrasados' },
  { valor: 'concluido', nome: 'Concluídos' },
];

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
}

export function formatarData(data) {
  return data.split('-').reverse().join('/');
}

export function mensagemErro(erro, alternativa) {
  return erro.response?.data?.message || erro.response?.data?.erro || alternativa;
}
