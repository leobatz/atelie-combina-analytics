import { useState } from 'react';
import Modal from './Modal.jsx';
import { mensagemErro } from '../utils/pedidos.js';

export default function ConfirmarExclusao({ titulo, children, onFechar, onConfirmar }) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');

  async function confirmar() {
    if (excluindo) return;
    setExcluindo(true);
    setErro('');
    try {
      await onConfirmar();
    } catch (error) {
      setErro(mensagemErro(error, 'Não foi possível excluir o registro. Tente novamente.'));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <Modal titulo={titulo} onFechar={onFechar} ocupado={excluindo}>
      <div className="break-words text-sm font-normal">{children}</div>
      {erro && <p role="alert" className="mt-4 text-sm text-red-700">{erro}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" disabled={excluindo} onClick={onFechar} className="rounded-lg border border-pink-200 px-4 py-3 disabled:opacity-50">Voltar</button>
        <button type="button" disabled={excluindo} onClick={confirmar} className="rounded-lg bg-red-700 px-4 py-3 text-white disabled:opacity-50">{excluindo ? 'Excluindo...' : 'Excluir definitivamente'}</button>
      </div>
    </Modal>
  );
}
