import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoader from "../components/common/PageLoader.jsx";
import { useAuth } from "../hooks/useAuth.js";

// Wraps private routes. allowedRoles: e.g. ["student"]. Leave it out to allow any logged-in user.
export default function ProtectedRoute({ allowedRoles }) {
     const { user, loading } = useAuth();
     const location = useLocation();

     // We don't know yet whether the saved token is valid
     if (loading) return <PageLoader label="Checking your session..." />;

     if (!user) {
          return <Navigate to="/login" replace state={{ from: location }} />;
     }

     if (allowedRoles && !allowedRoles.includes(user.role)) {
          return <Navigate to="/403" replace />;
     }

     return <Outlet />;
}
