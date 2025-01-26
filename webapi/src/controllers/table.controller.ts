import { NextFunction, Request, Response } from "express";
import { TableService } from "../services/table.service";

const tableService = new TableService();

export class TableController {
  public async createTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { table_number, capacity, status } = req.body;
      const tableId = await tableService.createTable({
        table_number,
        capacity,
        status,
      });

      res.status(201).json({
        message: "Table created",
        tableId,
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
      const result = await tableService.getAllTables(page, limit, search);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getTableById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const table = await tableService.getTableById(Number(id));

      res.json(table);
    } catch (error) {
      next(error);
    }
  }

  public async updateTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { table_number, capacity, status } = req.body;
      await tableService.updateTable(Number(id), {
        table_number,
        capacity,
        status,
      });

      res.json({ message: "Table updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await tableService.deleteTable(Number(id));

      res.json({ message: "Table deleted" });
    } catch (error) {
      next(error);
    }
  }
}
