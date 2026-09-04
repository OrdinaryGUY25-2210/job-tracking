import { IconTrashFlat } from '../icons/Icons';

export default function ConfirmDeleteModal({ app, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card max-w-[360px] text-center">
        <div className="flex justify-center mb-3">
          <IconTrashFlat size={34} />
        </div>
        <h3 className="font-display text-base font-semibold mb-1.5 text-ink">Hapus lamaran ini?</h3>
        <p className="text-sm mb-5 text-inkSoft">
          {app.position} di {app.company} akan dihapus permanen.
        </p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-paper text-inkSoft">
            Batal
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white bg-rejected">
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
