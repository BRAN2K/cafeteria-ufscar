import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export function RedirectIfAuthenticated({
  children,
}: RedirectIfAuthenticatedProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Se estiver autenticado, redireciona para a última página ou dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
