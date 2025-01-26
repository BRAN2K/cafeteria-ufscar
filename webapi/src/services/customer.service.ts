import createError from "http-errors";
import bcrypt from "bcrypt";
import db from "../database";

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  password?: string;
}

export class CustomerService {
  public async createCustomer(data: Customer): Promise<number> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password ?? "", saltRounds);

    const [id] = await db("customers").insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: passwordHash,
    });

    return id;
  }

  public async getAllCustomers(
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
    let query = db("customers");

    if (search) {
      query = query.where((builder) => {
        builder
          .where("name", "like", `%${search}%`)
          .orWhere("email", "like", `%${search}%`);
      });
    }

    const [countResult] = await query.clone().count({ total: "*" });
    const total = Number(countResult.total) || 0;

    const customers = await query.select("*").limit(limit).offset(offset);

    return {
      page,
      limit,
      total,
      data: customers,
    };
  }

  public async getCustomerById(id: number): Promise<any> {
    const customer = await db("customers").where({ id }).first();
    if (!customer) {
      throw createError.NotFound("Customer not found");
    }

    return customer;
  }

  public async updateCustomer(
    id: number,
    data: Partial<Customer>
  ): Promise<void> {
    const updatedCount = await db("customers").where({ id }).update({
      name: data.name,
      email: data.email,
      phone: data.phone,
    });

    if (!updatedCount) {
      throw createError.NotFound("Customer not found");
    }
  }

  public async deleteCustomer(id: number): Promise<void> {
    const deleted = await db("customers").where({ id }).del();

    if (!deleted) {
      throw createError.NotFound("Customer not found");
    }
  }
}
