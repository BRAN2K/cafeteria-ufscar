import createError from "http-errors";
import db from "../database";

export class OrderItemService {
  public async createOrderItem(
    order_id: number,
    product_id: number,
    quantity: number
  ): Promise<number> {
    const order = await db("orders").where({ id: order_id }).first();
    if (!order) {
      throw createError.NotFound("Order not found");
    }

    const product = await db("products").where({ id: product_id }).first();
    if (!product) {
      throw createError.NotFound("Product not found");
    }

    const [id] = await db("order_items").insert({
      order_id,
      product_id,
      quantity,
      price_at_order_time: product.price,
    });

    return id;
  }

  public async getAllOrderItems(
    order_id?: number,
    page = 1,
    limit = 10
  ): Promise<{
    page: number;
    limit: number;
    total: number;
    data: any[];
  }> {
    const offset = (page - 1) * limit;
    let query = db("order_items").select("*");

    if (order_id) {
      query = query.where("order_id", order_id);
    }

    const [countResult] = await query.clone().count({ total: "*" });
    const total = Number(countResult.total) || 0;

    const items = await query.limit(limit).offset(offset);

    return {
      page,
      limit,
      total,
      data: items,
    };
  }

  public async getOrderItemById(id: number): Promise<any> {
    const orderItem = await db("order_items").where({ id }).first();

    if (!orderItem) {
      throw createError.NotFound("Order item not found");
    }

    return orderItem;
  }

  public async deleteOrderItem(id: number): Promise<void> {
    const deleted = await db("order_items").where({ id }).del();

    if (!deleted) {
      throw createError.NotFound("Order item not found");
    }
  }
}
