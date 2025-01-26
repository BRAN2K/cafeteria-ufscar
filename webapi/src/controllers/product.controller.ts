import { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export class ProductController {
  public async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, stock_quantity } = req.body;
      const productId = await productService.createProduct({
        name,
        description,
        price,
        stock_quantity,
      });

      res.status(201).json({
        message: "Product created",
        productId,
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
      const result = await productService.getAllProducts(page, limit, search);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(Number(id));

      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  public async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, price, stock_quantity } = req.body;
      await productService.updateProduct(Number(id), {
        name,
        description,
        price,
        stock_quantity,
      });

      res.json({ message: "Product updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(Number(id));

      res.json({ message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  }

  public async increaseStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      await productService.increaseStock(Number(id), quantity);

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
      await productService.decreaseStock(Number(id), quantity);

      res.json({
        message: `Stock decreased by ${quantity}`,
      });
    } catch (error) {
      next(error);
    }
  }
}
