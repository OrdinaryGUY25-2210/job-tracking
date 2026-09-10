import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import AccountMigrationBanner from './components/AccountMigrationBanner';
import LamaranApp from './components/lamaran/LamaranApp';
import InterviewApp from './components/interview/InterviewApp';
import FinanceApp from './components/finance/FinanceApp';

const APP_META = {
  lamaran: { title: 'Lacak Lamaran', subtitle: 'Pengganti spreadsheet untuk memantau proses lamaran kerjamu.' },
  interview: { title: 'Interview Assistant', subtitle: 'Rekam interview, dapat transkrip live & saran jawaban AI secara real-time.' },
  finance: { title: 'Keuangan', subtitle: 'Lacak pengeluaran, rekening, dan target tabunganmu di satu tempat.' },
};

export default function App() {
  const { user, loading, signInWithPassword, signUpWithPassword, resetPassword, loginWithGoogle, logout } = useAuth();
  const { toasts, showToast, closeToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeApp, setActiveApp] = useState('lamaran');
  const [profile, setProfile] = useState(null);
  const [bannerTick, setBannerTick] = useState(0);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSidebarOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading) return null;
  if (!user) {
    return <Login onSignIn={signInWithPassword} onSignUp={signUpWithPassword} onResetPassword={resetPassword} onGoogleLogin={loginWithGoogle} />;
  }

  const meta = APP_META[activeApp];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" style={{ paddingTop: 'max(32px, env(safe-area-inset-top))' }}>
      <header className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div className="flex items-center gap-3.5">
          <button onClick={() => setSidebarOpen(true)} className="w-[42px] h-[42px] rounded-xl bg-surface border border-line flex items-center justify-center shrink-0 hover:bg-paper" aria-label="Buka menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="#1F2A44" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{meta.title}</h1>
            <p className="text-inkSoft text-[13.5px] mt-0.5">{meta.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-surface border border-line rounded-full pl-1.5 pr-3 py-1 text-[13px] text-inkSoft">
            <img
              src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email)}`}
              alt=""
              className="w-6 h-6 rounded-full"
            />
            <span className="truncate max-w-[160px]">{user.email}</span>
          </div>
          <button onClick={logout} className="btn-ghost">
            Keluar
          </button>
        </div>
      </header>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeApp={activeApp}
        onSelect={(app) => {
          setActiveApp(app);
          setSidebarOpen(false);
        }}
      />

      <AccountMigrationBanner key={bannerTick} user={user} onDone={() => setBannerTick((t) => t + 1)} />

      {activeApp === 'lamaran' && <LamaranApp userId={user.id} profile={profile} setProfile={setProfile} showToast={showToast} />}
      {activeApp === 'interview' && <InterviewApp />}
      {activeApp === 'finance' && <FinanceApp userId={user.id} showToast={showToast} />}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
