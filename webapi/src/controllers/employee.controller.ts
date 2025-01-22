import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import db from "../database";

export class EmployeeController {
  public async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, role } = req.body;
      const [id] = await db("employees").insert({ name, email, role });

      res.status(201).json({
        message: "Employee created",
        employeeId: id,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllEmployees(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
      } = req.query as {
        page?: number;
        limit?: number;
        search?: string;
      };

      const offset = (page - 1) * limit;
      let query = db("employees");

      // Se quiser buscar por nome, e search não for vazio, adicione algo assim:
      if (search) {
        query = query.where("name", "like", `%${search}%`);
      }

      const [countResult] = await query.clone().count({ total: "*" });
      const total = Number(countResult.total) || 0;

      const employees = await query.select("*").limit(limit).offset(offset);

      res.json({
        page,
        limit,
        total,
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getEmployeeById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const employee = await db("employees").where({ id }).first();

      if (!employee) {
        throw createError.NotFound("Employee not found");
      }

      res.json(employee);
    } catch (error) {
      next(error);
    }
  }

  public async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      const updatedCount = await db("employees")
        .where({ id })
        .update({ name, email, role });

      if (!updatedCount) {
        throw createError.NotFound("Employee not found");
      }

      res.json({ message: "Employee updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await db("employees").where({ id }).del();

      if (!deleted) {
        throw createError.NotFound("Employee not found");
      }

      res.json({ message: "Employee deleted" });
    } catch (error) {
      next(error);
    }
  }
}
