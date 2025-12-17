export function useLoanApi(apiFetch) {
  const base = "/loans";
  async function collectLoan(id) {
    const res = await apiFetch(`${base}/${id}/collect`, { method: "POST" });
    return res.json();
  }
  async function returnLoan(id) {
    const res = await apiFetch(`${base}/${id}/return`, { method: "POST" });
    return res.json();
  }
  return { collectLoan, returnLoan };
}
