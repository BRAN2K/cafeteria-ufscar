import api from "./api";

export type EmployeeRole = "admin" | "manager" | "attendant";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: EmployeeRole;
}

interface EmployeeResponse {
  page: number;
  limit: number;
  total: number;
  data: Employee[];
}

export const employeeService = {
  async getEmployees(
    page = 1,
    limit = 10,
    search = ""
  ): Promise<EmployeeResponse> {
    const { data } = await api.get("/employees", {
      params: { page, limit, search },
    });
    return data;
  },

  async getEmployeeById(id: number): Promise<Employee> {
    const { data } = await api.get(`/employees/${id}`);
    return data;
  },

  async createEmployee(
    employee: Omit<Employee, "id"> & { password: string }
  ): Promise<number> {
    const { data } = await api.post("/employees", employee);
    return data.employeeId;
  },

  async updateEmployee(id: number, employee: Partial<Employee>): Promise<void> {
    await api.put(`/employees/${id}`, employee);
  },

  async deleteEmployee(id: number): Promise<void> {
    await api.delete(`/employees/${id}`);
  },

  async updatePassword(
    id: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.put(`/employees/${id}/password`, { oldPassword, newPassword });
  },

  async getEmployeesByRole(role: EmployeeRole): Promise<Employee[]> {
    const { data } = await api.get("/employees", {
      params: { role },
    });
    return data.data;
  },

  // Verificar se email já está em uso
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      await api.post("/employees/check-email", { email });
      return true;
    } catch {
      return false;
    }
  },

  // Exportar lista de funcionários
  async exportEmployees(): Promise<Blob> {
    const response = await api.get("/employees/export", {
      responseType: "blob",
    });
    return response.data;
  },
};
