import createError from "http-errors";
import db from "../database";

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
}

export class ProductService {
  public async createProduct(data: Product): Promise<number> {
    const [id] = await db("products").insert({
      name: data.name,
      description: data.description ?? "",
      price: data.price,
      stock_quantity: data.stock_quantity,
    });

    return id;
  }

  public async getAllProducts(
    page = 1,
    limit = 10,
    search = ""
  ): Promise<{
    page: number;
    limit: number;
    total: number;
    data: any[];
  }> {
    const offset = (page - 1) * limit;
    let query = db("products");

    if (search) {
      query = query.where("name", "like", `%${search}%`);
    }

    const [countResult] = await query.clone().count({ total: "*" });
    const total = Number(countResult.total) || 0;

    const products = await query.select("*").limit(limit).offset(offset);

    return {
      page,
      limit,
      total,
      data: products,
    };
  }

  public async getProductById(id: number): Promise<any> {
    const product = await db("products").where({ id }).first();

    if (!product) {
      throw createError.NotFound("Product not found");
    }

    return product;
  }

  public async updateProduct(
    id: number,
    data: Partial<Product>
  ): Promise<void> {
    const updatedCount = await db("products").where({ id }).update({
      name: data.name,
      description: data.description,
      price: data.price,
      stock_quantity: data.stock_quantity,
    });

    if (!updatedCount) {
      throw createError.NotFound("Product not found");
    }
  }

  public async deleteProduct(id: number): Promise<void> {
    const deleted = await db("products").where({ id }).del();

    if (!deleted) {
      throw createError.NotFound("Product not found");
    }
  }

  public async increaseStock(id: number, quantity: number): Promise<void> {
    const product = await db("products").where({ id }).first();

    if (!product) {
      throw createError.NotFound("Product not found");
    }

    await db("products").where({ id }).increment("stock_quantity", quantity);
  }

  public async decreaseStock(id: number, quantity: number): Promise<void> {
    const product = await db("products").where({ id }).first();
    if (!product) {
      throw createError.NotFound("Product not found");
    }

    if (product.stock_quantity - quantity < 0) {
      throw createError.BadRequest("Not enough stock to decrease");
    }

    await db("products").where({ id }).decrement("stock_quantity", quantity);
  }
}
