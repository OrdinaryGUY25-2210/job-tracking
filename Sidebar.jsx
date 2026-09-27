import { IconTray, IconInterview, IconWallet } from './icons/Icons';

export default function Sidebar({ open, onClose, activeApp, onSelect, isAdmin }) {
  if (!open) return null;

  const items = [
    { key: 'lamaran', label: 'Lacak Lamaran', icon: <IconTray color="#1F2A44" size={18} /> },
    { key: 'interview', label: 'Interview Assistant', icon: <IconInterview color="#6B5FA3" size={18} /> },
    { key: 'finance', label: 'Keuangan', icon: <IconWallet color="#4C8B57" size={18} /> },
    ...(isAdmin ? [{ key: 'capos', label: 'caPOS Analytics', icon: <IconWallet color="#B85C50" size={18} /> }] : []),
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex"
      style={{ background: 'rgba(31,42,68,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[260px] max-w-[80vw] h-full bg-surface shadow-2xl p-4.5 flex flex-col gap-1" style={{ animation: 'slideInLeft 0.18s ease' }}>
        <div className="flex items-center justify-between px-2 pb-3.5 mb-1.5 border-b border-lineSoft">
          <span className="flex items-center gap-2">
            <img src="/icon-192.png" alt="Cortex" className="w-6 h-6 rounded-[6px]" />
            <span className="font-display text-[15px] font-semibold text-ink">Cortex</span>
          </span>
          <button onClick={onClose} className="opacity-40 hover:opacity-80 text-base">
            ✕
          </button>
        </div>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors text-left ${
              activeApp === item.key ? 'bg-paper text-ink font-semibold' : 'text-inkSoft hover:bg-paper'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
