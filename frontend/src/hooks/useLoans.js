import { useEffect, useState } from "react";
export function useLoans(apiFetch) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  async function loadLoans() {
    setLoading(true);
    const res = await apiFetch("/loans");
    const json = await res.json();
    setLoans(json);
    setLoading(false);
  }
  useEffect(() => {
    loadLoans();
  }, []);
  return { loans, loading, reloadLoans: loadLoans };
}
