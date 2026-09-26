import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { uid } from '../lib/constants';

// 9 kategori default (PRD §10) — total persentase harus 100%.
export const DEFAULT_CATEGORIES = [
  { category_name: 'Kebutuhan Pokok', percentage: 35 },
  { category_name: 'Tabungan & Investasi', percentage: 15 },
  { category_name: 'Transportasi', percentage: 10 },
  { category_name: 'Tagihan & Cicilan', percentage: 10 },
  { category_name: 'Hiburan & Gaya Hidup', percentage: 10 },
  { category_name: 'Kesehatan', percentage: 5 },
  { category_name: 'Pendidikan', percentage: 5 },
  { category_name: 'Dana Darurat', percentage: 5 },
  { category_name: 'Lainnya', percentage: 5 },
];

function withLocalIds(rows) {
  return rows.map((r, i) => ({ ...r, _localId: r.id || uid(), sort_order: i }));
}

export function useAllocation(userId) {
  const [totalIncome, setTotalIncome] = useState('');
  const [items, setItems] = useState([]); // { _localId, id?, category_name, percentage, sort_order }
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoaded(false);
    const [allocRes, itemsRes] = await Promise.all([
      supabase.from('finance_allocations').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('finance_allocation_items').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
    ]);

    if (allocRes.error || itemsRes.error) {
      setError((allocRes.error || itemsRes.error).message);
      setLoaded(true);
      return;
    }

    if (allocRes.data && itemsRes.data?.length) {
      // Sudah pernah menyimpan — muat data tersimpan.
      setTotalIncome(String(allocRes.data.total_income ?? ''));
      setItems(withLocalIds(itemsRes.data));
    } else {
      // Belum pernah menyimpan — mulai dari kategori default (belum tersimpan ke server).
      setTotalIncome('');
      setItems(withLocalIds(DEFAULT_CATEGORIES));
    }
    setError('');
    setLoaded(true);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const addCategory = useCallback(() => {
    setItems((prev) => [...prev, { _localId: uid(), category_name: 'Kategori Baru', percentage: 0, sort_order: prev.length }]);
  }, []);

  const updateCategory = useCallback((localId, patch) => {
    setItems((prev) => prev.map((it) => (it._localId === localId ? { ...it, ...patch } : it)));
  }, []);

  const removeCategory = useCallback((localId) => {
    setItems((prev) => prev.filter((it) => it._localId !== localId));
  }, []);

  const resetToDefault = useCallback(() => {
    setItems(withLocalIds(DEFAULT_CATEGORIES));
  }, []);

  const save = useCallback(async () => {
    if (!userId) return false;
    setSaving(true);
    setError('');

    const { error: allocErr } = await supabase
      .from('finance_allocations')
      .upsert({ user_id: userId, total_income: Number(totalIncome) || 0, updated_at: new Date().toISOString() });

    if (allocErr) {
      setError(allocErr.message);
      setSaving(false);
      return false;
    }

    // Ganti seluruh baris kategori: hapus lalu insert ulang sesuai state saat ini.
    // Simpel & aman untuk jumlah baris yang kecil (belasan), menghindari perlu
    // menyamakan mana yang update/insert/delete satu per satu.
    const { error: delErr } = await supabase.from('finance_allocation_items').delete().eq('user_id', userId);
    if (delErr) {
      setError(delErr.message);
      setSaving(false);
      return false;
    }

    const rows = items.map((it, i) => ({
      user_id: userId,
      category_name: it.category_name,
      percentage: Number(it.percentage) || 0,
      sort_order: i,
    }));
    const { data: inserted, error: insErr } = await supabase.from('finance_allocation_items').insert(rows).select();
    if (insErr) {
      setError(insErr.message);
      setSaving(false);
      return false;
    }

    setItems(withLocalIds(inserted));
    setSaving(false);
    return true;
  }, [userId, totalIncome, items]);

  const totalPercentage = items.reduce((sum, it) => sum + (Number(it.percentage) || 0), 0);
  const roundedTotalPercentage = Math.round(totalPercentage * 100) / 100;

  return {
    totalIncome,
    setTotalIncome,
    items,
    loaded,
    saving,
    error,
    addCategory,
    updateCategory,
    removeCategory,
    resetToDefault,
    save,
    totalPercentage: roundedTotalPercentage,
  };
}
