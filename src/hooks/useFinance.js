import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useFinance(userId) {
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoaded(false);
    const [accRes, expRes, tgtRes] = await Promise.all([
      supabase.from('finance_accounts').select('*').order('created_at', { ascending: true }),
      supabase.from('finance_expenses').select('*').order('expense_date', { ascending: false }),
      supabase.from('finance_targets').select('*').order('created_at', { ascending: true }),
    ]);
    if (accRes.error || expRes.error || tgtRes.error) {
      setError((accRes.error || expRes.error || tgtRes.error).message);
    } else {
      setError('');
      setAccounts(accRes.data || []);
      setExpenses(expRes.data || []);
      setTargets(tgtRes.data || []);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (userId) loadAll();
  }, [userId, loadAll]);

  // ---------------- Accounts ----------------
  const createAccount = useCallback(
    async (payload) => {
      const { data, error: err } = await supabase.from('finance_accounts').insert([{ ...payload, user_id: userId }]).select().single();
      if (err) {
        setError(err.message);
        return null;
      }
      setAccounts((prev) => [...prev, data]);
      return data;
    },
    [userId]
  );
  const updateAccount = useCallback(async (id, payload) => {
    const { data, error: err } = await supabase.from('finance_accounts').update(payload).eq('id', id).select().single();
    if (err) {
      setError(err.message);
      return null;
    }
    setAccounts((prev) => prev.map((a) => (a.id === id ? data : a)));
    return data;
  }, []);
  const deleteAccount = useCallback(async (id) => {
    const { error: err } = await supabase.from('finance_accounts').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return false;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    return true;
  }, []);

  // ---------------- Expenses ----------------
  const createExpense = useCallback(
    async (payload) => {
      const { data, error: err } = await supabase.from('finance_expenses').insert([{ ...payload, user_id: userId }]).select().single();
      if (err) {
        setError(err.message);
        return null;
      }
      setExpenses((prev) => [data, ...prev]);
      return data;
    },
    [userId]
  );
  const updateExpense = useCallback(async (id, payload) => {
    const { data, error: err } = await supabase.from('finance_expenses').update(payload).eq('id', id).select().single();
    if (err) {
      setError(err.message);
      return null;
    }
    setExpenses((prev) => prev.map((e) => (e.id === id ? data : e)));
    return data;
  }, []);
  const deleteExpense = useCallback(async (id) => {
    const { error: err } = await supabase.from('finance_expenses').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return false;
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    return true;
  }, []);

  // ---------------- Targets ----------------
  const createTarget = useCallback(
    async (payload) => {
      const { data, error: err } = await supabase.from('finance_targets').insert([{ ...payload, user_id: userId }]).select().single();
      if (err) {
        setError(err.message);
        return null;
      }
      setTargets((prev) => [...prev, data]);
      return data;
    },
    [userId]
  );
  const updateTarget = useCallback(async (id, payload) => {
    const { data, error: err } = await supabase.from('finance_targets').update(payload).eq('id', id).select().single();
    if (err) {
      setError(err.message);
      return null;
    }
    setTargets((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }, []);
  const deleteTarget = useCallback(async (id) => {
    const { error: err } = await supabase.from('finance_targets').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return false;
    }
    setTargets((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  return {
    accounts,
    expenses,
    targets,
    totalBalance,
    loaded,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    createExpense,
    updateExpense,
    deleteExpense,
    createTarget,
    updateTarget,
    deleteTarget,
  };
}
