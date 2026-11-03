import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ titulo, onFechar, ocupado = false, children }) {
  const ref = useRef(null);
  const tituloId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflowAnterior;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={tituloId}
      aria-busy={ocupado}
      onCancel={(event) => {
        event.preventDefault();
        if (!ocupado) onFechar();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-2xl bg-[#fff5f8] p-4 text-black shadow-xl backdrop:bg-black/40 sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id={tituloId} className="text-xl font-bold">{titulo}</h2>
        <button
          type="button"
          onClick={onFechar}
          disabled={ocupado}
          aria-label="Fechar janela"
          className="rounded-lg p-2 hover:bg-pink-100 disabled:opacity-50"
        >
          <X aria-hidden="true" className="size-6" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
