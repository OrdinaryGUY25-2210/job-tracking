import { useEffect } from 'react';
import { TOAST_ICONS } from './icons/Icons';

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 3400);
    return () => clearTimeout(t);
  }, [toast.id, onClose]);

  const Icon = TOAST_ICONS[toast.icon] || TOAST_ICONS.updated;

  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lg bg-surface border border-line min-w-[260px] max-w-[340px]"
      style={{ animation: 'slideInToast 0.2s ease' }}
    >
      <div className="shrink-0 mt-0.5">
        <Icon />
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.desc && <p className="text-xs mt-0.5 text-inkSoft">{toast.desc}</p>}
      </div>
      <button onClick={() => onClose(toast.id)} className="shrink-0 opacity-40 hover:opacity-80 transition-opacity">
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed z-[60] flex flex-col gap-2.5 items-end" style={{ bottom: 'max(20px, env(safe-area-inset-bottom))', right: 'max(20px, env(safe-area-inset-right))', left: 20 }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}
