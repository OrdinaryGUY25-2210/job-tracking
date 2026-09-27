import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// Baca baris "profiles" milik user yang sedang login — dipakai untuk
// tampilan Account Menu (nama, tier) dan untuk gating menu caPOS (is_admin).
export function useAccount(user) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setAccount(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, subscription_tier, status, is_admin, created_at')
      .eq('id', user.id)
      .maybeSingle();

    if (!error) setAccount(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { account, loading, refresh };
}
