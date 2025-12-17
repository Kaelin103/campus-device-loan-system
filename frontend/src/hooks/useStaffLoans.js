import { useEffect, useState, useCallback } from "react";
import { useApi } from "./useApi";

export function useStaffLoans() {
  const { apiFetch } = useApi();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
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
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  return { loans, loading, error, refresh: load };
}
