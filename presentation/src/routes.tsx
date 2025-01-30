// src/routes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { CustomerLogin } from "./pages/Login/CustomerLogin";
import { EmployeeLogin } from "./pages/Login/EmployeeLogin";
import { Dashboard } from "./pages/Dashboard";
import { Unauthorized } from "./pages/Unauthorized";
import { MainLayout } from "./components/Layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

export function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rota principal redireciona para dashboard se autenticado, senão para login */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Rotas de login */}
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/admin" element={<EmployeeLogin />} />

      {/* Página de não autorizado */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rotas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Página 404 */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
