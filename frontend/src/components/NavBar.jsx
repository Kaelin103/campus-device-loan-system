import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function NavBar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();

  const roles = user?.["https://cdls-api/roles"] || [];
  const isStaff = roles.includes("staff");

  if (isLoading) return null;

  return (
    <nav style={styles.nav}>
      {isAuthenticated ? (
        <span style={{ color: "white", marginRight: "auto" }}>Hello {user?.email}</span>
      ) : (
        <span style={{ color: "white", marginRight: "auto" }}>Not logged in</span>
      )}
      <Link style={styles.link} to="/">Devices</Link>
      <Link style={styles.link} to="/loans">Loans</Link>
      
      {isAuthenticated && isStaff && (
        <Link style={styles.link} to="/staff">Staff</Link>
      )}
      
      {!isAuthenticated ? (
        <Link style={styles.link} to="/login">Login</Link>
      ) : (
        <button
          onClick={() =>
            logout({
              logoutParams: {
                returnTo: window.location.origin,
              },
            })
          }
          style={{ ...styles.link, background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    gap: "2rem",
    padding: "1rem",
    background: "#111",
    fontSize: "1.5rem",
  },
  link: {
    color: "white",
    textDecoration: "none",
  },
};
