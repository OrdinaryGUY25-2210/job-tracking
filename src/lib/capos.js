import { supabase } from './supabaseClient';

export const TIER_PRICES = {
  free: 0,
  pro: 50000,
  supreme: 150000,
};

export async function fetchCaposAnalytics() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, subscription_tier, status, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const users = profiles || [];
    
    let freeCount = 0;
    let proCount = 0;
    let supremeCount = 0;

    users.forEach((u) => {
      const tier = (u.subscription_tier || 'free').toLowerCase();
      if (tier === 'pro') proCount++;
      else if (tier === 'supreme') supremeCount++;
      else freeCount++;
    });

    const proRevenue = proCount * TIER_PRICES.pro;
    const supremeRevenue = supremeCount * TIER_PRICES.supreme;
    const totalRevenue = proRevenue + supremeRevenue;

    const { data: unreadLogs, error: logErr } = await supabase
      .from('capos_activity_logs')
      .select('id')
      .eq('is_read', false);

    const hasUnread = !logErr && unreadLogs && unreadLogs.length > 0;

    return {
      users,
      totalUsers: users.length,
      freeCount,
      proCount,
      supremeCount,
      proRevenue,
      supremeRevenue,
      totalRevenue,
      hasUnread,
    };
  } catch (err) {
    console.error('Error fetching caPOS analytics:', err);
    return {
      users: [],
      totalUsers: 0,
      freeCount: 0,
      proCount: 0,
      supremeCount: 0,
      proRevenue: 0,
      supremeRevenue: 0,
      totalRevenue: 0,
      hasUnread: false,
    };
  }
}

export async function fetchCaposLogs() {
  try {
    const { data, error } = await supabase
      .from('capos_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching caPOS logs:', err);
    return [];
  }
}

export async function markCaposLogsAsRead() {
  try {
    await supabase
      .from('capos_activity_logs')
      .update({ is_read: true })
      .eq('is_read', false);
  } catch (err) {
    console.error('Error marking caPOS logs as read:', err);
  }
}

// Trafik pendaftaran pengguna baru per hari, N hari terakhir — dihitung
// langsung dari daftar "users" (created_at) yang sudah dimuat, tanpa query
// tambahan ke Supabase.
export function buildSignupTrend(users, days = 14) {
  const buckets = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      pengguna: 0,
    });
  }

  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));
  (users || []).forEach((u) => {
    if (!u.created_at) return;
    const key = u.created_at.slice(0, 10);
    if (byKey[key]) byKey[key].pengguna += 1;
  });

  return buckets;
}