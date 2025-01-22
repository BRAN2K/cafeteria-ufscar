import { NextFunction, Request, RequestHandler, Response } from "express";
import createError from "http-errors";
import db from "../database";

export class OrderController {
  public async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { table_id, employee_id } = req.body;
      const [id] = await db("orders").insert({ table_id, employee_id });

      res.status(201).json({ message: "Order created", orderId: id });
    } catch (error) {
      next(error);
    }
  }

  public async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        search = "",
        page = 1,
        limit = 10,
      } = req.query as {
        search?: string;
        page?: number;
        limit?: number;
      };

      const offset = (page - 1) * limit;

      let query = db("orders");

      if (search) {
        query = query.where("status", "like", `%${search}%`);
      }

      const [countResult] = await query.clone().count({ total: "*" });
      const total = Number(countResult.total) || 0;

      const orders = await query.select("*").limit(limit).offset(offset);

      res.json({
        page,
        limit,
        total,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await db("orders").where({ id }).first();

      if (!order) {
        throw createError.NotFound("Order not found");
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  public async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedCount = await db("orders").where({ id }).update({ status });
      if (!updatedCount) {
        throw createError.NotFound("Order not found");
      }

      res.json({ message: "Order updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await db("orders").where({ id }).del();

      if (!deleted) {
        throw createError.NotFound("Order not found");
      }

      res.json({ message: "Order deleted" });
    } catch (error) {
      next(error);
    }
  }
}
