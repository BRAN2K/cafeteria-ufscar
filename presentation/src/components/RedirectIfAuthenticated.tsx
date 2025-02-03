import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export function RedirectIfAuthenticated({
  children,
}: RedirectIfAuthenticatedProps) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const isCustomer = user?.role === "customer";
    const defaultPath = isCustomer ? "/customer/reservations" : "/dashboard";
    return <Navigate to={defaultPath} replace />;
  }

  return <>{children}</>;
}
