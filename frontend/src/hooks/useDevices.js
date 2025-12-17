import { useEffect, useState } from "react";
export function useDevices(apiFetch) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  async function loadDevices() {
    setLoading(true);
    try {
      const res = await apiFetch("/devices");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDevices(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadDevices();
  }, []);
  return { devices, loading, reloadDevices: loadDevices };
}

