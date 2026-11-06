import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../Modal.jsx';
import { criarCliente, editarCliente } from '../../services/clientesApi.js';
import { mensagemErro } from '../../utils/pedidos.js';

const campo = 'mt-1 w-full rounded-lg border border-pink-200 bg-white p-3 font-normal focus:outline-2 focus:outline-[#A75870]';

export default function ClienteForm({ cliente, onFechar, onSalvo }) {
  const [nome, setNome] = useState(cliente?.nome || '');
  const [telefone, setTelefone] = useState(cliente?.telefone || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const editando = Boolean(cliente);

  async function salvar(event) {
    event.preventDefault();
    if (salvando) return;
    if (!nome.trim() || !/^\d{10,15}$/.test(telefone.replace(/\D/g, '')) || !/^[\d\s()+.-]+$/.test(telefone)) {
      setErro('Informe o nome e um telefone válido com DDD.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const dados = { nome: nome.trim(), telefone: telefone.trim() };
      const salvo = editando ? await editarCliente(cliente.id, dados) : await criarCliente(dados);
      onSalvo(salvo, editando);
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível salvar o cliente. Tente novamente.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={editando ? 'Editar cliente' : 'Novo cliente'} onFechar={onFechar} ocupado={salvando}>
      <form onSubmit={salvar} className="space-y-4">
        <fieldset disabled={salvando} className="space-y-4 disabled:opacity-60">
          <label className="block text-sm">Nome completo
            <input required maxLength={150} value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" placeholder="Nome do cliente" className={campo} />
          </label>
          <label className="block text-sm">Telefone com DDD
            <input required type="tel" maxLength={30} value={telefone} onChange={(event) => setTelefone(event.target.value)} autoComplete="tel" placeholder="(47) 91234-5678" className={campo} />
          </label>
        </fieldset>
        {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" disabled={salvando} onClick={onFechar} className="rounded-lg border border-pink-200 px-4 py-3 disabled:opacity-50">Voltar</button>
          <button type="submit" disabled={salvando} className="flex items-center justify-center gap-2 rounded-lg bg-[#A75870] px-4 py-3 text-white disabled:opacity-50">
            {salvando && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
