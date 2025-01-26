import createError from "http-errors";
import db from "../database";

export interface Table {
  id?: number;
  table_number: number;
  capacity: number;
  status: string; // 'available', 'reserved', 'occupied'
}

export class TableService {
  public async createTable(data: Table): Promise<number> {
    const [id] = await db("tables").insert({
      table_number: data.table_number,
      capacity: data.capacity,
      status: data.status,
    });

    return id;
  }

  public async getAllTables(
    page = 1,
    limit = 10,
    search = ""
  ): Promise<{
    page: number;
    limit: number;
    total: number;
    data: any[];
  }> {
    const offset = (page - 1) * limit;
    let query = db("tables");

    if (search) {
      query = query.where("status", "like", `%${search}%`);
    }

    const [countResult] = await query.clone().count({ total: "*" });
    const total = Number(countResult.total) || 0;

    const tables = await query.select("*").limit(limit).offset(offset);

    return {
      page,
      limit,
      total,
      data: tables,
    };
  }

  public async getTableById(id: number): Promise<any> {
    const table = await db("tables").where({ id }).first();

    if (!table) {
      throw createError.NotFound("Table not found");
    }

    return table;
  }

  public async updateTable(id: number, data: Partial<Table>): Promise<void> {
    const updatedCount = await db("tables").where({ id }).update({
      table_number: data.table_number,
      capacity: data.capacity,
      status: data.status,
    });

    if (!updatedCount) {
      throw createError.NotFound("Table not found");
    }
  }

  public async deleteTable(id: number): Promise<void> {
    const deleted = await db("tables").where({ id }).del();

    if (!deleted) {
      throw createError.NotFound("Table not found");
    }
  }
}
