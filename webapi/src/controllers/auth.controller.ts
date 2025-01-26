import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config/env";
import db from "../database";

export class AuthController {
  public async loginEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

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
          role: employee.role,
          userType: "employee",
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    } catch (error) {
      next(error);
    }
  }

  public async loginCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

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
          role: "customer",
          userType: "customer",
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
}
