import { useState, useRef, useEffect } from 'react';

const TIER_LABEL = { free: 'Free', pro: 'Pro', supreme: 'Supreme' };
const TIER_BADGE = {
  free: 'bg-paper text-inkSoft',
  pro: 'bg-interviewBg text-interview',
  supreme: 'bg-processingBg text-processing',
};

function initials(name, email) {
  const source = name || email || '?';
  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
}

export default function AccountMenu({ user, account, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = account?.full_name || user?.email?.split('@')[0] || 'Pengguna';
  const email = account?.email || user?.email || '';
  const tier = account?.subscription_tier || 'free';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-paper transition-colors">
        <span className="w-8 h-8 rounded-full bg-ink text-white text-[12px] font-semibold flex items-center justify-center flex-shrink-0">
          {initials(displayName, email)}
        </span>
        <span className="hidden sm:block text-left leading-tight">
          <span className="block text-[13px] font-semibold text-ink max-w-[120px] truncate">{displayName}</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-72 max-w-[88vw] bg-surface border border-line rounded-2xl shadow-2xl z-[80] overflow-hidden">
          <div className="px-4 py-4 border-b border-lineSoft flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-ink text-white text-[14px] font-semibold flex items-center justify-center flex-shrink-0">
              {initials(displayName, email)}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink truncate">{displayName}</span>
              <span className="block text-xs text-inkSoft truncate">{email}</span>
            </span>
          </div>

          <div className="px-4 py-3 border-b border-lineSoft flex items-center justify-between">
            <span className="text-xs text-inkSoft">Paket kamu</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TIER_BADGE[tier] || TIER_BADGE.free}`}>
              {TIER_LABEL[tier] || 'Free'}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-sm font-medium text-rejected hover:bg-paper transition-colors"
          >
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
