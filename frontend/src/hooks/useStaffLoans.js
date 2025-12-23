import { useEffect, useState, useCallback } from "react";
import { useApi } from "./useApi";

export function useStaffLoans(options = {}) {
  const enabled = options.enabled ?? true;
  const { apiFetch } = useApi();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/staff/loans");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLoans(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, enabled]);

  useEffect(() => {
    if (!enabled) return;
    load();
  }, [enabled, load]);

  return { loans, loading, error, refresh: load };
}
