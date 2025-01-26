import { NextFunction, Request, Response } from "express";
import { OrderItemService } from "../services/orderItem.service";

const orderItemService = new OrderItemService();

export class OrderItemController {
  public async createOrderItem(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { order_id, product_id, quantity } = req.body;
      const orderItemId = await orderItemService.createOrderItem(
        order_id,
        product_id,
        quantity
      );

      res.status(201).json({
        message: "Order item created",
        orderItemId,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllOrderItems(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        order_id,
      } = req.query as {
        page?: number;
        limit?: number;
        order_id?: string;
      };

      const result = await orderItemService.getAllOrderItems(
        order_id ? Number(order_id) : undefined,
        page,
        limit
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getOrderItemById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const orderItem = await orderItemService.getOrderItemById(Number(id));

      res.json(orderItem);
    } catch (error) {
      next(error);
    }
  }

  public async deleteOrderItem(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      await orderItemService.deleteOrderItem(Number(id));

      res.json({ message: "Order item deleted" });
    } catch (error) {
      next(error);
    }
  }
}
