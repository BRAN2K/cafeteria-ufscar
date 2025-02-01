import { createContext, useContext, useState, useEffect } from "react";
import { Employee } from "../services/employee.service";
import { useAuth } from "./AuthContext";
import { employeeService } from "../services/employee.service";

interface EmployeeContextType {
  currentEmployee: Employee | null;
  loading: boolean;
  refreshEmployee: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshEmployee = async () => {
    if (user?.id) {
      try {
        const employee = await employeeService.getEmployeeById(user.id);
        setCurrentEmployee(employee);
      } catch (error) {
        console.error("Erro ao carregar dados do funcionário:", error);
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshEmployee().finally(() => setLoading(false));
    } else {
      setCurrentEmployee(null);
      setLoading(false);
    }
  }, [user?.id]);

  return (
    <EmployeeContext.Provider
      value={{ currentEmployee, loading, refreshEmployee }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
}
