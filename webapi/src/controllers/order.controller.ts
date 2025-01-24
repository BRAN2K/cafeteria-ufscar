import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import db from "../database";

export class OrderController {
  public async createOrder(req: Request, res: Response, next: NextFunction) {
    const { table_id, employee_id, items } = req.body;

    const trx = await db.transaction();
    try {
      const [orderId] = await trx("orders").insert({ table_id, employee_id });

      for (const item of items) {
        const { product_id, quantity } = item;

        const product = await trx("products").where({ id: product_id }).first();
        if (!product) {
          throw createError.NotFound(`Product not found: ID ${product_id}`);
        }

        if (product.stock_quantity < quantity) {
          throw createError.BadRequest(
            `Not enough stock for product ID ${product_id}`
          );
        }

        await trx("order_items").insert({
          order_id: orderId,
          product_id,
          quantity,
          price_at_order_time: product.price,
        });

        await trx("products")
          .where({ id: product_id })
          .decrement("stock_quantity", quantity);
      }

      await trx.commit();

      res.status(201).json({ message: "Order created", orderId });
    } catch (error) {
      await trx.rollback();
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

      let baseQuery = db("orders");

      if (search) {
        baseQuery = baseQuery.where("status", "like", `%${search}%`);
      }

      const countQuery = baseQuery
        .clone()
        .clearSelect()
        .clearOrder()
        .count({ total: "*" });
      const [countResult] = await countQuery;
      const total = Number(countResult.total) || 0;

      const orders = await baseQuery.select("*").limit(limit).offset(offset);

      for (const order of orders) {
        const orderItems = await db("order_items")
          .select(
            "order_items.id as order_item_id",
            "order_items.quantity",
            "order_items.price_at_order_time",
            "products.id as product_id",
            "products.name",
            "products.description",
            "products.price",
            "products.stock_quantity"
          )
          .join("products", "order_items.product_id", "products.id")
          .where("order_items.order_id", order.id);

        order.items = orderItems.map((oi: any) => ({
          id: oi.order_item_id,
          quantity: oi.quantity,
          price_at_order_time: oi.price_at_order_time,
          product: {
            id: oi.product_id,
            name: oi.name,
            description: oi.description,
            price: oi.price,
            stock_quantity: oi.stock_quantity,
          },
        }));
      }

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

      // Busca itens completos
      const orderItems = await db("order_items")
        .select(
          "order_items.id as order_item_id",
          "order_items.quantity",
          "order_items.price_at_order_time",
          "products.id as product_id",
          "products.name",
          "products.description",
          "products.price",
          "products.stock_quantity"
        )
        .join("products", "order_items.product_id", "products.id")
        .where("order_items.order_id", id);

      order.items = orderItems.map((oi: any) => ({
        id: oi.order_item_id,
        quantity: oi.quantity,
        price_at_order_time: oi.price_at_order_time,
        product: {
          id: oi.product_id,
          name: oi.name,
          description: oi.description,
          price: oi.price,
          stock_quantity: oi.stock_quantity,
        },
      }));

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
