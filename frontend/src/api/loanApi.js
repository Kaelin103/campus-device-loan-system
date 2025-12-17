import { useApi } from "../hooks/useApi";
export function useLoanApi() {
  const { apiFetch } = useApi();
  const base = "/loans";
  async function reserveLoan(deviceId, userId, userName) {
    const res = await apiFetch(base, {
      method: "POST",
      body: JSON.stringify({ deviceId, userId, userName }),
    });
    return res.json();
  }
  async function collectLoan(id) {
    const res = await apiFetch(`${base}/${id}/collect`, { method: "POST" });
    return res.json();
  }
  async function returnLoan(id) {
    const res = await apiFetch(`${base}/${id}/return`, { method: "POST" });
    return res.json();
  }
  async function fetchLoans() {
    const res = await apiFetch(base, { method: "GET" });
    return res.json();
  }
  return { reserveLoan, collectLoan, returnLoan, fetchLoans };
}
