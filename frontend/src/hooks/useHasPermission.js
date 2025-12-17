import { useAuth0 } from "@auth0/auth0-react";

export function useHasPermission(requiredPermission) {
  const { isAuthenticated, user } = useAuth0();

  if (!isAuthenticated) return false;

  // Note: This relies on permissions being present in the ID Token (user object).
  // Standard Auth0 RBAC puts permissions in the Access Token. 
  // If this returns false unexpectedly, check if an Auth0 Action is mapping permissions to the ID Token.
  const permissions = user?.permissions || [];
  return permissions.includes(requiredPermission);
}
