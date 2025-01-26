import { NextFunction, Request, Response } from "express";
import { OrderService } from "../services/order.service";

const orderService = new OrderService();

export class OrderController {
  public async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { table_id, employee_id, items } = req.body;
      const orderId = await orderService.createOrder(
        table_id,
        employee_id,
        items
      );

      res.status(201).json({ message: "Order created", orderId });
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
      const result = await orderService.getAllOrders(search, page, limit);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(Number(id));

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  public async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await orderService.updateOrder(Number(id), status);

      res.json({ message: "Order updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await orderService.deleteOrder(Number(id));

      res.json({ message: "Order deleted" });
    } catch (error) {
      next(error);
    }
  }
}
