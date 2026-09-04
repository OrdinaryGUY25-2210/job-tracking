import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useApplications(userId) {
  const [applications, setApplications] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState('');

  const loadApplications = useCallback(async () => {
    setLoaded(false);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('date_applied', { ascending: false });
    if (error) {
      setStorageError('Gagal memuat data: ' + error.message);
      setApplications([]);
    } else {
      setStorageError('');
      setApplications(data || []);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (userId) loadApplications();
  }, [userId, loadApplications]);

  const createApplication = useCallback(
    async (payload) => {
      const { data, error } = await supabase
        .from('applications')
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();
      if (error) {
        setStorageError('Gagal menyimpan: ' + error.message);
        return null;
      }
      setApplications((prev) => [data, ...prev]);
      return data;
    },
    [userId]
  );

  const updateApplication = useCallback(async (id, payload) => {
    const { data, error } = await supabase.from('applications').update(payload).eq('id', id).select().single();
    if (error) {
      setStorageError('Gagal memperbarui: ' + error.message);
      return null;
    }
    setApplications((prev) => prev.map((a) => (a.id === id ? data : a)));
    return data;
  }, []);

  const deleteApplication = useCallback(async (id) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) {
      setStorageError('Gagal menghapus: ' + error.message);
      return false;
    }
    setApplications((prev) => prev.filter((a) => a.id !== id));
    return true;
  }, []);

  return { applications, loaded, storageError, loadApplications, createApplication, updateApplication, deleteApplication };
}
