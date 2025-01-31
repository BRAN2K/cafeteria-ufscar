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
  async getAllCustomers(page = 1, limit = 100): Promise<CustomerResponse> {
    const { data } = await api.get("/customers", {
      params: { page, limit },
    });
    return data;
  },

  async getCustomerById(id: number): Promise<Customer> {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },
};
