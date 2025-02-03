import { Routes, Route, Navigate } from "react-router-dom";
import { CustomerLogin } from "./pages/Login/CustomerLogin";
import { EmployeeLogin } from "./pages/Login/EmployeeLogin";
import { Dashboard } from "./pages/Dashboard";
import { Unauthorized } from "./pages/Unauthorized";
import { MainLayout } from "./components/Layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { Products } from "./pages/Products";
import { ProductForm } from "./pages/Products/ProductForm";
import { Reservations } from "./pages/Reservations";
import { ReservationForm } from "./pages/Reservations/ReservationForm";
import { Customers } from "./pages/Customers";
import { CustomerForm } from "./pages/Customers/CustomerForm";
import { Employees } from "./pages/Employees";
import { EmployeeForm } from "./pages/Employees/EmployeeForm";
import { Inventory } from "./pages/Inventory";
import { Tables } from "./pages/Tables";
import { TableForm } from "./pages/Tables/TableForm";

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

      {/* Rotas protegidas - Produtos */}
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <Products />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <ProductForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <ProductForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - Rotas de Reservas */}
      <Route
        path="/reservations"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <MainLayout>
              <Reservations />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <MainLayout>
              <ReservationForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <MainLayout>
              <ReservationForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - Clientes */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <Customers />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <CustomerForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <CustomerForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - Funcionários */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            {" "}
            // Apenas admin pode gerenciar funcionários
            <MainLayout>
              <Employees />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/new"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout>
              <EmployeeForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout>
              <EmployeeForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <Inventory />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas de Mesas */}
      <Route
        path="/tables"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <Tables />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tables/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <TableForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tables/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <MainLayout>
              <TableForm />
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
