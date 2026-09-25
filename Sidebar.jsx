import React, { useState, useEffect } from 'react';
import { Briefcase, Wallet, Bot, LogOut, ChevronRight, Zap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar({ activeTab, setActiveTab, onLogout, user }) {
  const [hasCaposUnread, setHasCaposUnread] = useState(false);

  useEffect(() => {
    async function checkCaposUnread() {
      try {
        const { data } = await supabase
          .from('capos_activity_logs')
          .select('id')
          .eq('is_read', false)
          .limit(1);

        if (data && data.length > 0) {
          setHasCaposUnread(true);
        }
      } catch (e) {
        // Abaikan jika tabel belum di-migrate
      }
    }
    checkCaposUnread();
  }, [activeTab]);

  const navItems = [
    { id: 'lamaran', label: 'Lacak Lamaran', icon: Briefcase },
    { id: 'finance', label: 'Laporan Keuangan', icon: Wallet },
    { id: 'interview', label: 'Interview AI', icon: Bot },
    { id: 'capos', label: 'caPOS', icon: Zap, badge: hasCaposUnread },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20">
          JT
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-base leading-tight">Job Tracker</h1>
          <p className="text-[11px] text-slate-400">Pro & Career Suite</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'capos') setHasCaposUnread(false);
                setActiveTab(item.id);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Tanda Seru / Badge Notifikasi */}
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                    !
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-sky-400" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.email || 'User'}</p>
            <p className="text-[10px] text-slate-500">Terhubung</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-slate-400 rounded-lg text-xs font-medium transition border border-slate-700/60"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar Aplikasi
        </button>
      </div>
    </div>
  );
}