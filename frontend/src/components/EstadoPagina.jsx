import { Loader2 } from 'lucide-react';

export default function EstadoPagina({ carregando, erro, onTentarNovamente, children }) {
  if (carregando) {
    return <p role="status" className="flex items-center justify-center gap-2 py-16 text-[#754052]"><Loader2 aria-hidden="true" className="size-5 animate-spin" /> Carregando dados...</p>;
  }
  if (erro) {
    return (
      <div role="alert" className="my-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{erro}</p>
        <button type="button" onClick={onTentarNovamente} className="mt-3 rounded-lg border border-red-200 px-3 py-2 hover:bg-red-100">Tentar novamente</button>
      </div>
    );
  }
  return children;
}
