import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import db from "../database";

export class ProductController {
  public async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, stock_quantity } = req.body;
      const [id] = await db("products").insert({
        name,
        description,
        price,
        stock_quantity,
      });

      res.status(201).json({
        message: "Product created",
        productId: id,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllProducts(req: Request, res: Response, next: NextFunction) {
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
      let query = db("products");

      if (search) {
        query = query.where("name", "like", `%${search}%`);
      }

      const [countResult] = await query.clone().count({ total: "*" });
      const total = Number(countResult.total) || 0;

      const products = await query.select("*").limit(limit).offset(offset);

      res.json({
        page,
        limit,
        total,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await db("products").where({ id }).first();

      if (!product) {
        throw createError.NotFound("Product not found");
      }

      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  public async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, price, stock_quantity } = req.body;

      const updatedCount = await db("products")
        .where({ id })
        .update({ name, description, price, stock_quantity });

      if (!updatedCount) {
        throw createError.NotFound("Product not found");
      }

      res.json({ message: "Product updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await db("products").where({ id }).del();

      if (!deleted) {
        throw createError.NotFound("Product not found");
      }

      res.json({ message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  }

  public async increaseStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const product = await db("products").where({ id }).first();
      if (!product) {
        throw createError.NotFound("Product not found");
      }

      await db("products").where({ id }).increment("stock_quantity", quantity);

      res.json({
        message: `Stock increased by ${quantity}`,
      });
    } catch (error) {
      next(error);
    }
  }

  public async decreaseStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const product = await db("products").where({ id }).first();
      if (!product) {
        throw createError.NotFound("Product not found");
      }

      if (product.stock_quantity - quantity < 0) {
        throw createError.BadRequest("Not enough stock to decrease");
      }

      await db("products").where({ id }).decrement("stock_quantity", quantity);

      res.json({
        message: `Stock decreased by ${quantity}`,
      });
    } catch (error) {
      next(error);
    }
  }
}
