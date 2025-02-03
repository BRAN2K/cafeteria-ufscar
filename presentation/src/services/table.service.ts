import api from "./api";

export interface Table {
  id: number;
  table_number: number;
  capacity: number;
  status: "available" | "unavailable";
  created_at?: string;
}

interface TableResponse {
  page: number;
  limit: number;
  total: number;
  data: Table[];
}

export const tableService = {
  async getTables(page = 1, limit = 10, search = ""): Promise<TableResponse> {
    const { data } = await api.get("/tables", {
      params: { page, limit, search },
    });
    return data;
  },

  async getTableById(id: number): Promise<Table> {
    const { data } = await api.get(`/tables/${id}`);
    return data;
  },

  async createTable(table: Omit<Table, "id">): Promise<number> {
    const { data } = await api.post("/tables", table);
    return data.tableId;
  },

  async updateTable(id: number, table: Partial<Table>): Promise<void> {
    await api.put(`/tables/${id}`, table);
  },

  async deleteTable(id: number): Promise<void> {
    await api.delete(`/tables/${id}`);
  },
};
