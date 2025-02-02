import db from "../database";
import { DateTime } from "luxon";

export class DashboardService {
  public async getStats() {
    const now = DateTime.now().setZone("America/Sao_Paulo");

    // Início e fim do dia atual
    const today = now.startOf("day");
    const todayEnd = now.endOf("day");

    // Início e fim da semana
    const weekStart = now.startOf("week");
    const weekEnd = now.endOf("week");

    // Formatando as datas para o formato aceito pelo MySQL
    const todayStr = today.toFormat("yyyy-MM-dd HH:mm:ss");
    const todayEndStr = todayEnd.toFormat("yyyy-MM-dd HH:mm:ss");
    const weekStartStr = weekStart.toFormat("yyyy-MM-dd HH:mm:ss");
    const weekEndStr = weekEnd.toFormat("yyyy-MM-dd HH:mm:ss");

    // Total de pedidos do dia
    const totalOrders = await db("orders")
      .whereBetween("created_at", [todayStr, todayEndStr])
      .count("* as count")
      .first();

    // Pedidos pendentes
    const pendingOrders = await db("orders")
      .where("status", "pending")
      .count("* as count")
      .first();

    // Pedidos completados hoje
    const completedOrders = await db("orders")
      .where("status", "delivered")
      .whereBetween("created_at", [todayStr, todayEndStr])
      .count("* as count")
      .first();

    // Reservas do dia
    const todayReservations = await db("reservations")
      .where("status", "active")
      .whereBetween("start_time", [todayStr, todayEndStr])
      .count("* as count")
      .first();

    // Reservas da semana
    const weekReservations = await db("reservations")
      .where("status", "active")
      .whereBetween("start_time", [weekStartStr, weekEndStr])
      .count("* as count")
      .first();

    // Produtos com estoque baixo (menos de 10 unidades)
    const lowStockProducts = await db("products")
      .where("stock_quantity", "<=", 10)
      .where("stock_quantity", ">", 0)
      .count("* as count")
      .first();

    // Produtos esgotados
    const outOfStockProducts = await db("products")
      .where("stock_quantity", 0)
      .count("* as count")
      .first();

    // Produtos mais vendidos
    const topSellingProducts = await db("order_items")
      .select(
        "products.id",
        "products.name",
        db.raw("SUM(order_items.quantity) as quantitySold")
      )
      .join("products", "order_items.product_id", "products.id")
      .join("orders", "order_items.order_id", "orders.id")
      .whereBetween("orders.created_at", [todayStr, todayEndStr])
      .groupBy("products.id", "products.name")
      .orderBy("quantitySold", "desc")
      .limit(5);

    return {
      totalOrders: Number(totalOrders?.count) || 0,
      pendingOrders: Number(pendingOrders?.count) || 0,
      completedOrders: Number(completedOrders?.count) || 0,
      todayReservations: Number(todayReservations?.count) || 0,
      weekReservations: Number(weekReservations?.count) || 0,
      lowStockProducts: Number(lowStockProducts?.count) || 0,
      outOfStockProducts: Number(outOfStockProducts?.count) || 0,
      topSellingProducts: topSellingProducts.map((product) => ({
        id: product.id,
        name: product.name,
        quantitySold: Number(product.quantitySold),
      })),
    };
  }

  // Método auxiliar para obter métricas específicas de período
  private async getPeriodMetrics(startDate: DateTime, endDate: DateTime) {
    const startStr = startDate.toFormat("yyyy-MM-dd HH:mm:ss");
    const endStr = endDate.toFormat("yyyy-MM-dd HH:mm:ss");

    const [orders, reservations] = await Promise.all([
      db("orders")
        .whereBetween("created_at", [startStr, endStr])
        .count("* as count")
        .first(),
      db("reservations")
        .where("status", "active")
        .whereBetween("start_time", [startStr, endStr])
        .count("* as count")
        .first(),
    ]);

    return {
      orders: Number(orders?.count) || 0,
      reservations: Number(reservations?.count) || 0,
    };
  }

  // Método para obter estatísticas detalhadas por período (pode ser útil para futuras expansões)
  public async getDetailedStats(period: "day" | "week" | "month") {
    const now = DateTime.now().setZone("America/Sao_Paulo");
    let startDate: DateTime;
    let endDate: DateTime;

    switch (period) {
      case "week":
        startDate = now.startOf("week");
        endDate = now.endOf("week");
        break;
      case "month":
        startDate = now.startOf("month");
        endDate = now.endOf("month");
        break;
      case "day":
      default:
        startDate = now.startOf("day");
        endDate = now.endOf("day");
        break;
    }

    const metrics = await this.getPeriodMetrics(startDate, endDate);

    return {
      period,
      startDate: startDate.toISO(),
      endDate: endDate.toISO(),
      metrics,
    };
  }
}
