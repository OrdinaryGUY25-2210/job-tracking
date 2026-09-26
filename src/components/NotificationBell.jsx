import { useState, useRef, useEffect } from 'react';

const TYPE_DOT = {
  info: 'bg-submitted',
  success: 'bg-accepted',
  warning: 'bg-rejected',
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  return `${day} hari lalu`;
}

export default function NotificationBell({ notifications, unreadCount, onMarkAsRead, onMarkAllAsRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-paper transition-colors"
        title="Notifikasi"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 16v-5a6 6 0 0 0-4.5-5.8V4a1.5 1.5 0 0 0-3 0v1.2A6 6 0 0 0 6 11v5l-1.6 1.9a1 1 0 0 0 .77 1.6h13.66a1 1 0 0 0 .77-1.6L18 16Z"
            stroke="#1F2A44"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M9.5 20.5a2.5 2.5 0 0 0 5 0" stroke="#1F2A44" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rejected text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-80 max-w-[88vw] bg-surface border border-line rounded-2xl shadow-2xl z-[80] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-lineSoft">
            <span className="font-display font-semibold text-sm text-ink">Notifikasi</span>
            {unreadCount > 0 && (
              <button onClick={onMarkAllAsRead} className="text-xs font-medium text-inkSoft hover:text-ink">
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-sm text-inkSoft text-center py-8 px-4">Belum ada notifikasi.</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-lineSoft last:border-0 hover:bg-paper transition-colors flex gap-2.5 ${
                  n.is_read ? 'opacity-60' : ''
                }`}
              >
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_DOT[n.type] || TYPE_DOT.info}`} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold text-ink">{n.title}</span>
                  {n.message && <span className="block text-[12.5px] text-inkSoft mt-0.5">{n.message}</span>}
                  <span className="block text-[11px] text-inkSoft/70 mt-1">{timeAgo(n.created_at)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
