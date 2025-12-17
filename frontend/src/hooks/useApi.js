import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";

export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  const apiFetch = useCallback(async (path, options = {}) => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: "https://cdls-api",
      },
    });

    const isAbsolute = path.startsWith("http");
    // If path starts with /api-device, treat it as ready-to-go relative path (bypass /api prefix)
    const isProxyReady = path.startsWith("/api-device");

    const url = isAbsolute || isProxyReady ? path : `/api${path}`;

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }, [getAccessTokenSilently]);

  return { apiFetch };
}
