import { useAuth0 } from "@auth0/auth0-react";

export default function AuthReadyGate({ children }) {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <div style={{ padding: 20, color: "white" }}>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        <p>Please log in to access this page.</p>
        <button onClick={() => loginWithRedirect({ authorizationParams: { prompt: "login" } })}>
          Log In
        </button>
      </div>
    );
  }

  // Auth0 完全 ready
  return children;
}
