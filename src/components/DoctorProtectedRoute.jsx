import { Navigate, useLocation } from "react-router-dom";

/**
 * Protects doctor dashboard routes. Redirects to /doctor-login if not logged in.
 * Use replace so back button after logout won't return to dashboard.
 */
export default function DoctorProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/doctor-login" state={{ from: location }} replace />;
  }

  return children;
}
