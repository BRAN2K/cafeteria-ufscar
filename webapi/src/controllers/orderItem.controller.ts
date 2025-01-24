import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import db from "../database";

export class OrderItemController {
  /**
   * Cria um novo item de pedido
   * - Recupera o preço atual do produto e armazena em price_at_order_time
   */
  public async createOrderItem(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { order_id, product_id, quantity } = req.body;

      // Verifica se o pedido existe
      const order = await db("orders").where({ id: order_id }).first();
      if (!order) {
        throw createError.NotFound("Order not found");
      }

      // Verifica se o produto existe
      const product = await db("products").where({ id: product_id }).first();
      if (!product) {
        throw createError.NotFound("Product not found");
      }

      // Insere o registro em order_items
      const [id] = await db("order_items").insert({
        order_id,
        product_id,
        quantity,
        price_at_order_time: product.price,
      });

      res.status(201).json({
        message: "Order item created",
        orderItemId: id,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna lista paginada de itens de pedido
   * - Filtro opcional por order_id para exibir itens de um pedido específico
   */
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

      const offset = (page - 1) * limit;
      let query = db("order_items").select("*");

      if (order_id) {
        query = query.where("order_id", order_id);
      }

      const [countResult] = await query.clone().count({ total: "*" });
      const total = Number(countResult.total) || 0;

      const items = await query.limit(limit).offset(offset);

      res.json({
        page,
        limit,
        total,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna um item de pedido específico pelo ID
   */
  public async getOrderItemById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const orderItem = await db("order_items").where({ id }).first();

      if (!orderItem) {
        throw createError.NotFound("Order item not found");
      }

      res.json(orderItem);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove um item de pedido pelo ID
   */
  public async deleteOrderItem(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const deleted = await db("order_items").where({ id }).del();

      if (!deleted) {
        throw createError.NotFound("Order item not found");
      }

      res.json({ message: "Order item deleted" });
    } catch (error) {
      next(error);
    }
  }
}
