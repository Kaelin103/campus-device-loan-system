import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export function useGlobalRefresh(refreshFns = []) {
  const location = useLocation();
  useEffect(() => {
    refreshFns.forEach((fn) => {
      if (typeof fn === "function") {
        fn();
      }
    });
  }, [location.pathname]);
}
