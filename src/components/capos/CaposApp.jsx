import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Crown, Zap, ShieldCheck, 
  Search, Bell, ArrowUpRight, ArrowDownRight, RefreshCw, UserCheck 
} from 'lucide-react';
import { useCapos } from '../../hooks/useCapos';
import { TIER_PRICES } from '../../lib/capos';

export default function CaposApp() {
  const { 
    users, totalUsers, freeCount, proCount, supremeCount, 
    proRevenue, supremeRevenue, totalRevenue, logs, loading, 
    refreshCapos, clearNotifications 
  } = useCapos();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');

  useEffect(() => {
    clearNotifications();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const userTier = (u.subscription_tier || 'free').toLowerCase();
    const matchesTier = selectedTier === 'all' || userTier === selectedTier;

    return matchesSearch && matchesTier;
  });

  const maxTierCount = Math.max(freeCount, proCount, supremeCount, 1);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-7 h-7 text-amber-400 fill-amber-400/20" />
            caPOS Tracking & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitoring penggunaan aplikasi, tier langganan, dan estimasi pendapatan real-time.
          </p>
        </div>
        <button
          onClick={refreshCapos}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Activity / Notification Bar */}
      {logs.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
            <Bell className="w-4 h-4" />
            Aktivitas Pengguna Terkini
          </div>
          <div className="space-y-2 max-h-24 overflow-y-auto pr-2 text-xs text-slate-300">
            {logs.slice(0, 3).map((log) => (
              <div key={log.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <strong>{log.full_name || log.email || 'Pengguna'}</strong>: {log.description || log.action_type}
                </span>
                <span className="text-slate-500">
                  {new Date(log.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Keseluruhan Revenue */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pendapatan</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400">{formatRupiah(totalRevenue)}</div>
            <p className="text-xs text-slate-400 mt-1">Akumulasi estimasi bulanan</p>
          </div>
        </div>

        {/* Free Tier */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Free Tier</span>
            <div className="p-2.5 bg-slate-700/50 text-slate-300 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">{freeCount} <span className="text-sm font-normal text-slate-400">User</span></div>
            <p className="text-xs text-slate-400 mt-1">Total Biaya: {formatRupiah(0)}</p>
          </div>
        </div>

        {/* Pro Tier */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Pro Tier</span>
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">{proCount} <span className="text-sm font-normal text-slate-400">User</span></div>
            <p className="text-xs text-sky-400 font-medium mt-1">Total Biaya: {formatRupiah(proRevenue)}</p>
          </div>
        </div>

        {/* Supreme Tier */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Supreme Tier</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">{supremeCount} <span className="text-sm font-normal text-slate-400">User</span></div>
            <p className="text-xs text-amber-400 font-medium mt-1">Total Biaya: {formatRupiah(supremeRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualisation */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-100 mb-6">Analisis Perbandingan Tier (Jumlah User & Biaya)</h3>
        
        <div className="space-y-5">
          {/* Free Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Free Tier ({freeCount} User)</span>
              <span className="text-slate-400">Rp 0</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-slate-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(freeCount / maxTierCount) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Pro Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-sky-300">Pro Tier ({proCount} User)</span>
              <span className="text-sky-400 font-semibold">{formatRupiah(proRevenue)}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(proCount / maxTierCount) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Supreme Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-amber-300">Supreme Tier ({supremeCount} User)</span>
              <span className="text-amber-400 font-semibold">{formatRupiah(supremeRevenue)}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(supremeCount / maxTierCount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-semibold text-slate-100">Daftar Detail Pengguna</h3>
            <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {filteredUsers.length} Pengguna
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">Semua Tier</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="supreme">Supreme</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-700/50">
              <tr>
                <th className="px-4 py-3">Nama User</th>
                <th className="px-4 py-3">Alamat Email</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Biaya / Bulan</th>
                <th className="px-4 py-3">Tanggal Bergabung</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const tier = (u.subscription_tier || 'free').toLowerCase();
                  const fee = TIER_PRICES[tier] || 0;

                  return (
                    <tr key={u.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-4 py-3 font-medium text-slate-100">
                        {u.full_name || 'Tanpa Nama'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{u.email || '-'}</td>
                      <td className="px-4 py-3">
                        {tier === 'supreme' && (
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            <Crown className="w-3 h-3" /> Supreme
                          </span>
                        )}
                        {tier === 'pro' && (
                          <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            <Zap className="w-3 h-3" /> Pro
                          </span>
                        )}
                        {tier === 'free' && (
                          <span className="inline-flex items-center gap-1 bg-slate-700/50 text-slate-400 border border-slate-600/50 px-2 py-0.5 rounded text-[10px] font-medium">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {formatRupiah(fee)}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {u.status || 'Aktif'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}