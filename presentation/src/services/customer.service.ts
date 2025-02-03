import api from "./api";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface CustomerResponse {
  page: number;
  limit: number;
  total: number;
  data: Customer[];
}

export const customerService = {
  async getCustomers(
    page = 1,
    limit = 10,
    search = ""
  ): Promise<CustomerResponse> {
    const { data } = await api.get("/customers", {
      params: { page, limit, search },
    });
    return data;
  },

  async getCustomerById(id: number): Promise<Customer> {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  async createCustomer(customer: Omit<Customer, "id">): Promise<number> {
    const { data } = await api.post("/customers", customer);
    return data.customerId;
  },

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<void> {
    await api.put(`/customers/${id}`, customer);
  },

  async deleteCustomer(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async updatePassword(
    id: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.put(`/customers/${id}/password`, { oldPassword, newPassword });
  },
};
