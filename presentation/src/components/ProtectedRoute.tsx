// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redireciona para o login apropriado baseado no último role conhecido
    const isEmployee =
      user?.role && ["admin", "manager", "attendant"].includes(user.role);
    return (
      <Navigate
        to={isEmployee ? "/admin" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Se o usuário não tem permissão, redireciona para uma página de não autorizado
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
