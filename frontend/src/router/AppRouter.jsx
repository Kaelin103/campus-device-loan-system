import { Routes, Route } from "react-router-dom";
import Devices from "../pages/Devices";
import Loan from "../pages/Loan";
import Staff from "../pages/Staff";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import { AuthProvider } from "../context/AuthContext";

export default function AppRouter() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Devices />} />
        <Route path="/loans" element={<Loan />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
