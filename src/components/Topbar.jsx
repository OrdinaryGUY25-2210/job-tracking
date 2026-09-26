import InstallButton from './InstallButton';
import NotificationBell from './NotificationBell';
import AccountMenu from './AccountMenu';

export default function Topbar({ onOpenSidebar, user, account, onLogout, notifications, unreadCount, onMarkAsRead, onMarkAllAsRead }) {
  return (
    <header
      className="sticky top-0 z-[60] bg-surface border-b border-line flex items-center justify-between px-4 sm:px-6 gap-3"
      style={{ height: 60, paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-paper transition-colors flex-shrink-0"
          title="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="#1F2A44" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <img src="/icon-192.png" alt="Cortex" className="w-7 h-7 rounded-[8px] flex-shrink-0" />
        <span className="font-display font-semibold text-[15px] text-ink truncate hidden xs:inline">Cortex</span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <InstallButton />
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
        />
        <AccountMenu user={user} account={account} onLogout={onLogout} />
      </div>
    </header>
  );
}
