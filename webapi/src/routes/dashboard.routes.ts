// src/routes/dashboard.routes.ts
import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { checkAuth } from "../middlewares/checkAuth";
import { checkRole } from "../middlewares/checkRole";

const router = Router();
const dashboardController = new DashboardController();

/**
 * @openapi
 * /dashboard/stats:
 *   get:
 *     summary: Retorna estatísticas gerais para o dashboard
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: number
 *                 pendingOrders:
 *                   type: number
 *                 completedOrders:
 *                   type: number
 *                 todayReservations:
 *                   type: number
 *                 weekReservations:
 *                   type: number
 *                 lowStockProducts:
 *                   type: number
 *                 outOfStockProducts:
 *                   type: number
 *                 topSellingProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       name:
 *                         type: string
 *                       quantitySold:
 *                         type: number
 */
router.get(
  "/stats",
  checkAuth,
  checkRole(["admin", "manager", "attendant"]),
  (req, res, next) => dashboardController.getStats(req, res, next)
);

/**
 * @openapi
 * /dashboard/stats/detailed:
 *   get:
 *     summary: Retorna estatísticas detalhadas por período
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Período para as estatísticas
 *     responses:
 *       200:
 *         description: Estatísticas detalhadas do período
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                 endDate:
 *                   type: string
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: number
 *                     reservations:
 *                       type: number
 */
router.get(
  "/stats/detailed",
  checkAuth,
  checkRole(["admin", "manager"]),
  (req, res, next) => dashboardController.getDetailedStats(req, res, next)
);

export default router;
