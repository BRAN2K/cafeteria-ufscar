import createError from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config/env";
import db from "../database";

interface LoginResult {
  token: string;
}

export class AuthService {
  public async loginEmployee(
    email: string,
    password: string
  ): Promise<LoginResult> {
    const employee = await db("employees").where({ email }).first();
    if (!employee) {
      throw createError.Unauthorized("Funcionário não encontrado");
    }

    const match = await bcrypt.compare(password, employee.password);
    if (!match) {
      throw createError.Unauthorized("Senha inválida");
    }

    const token = jwt.sign(
      {
        sub: employee.id,
        email: employee.email,
        name: employee.name,
        role: employee.role,
        userType: "employee",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token };
  }

  public async loginCustomer(
    email: string,
    password: string
  ): Promise<LoginResult> {
    const customer = await db("customers").where({ email }).first();
    if (!customer) {
      throw createError.Unauthorized("Cliente não encontrado");
    }

    const match = await bcrypt.compare(password, customer.password);
    if (!match) {
      throw createError.Unauthorized("Senha inválida");
    }

    const token = jwt.sign(
      {
        sub: customer.id,
        email: customer.email,
        name: customer.name,
        role: "customer",
        userType: "customer",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token };
  }
}
