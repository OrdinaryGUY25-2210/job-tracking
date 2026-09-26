import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/ToastContainer';
import LamaranApp from './components/lamaran/LamaranApp';
import FinanceApp from './components/finance/FinanceApp';
import InterviewApp from './components/interview/InterviewApp';
import CaposApp from './components/capos/CaposApp';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';
import { useAccount } from './hooks/useAccount';
import { useNotifications } from './hooks/useNotifications';
import { useToast } from './hooks/useToast';

export default function App() {
  const { user, loading, logout } = useAuth();
  const { account } = useAccount(user);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user);
  const { toasts, showToast, closeToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeApp, setActiveApp] = useState('lamaran');
  const [profile, setProfile] = useState(null); // data CV/portofolio (tabel "profile"), dipakai LamaranApp + Profile.jsx

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Memuat aplikasi...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const isAdmin = !!account?.is_admin;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-body antialiased">
      <Topbar
        onOpenSidebar={() => setSidebarOpen(true)}
        user={user}
        account={account}
        onLogout={logout}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeApp={activeApp}
        onSelect={(key) => {
          setActiveApp(key);
          setSidebarOpen(false);
        }}
        isAdmin={isAdmin}
      />

      <main className="flex-1 overflow-y-auto">
        {activeApp === 'lamaran' && (
          <LamaranApp userId={user.id} profile={profile} setProfile={setProfile} showToast={showToast} />
        )}
        {activeApp === 'finance' && <FinanceApp userId={user.id} showToast={showToast} />}
        {activeApp === 'interview' && <InterviewApp />}
        {activeApp === 'capos' && isAdmin && <CaposApp />}
      </main>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
