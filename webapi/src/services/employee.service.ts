import createError from "http-errors";
import bcrypt from "bcrypt";
import db from "../database";

export interface Employee {
  id?: number;
  name: string;
  email: string;
  role: string;
  password?: string;
}

export class EmployeeService {
  public async createEmployee(data: Employee): Promise<number> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password ?? "", saltRounds);

    const [id] = await db("employees").insert({
      name: data.name,
      email: data.email,
      role: data.role,
      password: passwordHash,
    });

    return id;
  }

  public async getAllEmployees(
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
    let query = db("employees");

    if (search) {
      query = query.where("name", "like", `%${search}%`);
    }

    const [countResult] = await query.clone().count({ total: "*" });
    const total = Number(countResult.total) || 0;

    const employees = await query.select("*").limit(limit).offset(offset);

    return {
      page,
      limit,
      total,
      data: employees,
    };
  }

  public async getEmployeeById(id: number): Promise<any> {
    const employee = await db("employees").where({ id }).first();
    if (!employee) {
      throw createError.NotFound("Employee not found");
    }

    return employee;
  }

  public async updateEmployee(
    id: number,
    data: Partial<Employee>
  ): Promise<void> {
    const updatedCount = await db("employees").where({ id }).update({
      name: data.name,
      email: data.email,
      role: data.role,
    });

    if (!updatedCount) {
      throw createError.NotFound("Employee not found");
    }
  }

  public async deleteEmployee(id: number): Promise<void> {
    const deleted = await db("employees").where({ id }).del();

    if (!deleted) {
      throw createError.NotFound("Employee not found");
    }
  }
}
