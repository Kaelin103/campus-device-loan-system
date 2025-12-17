import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useStaffLoans } from "../hooks/useStaffLoans";

import AuthReadyGate from "../components/AuthReadyGate";

function StaffContent() {
  const { user } = useAuth0();

  const roles = user?.["https://cdls-api/roles"] || [];
  const isStaff = roles.includes("staff");

  if (!isStaff) return <div>Access Denied</div>;

  const { loans, loading, error, refresh } = useStaffLoans();

  if (loading) return <div>Loading staff loans...</div>;
  if (error) return <div>Failed: {String(error)}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Staff - All Loans</h1>
      <button onClick={refresh}>Refresh</button>
      <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(loans, null, 2)}
      </pre>
    </div>
  );
}

export default function Staff() {
  return (
    <AuthReadyGate>
      <StaffContent />
    </AuthReadyGate>
  );
}
