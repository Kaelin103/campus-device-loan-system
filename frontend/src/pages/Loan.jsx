import { useEffect } from "react";
import { useLoanApi } from "../hooks/useLoanApi";
import NavBar from "../components/NavBar";
import { useApi } from "../hooks/useApi";
import { useDevices } from "../hooks/useDevices";
import { useAuth0 } from "@auth0/auth0-react";
import { useLoans } from "../hooks/useLoans";
import { useGlobalRefresh } from "../hooks/useGlobalRefresh";

const STATUS_STYLE = {
  Reserved: {
    color: "#facc15",
    label: "Reserved",
  },
  Collected: {
    color: "#60a5fa",
    label: "Collected",
  },
  Returned: {
    color: "#4ade80",
    label: "Returned",
  },
};

import AuthReadyGate from "../components/AuthReadyGate";

function LoanContent() {
  const { apiFetch } = useApi();
  const { loans, loading, reloadLoans } = useLoans(apiFetch);
  const { collectLoan, returnLoan } = useLoanApi(apiFetch);
  const { reloadDevices } = useDevices(apiFetch);
  const { user, isAuthenticated } = useAuth0();
  useGlobalRefresh([reloadLoans]);
  useEffect(() => {
    document.title = "Loan Records";
  }, []);
  async function handleCollect(id) {
    const r = await collectLoan(id);
    alert("Collected: " + (r && r.status ? r.status : "Success"));
    reloadLoans();
    await reloadDevices();
  }
  async function handleReturn(id) {
    const r = await returnLoan(id);
    alert("Returned: " + (r && r.status ? r.status : "Success"));
    reloadLoans();
    await reloadDevices();
  }

  if (loading) {
    return <Spin />;
  }

  return (
    <>
      <NavBar />
      <div style={{ padding: "20px" }}>
        <h1>Loan Records</h1>
        {!isAuthenticated && <p>Please login to view your loans.</p>}
        {(isAuthenticated ? loans.filter((l) => l.userId === user.sub) : loans).map((l) => (
          <div key={l.id} style={{ marginBottom: "15px", color: "white" }}>
            <h3>{l.deviceName || l.device || ""}</h3>
            <p>User: {l.userName || l.user || ""}</p>
            <p>
              Status:{" "}
              <span
                style={{
                  color: STATUS_STYLE[l.status]?.color ?? "#e5e7eb",
                  fontWeight: 600,
                }}
              >
                {l.status}
              </span>
            </p>
            {l.status === "Reserved" && (
              <button type="button" onClick={() => handleCollect(l.id)}>Collect</button>
            )}
            {l.status === "Collected" && (
              <button type="button" onClick={() => handleReturn(l.id)} style={{ marginLeft: "10px" }}>
                Return
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function Loan() {
  return (
    <AuthReadyGate>
      <LoanContent />
    </AuthReadyGate>
  );
}

function Spin() {
  return <p>Loading...</p>;
}
