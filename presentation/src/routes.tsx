import { Routes, Route, Navigate } from "react-router-dom";
import { CustomerLogin } from "./pages/Login/CustomerLogin";
import { EmployeeLogin } from "./pages/Login/EmployeeLogin";
import { Dashboard } from "./pages/Dashboard";
import { Unauthorized } from "./pages/Unauthorized";
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
import { Orders } from "./pages/Orders";
import { OrderDetails } from "./pages/Orders/OrderDetails";
import { CreateOrder } from "./pages/Orders/OrderForm";
import { StaffLayout, CustomerLayout } from "./components/Layout";
import { CustomerReservations } from "./pages/Customer/Reservations";

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
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rotas de Cliente */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerLayout>
              <div></div>
              {/* <CustomerDashboard /> */}
            </CustomerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/reservations"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerLayout>
              <CustomerReservations />
            </CustomerLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas de Funcionário */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <StaffLayout>
              <Dashboard />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      {/* Produtos */}
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <Products />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <ProductForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <ProductForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - Rotas de Reservas */}
      <Route
        path="/reservations"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <StaffLayout>
              <Reservations />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <StaffLayout>
              <ReservationForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <StaffLayout>
              <ReservationForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - Clientes */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <Customers />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <CustomerForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <CustomerForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - Funcionários */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <StaffLayout>
              <Employees />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/new"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <StaffLayout>
              <EmployeeForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <StaffLayout>
              <EmployeeForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <Inventory />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas de Mesas */}
      <Route
        path="/tables"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <Tables />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tables/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <TableForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tables/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <StaffLayout>
              <TableForm />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas de Pedidos */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <StaffLayout>
              <Orders />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <StaffLayout>
              <OrderDetails />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "attendant"]}>
            <StaffLayout>
              <CreateOrder />
            </StaffLayout>
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
