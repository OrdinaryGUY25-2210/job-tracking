import { useCallback, useState } from 'react';
import { uid } from '../lib/constants';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((icon, title, desc) => {
    const id = uid();
    setToasts((t) => [...t, { id, icon, title, desc }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3600);
  }, []);

  const closeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return { toasts, showToast, closeToast };
}
