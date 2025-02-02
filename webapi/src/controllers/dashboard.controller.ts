import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";

const dashboardService = new DashboardService();

export class DashboardController {
  public async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  public async getDetailedStats(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { period = "day" } = req.query;
      const stats = await dashboardService.getDetailedStats(
        period as "day" | "week" | "month"
      );
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
