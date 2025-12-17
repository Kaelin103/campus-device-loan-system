import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "../components/NavBar";

export default function Login() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    isLoading,
    getAccessTokenSilently
  } = useAuth0();

  async function debugPermissions() {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://cdls-api",
        },
      });

      console.log("Access Token:", token);

      // Decode payload
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Token Payload:", payload);
      alert("Check console for token details! Permissions found: " + JSON.stringify(payload.permissions || []));
    } catch (e) {
      console.error(e);
      alert("Error getting token: " + e.message);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <NavBar />
      <div style={{ padding: "20px" }}>
        <h1>Login Page</h1>

        {!isAuthenticated && (
          <button onClick={() => loginWithRedirect({ authorizationParams: { prompt: "login" } })}>
            Login with Auth0
          </button>
        )}

        {isAuthenticated && (
          <>
            <p>Logged in as {user.email}</p>
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            >
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );
}
