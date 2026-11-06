export const abasPedidos = [
  { valor: 'pendente', nome: 'Pendentes', cor: 'text-[#C6A600]', borda: 'border-[#E2C53B]' },
  { valor: 'atrasado', nome: 'Atrasados', cor: 'text-red-600', borda: 'border-red-500' },
  { valor: 'concluido', nome: 'Concluídos', cor: 'text-green-600', borda: 'border-green-500' },
];

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
}

export function formatarData(data) {
  return data.split('-').reverse().join('/');
}

export function mensagemErro(erro, alternativa) {
  const resposta = erro.response?.data;
  const mensagem = resposta?.message || resposta?.erro || resposta?.error;
  return typeof mensagem === 'string' ? mensagem : alternativa;
}
