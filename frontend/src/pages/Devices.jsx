import { useEffect } from "react";
import NavBar from "../components/NavBar";
import { useAuth0 } from "@auth0/auth0-react";
import { useApi } from "../hooks/useApi";
import { useDevices } from "../hooks/useDevices";
import { useGlobalRefresh } from "../hooks/useGlobalRefresh";

import AuthReadyGate from "../components/AuthReadyGate";

function DevicesContent() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const { apiFetch } = useApi();
  const { devices, loading, reloadDevices } = useDevices(apiFetch);
  useGlobalRefresh([reloadDevices]);

  useEffect(() => {
    document.title = "Devices";
  }, []);

  async function handleReserve(device) {
    if (!isAuthenticated) {
      alert("Please login before reserving a device.");
      loginWithRedirect();
      return;
    }
    await apiFetch("/loans", {
      method: "POST",
      body: JSON.stringify({
        deviceId: device.id,
        userId: user.sub,
        userName: user.name,
      }),
    });
    alert("Reserved successfully");
    await reloadDevices();
  }
  return (
    <>
      <NavBar />
      <div style={{ padding: "20px" }}>
        <h1>Available Devices</h1>
        {loading && <p>Loading...</p>}
        {!loading && devices.map((d) => (
          <div key={d.id} style={styles.card}>
            <h2>{d.name}</h2>
            <p>Status: {d.status}</p>
            <p>Available: {d.availableQuantity}</p>
            <button disabled={d.availableQuantity <= 0} onClick={() => handleReserve(d)}>
              Reserve
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Devices() {
  return (
    <AuthReadyGate>
      <DevicesContent />
    </AuthReadyGate>
  );
}
const styles = { card: { padding: "2rem", background: "#222", borderRadius: "10px", marginBottom: "1.5rem" } };
