import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import db from "../database";

export class CustomerController {
  public async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone } = req.body;
      const [id] = await db("customers").insert({ name, email, phone });

      res.status(201).json({
        message: "Customer created",
        customerId: id,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllCustomers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Se quiser paginação, obtemos page, limit e search do req.query
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
      let query = db("customers");

      // Exemplo: filtrar por nome ou email
      if (search) {
        query = query.where((builder) => {
          builder
            .where("name", "like", `%${search}%`)
            .orWhere("email", "like", `%${search}%`);
        });
      }

      // Pega contagem total
      const [countResult] = await query.clone().count({ total: "*" });
      const total = Number(countResult.total) || 0;

      // Aplica paginação
      const customers = await query.select("*").limit(limit).offset(offset);

      res.json({
        page,
        limit,
        total,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getCustomerById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const customer = await db("customers").where({ id }).first();

      if (!customer) {
        throw createError.NotFound("Customer not found");
      }

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  public async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;

      const updatedCount = await db("customers")
        .where({ id })
        .update({ name, email, phone });

      if (!updatedCount) {
        throw createError.NotFound("Customer not found");
      }

      res.json({ message: "Customer updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await db("customers").where({ id }).del();

      if (!deleted) {
        throw createError.NotFound("Customer not found");
      }

      res.json({ message: "Customer deleted" });
    } catch (error) {
      next(error);
    }
  }
}
