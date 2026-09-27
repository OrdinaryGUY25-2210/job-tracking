import { useEffect, useState, useCallback } from 'react';
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

// Rute URL <-> tab aktif, supaya refresh / buka link langsung / tombol
// back-forward browser tetap membuka halaman yang sama (bukan selalu
// balik ke halaman utama). vercel.json & konfigurasi PWA sudah mengarahkan
// semua path ke index.html, jadi tinggal dibaca di sini.
const PATH_TO_APP = { '/': 'lamaran', '/lamaran': 'lamaran', '/finance': 'finance', '/interview': 'interview', '/capos': 'capos' };
const APP_TO_PATH = { lamaran: '/lamaran', finance: '/finance', interview: '/interview', capos: '/capos' };

function readAppFromLocation() {
  return PATH_TO_APP[window.location.pathname] || 'lamaran';
}

export default function App() {
  const { user, loading, signInWithPassword, signUpWithPassword, resetPassword, loginWithGoogle, logout } = useAuth();
  const { account, loading: accountLoading } = useAccount(user);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user);
  const { toasts, showToast, closeToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(readAppFromLocation);
  const [profile, setProfile] = useState(null); // data CV/portofolio (tabel "profile"), dipakai LamaranApp + Profile.jsx

  const isAdmin = !!account?.is_admin;

  const goToApp = useCallback((key, replace = false) => {
    setActiveApp(key);
    const path = APP_TO_PATH[key] || '/lamaran';
    if (window.location.pathname !== path) {
      window.history[replace ? 'replaceState' : 'pushState'](null, '', path);
    }
  }, []);

  // Tombol back/forward browser.
  useEffect(() => {
    const onPopState = () => setActiveApp(readAppFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Kalau URL-nya /capos tapi ternyata bukan admin (mis. status admin baru
  // termuat setelah render pertama, atau memang bukan admin), alihkan diam-diam
  // ke halaman utama supaya tidak nyangkut di halaman kosong.
  useEffect(() => {
    if (activeApp === 'capos' && !accountLoading && !isAdmin) {
      goToApp('lamaran', true);
    }
  }, [activeApp, isAdmin, accountLoading, goToApp]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Memuat aplikasi...
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        onSignIn={signInWithPassword}
        onSignUp={signUpWithPassword}
        onResetPassword={resetPassword}
        onGoogleLogin={loginWithGoogle}
      />
    );
  }

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
          goToApp(key);
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
