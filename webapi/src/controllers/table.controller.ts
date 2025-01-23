import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import db from "../database";

export class TableController {
  public async createTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { table_number, capacity, status } = req.body;
      const [id] = await db("tables").insert({
        table_number,
        capacity,
        status,
      });

      res.status(201).json({
        message: "Table created",
        tableId: id,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllTables(req: Request, res: Response, next: NextFunction) {
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
      let query = db("tables");

      // Se quiser filtrar por status ou outro campo, use “search”
      if (search) {
        query = query.where("status", "like", `%${search}%`);
      }

      const [countResult] = await query.clone().count({ total: "*" });
      const total = Number(countResult.total) || 0;

      const tables = await query.select("*").limit(limit).offset(offset);

      res.json({
        page,
        limit,
        total,
        data: tables,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getTableById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const table = await db("tables").where({ id }).first();

      if (!table) {
        throw createError.NotFound("Table not found");
      }

      res.json(table);
    } catch (error) {
      next(error);
    }
  }

  public async updateTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { table_number, capacity, status } = req.body;

      const updatedCount = await db("tables")
        .where({ id })
        .update({ table_number, capacity, status });

      if (!updatedCount) {
        throw createError.NotFound("Table not found");
      }

      res.json({ message: "Table updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await db("tables").where({ id }).del();

      if (!deleted) {
        throw createError.NotFound("Table not found");
      }

      res.json({ message: "Table deleted" });
    } catch (error) {
      next(error);
    }
  }
}
