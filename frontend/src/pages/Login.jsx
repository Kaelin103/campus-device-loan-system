import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "../components/NavBar";

export default function Login() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    isLoading,
  } = useAuth0();

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
