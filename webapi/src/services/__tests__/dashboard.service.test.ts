// src/services/dashboardService.test.ts
import { DashboardService } from "../dashboard.service";
import db from "../../database";
import { DateTime } from "luxon";

jest.mock("../../database", () => jest.fn());

describe("DashboardService", () => {
  let dashboardService: DashboardService;
  const dbMock = db as unknown as jest.Mock;

  (db as any).raw = jest.fn((query: string) => query);

  // Fixando a data "now" para testes
  const fixedNow = DateTime.fromISO("2023-10-01T12:00:00", {
    zone: "America/Sao_Paulo",
  });
  let todayStr: string;
  let todayEndStr: string;
  let weekStartStr: string;
  let weekEndStr: string;

  beforeEach(() => {
    dashboardService = new DashboardService();
    dbMock.mockReset();

    // Espionar DateTime.now e retornar a data fixa
    jest.spyOn(DateTime, "now").mockReturnValue(fixedNow as DateTime<true>);

    const today = fixedNow.startOf("day");
    const todayEnd = fixedNow.endOf("day");
    const weekStart = fixedNow.startOf("week");
    const weekEnd = fixedNow.endOf("week");

    todayStr = today.toFormat("yyyy-MM-dd HH:mm:ss");
    todayEndStr = todayEnd.toFormat("yyyy-MM-dd HH:mm:ss");
    weekStartStr = weekStart.toFormat("yyyy-MM-dd HH:mm:ss");
    weekEndStr = weekEnd.toFormat("yyyy-MM-dd HH:mm:ss");
  });

  describe("getStats", () => {
    it("deve retornar as estatísticas corretamente", async () => {
      // Mocks para as consultas do método getStats

      // 1. Total de pedidos do dia
      const totalOrdersQuery = {
        whereBetween: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: "10" }),
      };

      // 2. Pedidos pendentes
      const pendingOrdersQuery = {
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: "4" }),
      };

      // 3. Pedidos completados hoje
      const completedOrdersQuery = {
        where: jest.fn().mockReturnThis(),
        whereBetween: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: "8" }),
      };

      // 4. Reservas do dia
      const todayReservationsQuery = {
        where: jest.fn().mockReturnThis(),
        whereBetween: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: "6" }),
      };

      // 5. Reservas da semana
      const weekReservationsQuery = {
        where: jest.fn().mockReturnThis(),
        whereBetween: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: "15" }),
      };

      // 6. Produtos com estoque baixo
      const lowStockProductsQuery = {
        where: jest.fn().mockReturnThis(),
        // Encadeia duas condições: primeiro "<=" e depois ">".
        // Podemos simular chamando .where duas vezes. Para simplificar, retornamos o mesmo objeto.
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: "3" }),
      };

      // 7. Produtos esgotados
      const outOfStockProductsQuery = {
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: "2" }),
      };

      // 8. Produtos mais vendidos
      const topSellingProductsQuery = {
        select: jest.fn().mockReturnThis(),
        join: jest.fn().mockReturnThis(),
        whereBetween: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { id: 1, name: "Product A", quantitySold: "20" },
          { id: 2, name: "Product B", quantitySold: "10" },
        ]),
      };

      // Configurando os mocks na ordem em que são chamados no getStats:
      dbMock
        // totalOrders: db("orders")...
        .mockReturnValueOnce(totalOrdersQuery)
        // pendingOrders: db("orders")...
        .mockReturnValueOnce(pendingOrdersQuery)
        // completedOrders: db("orders")...
        .mockReturnValueOnce(completedOrdersQuery)
        // todayReservations: db("reservations")...
        .mockReturnValueOnce(todayReservationsQuery)
        // weekReservations: db("reservations")...
        .mockReturnValueOnce(weekReservationsQuery)
        // lowStockProducts: db("products")...
        .mockReturnValueOnce(lowStockProductsQuery)
        // outOfStockProducts: db("products")...
        .mockReturnValueOnce(outOfStockProductsQuery)
        // topSellingProducts: db("order_items")...
        .mockReturnValueOnce(topSellingProductsQuery);

      const stats = await dashboardService.getStats();

      expect(totalOrdersQuery.whereBetween).toHaveBeenCalledWith("created_at", [
        todayStr,
        todayEndStr,
      ]);
      expect(totalOrdersQuery.count).toHaveBeenCalledWith("* as count");

      expect(pendingOrdersQuery.where).toHaveBeenCalledWith(
        "status",
        "pending"
      );
      expect(pendingOrdersQuery.count).toHaveBeenCalledWith("* as count");

      expect(completedOrdersQuery.where).toHaveBeenCalledWith(
        "status",
        "delivered"
      );
      expect(completedOrdersQuery.whereBetween).toHaveBeenCalledWith(
        "created_at",
        [todayStr, todayEndStr]
      );
      expect(completedOrdersQuery.count).toHaveBeenCalledWith("* as count");

      expect(todayReservationsQuery.where).toHaveBeenCalledWith(
        "status",
        "active"
      );
      expect(todayReservationsQuery.whereBetween).toHaveBeenCalledWith(
        "start_time",
        [todayStr, todayEndStr]
      );

      expect(weekReservationsQuery.where).toHaveBeenCalledWith(
        "status",
        "active"
      );
      expect(weekReservationsQuery.whereBetween).toHaveBeenCalledWith(
        "start_time",
        [weekStartStr, weekEndStr]
      );

      expect(lowStockProductsQuery.where).toHaveBeenCalled(); // Verifica chamadas genéricas
      expect(outOfStockProductsQuery.where).toHaveBeenCalled(); // Verifica chamadas genéricas

      expect(topSellingProductsQuery.select).toHaveBeenCalled();
      expect(topSellingProductsQuery.join).toHaveBeenCalled();
      expect(topSellingProductsQuery.whereBetween).toHaveBeenCalledWith(
        "orders.created_at",
        [todayStr, todayEndStr]
      );
      expect(topSellingProductsQuery.groupBy).toHaveBeenCalled();
      expect(topSellingProductsQuery.orderBy).toHaveBeenCalled();
      expect(topSellingProductsQuery.limit).toHaveBeenCalledWith(5);

      expect(stats).toEqual({
        totalOrders: 10,
        pendingOrders: 4,
        completedOrders: 8,
        todayReservations: 6,
        weekReservations: 15,
        lowStockProducts: 3,
        outOfStockProducts: 2,
        topSellingProducts: [
          { id: 1, name: "Product A", quantitySold: 20 },
          { id: 2, name: "Product B", quantitySold: 10 },
        ],
      });
    });
  });

  describe("getDetailedStats", () => {
    it("deve retornar estatísticas detalhadas para o período 'day'", async () => {
      // Para o período "day", o serviço usa startOf("day") e endOf("day")
      const today = fixedNow.startOf("day");
      const todayEnd = fixedNow.endOf("day");
      const startStr = today.toFormat("yyyy-MM-dd HH:mm:ss");
      const endStr = todayEnd.toFormat("yyyy-MM-dd HH:mm:ss");

      // Mocks para as duas consultas paralelas
      const ordersQuery = {
        whereBetween: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: "12" }),
      };

      const reservationsQuery = {
        where: jest.fn().mockReturnThis(),
        whereBetween: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: "7" }),
      };

      // Como o método getPeriodMetrics usa Promise.all,
      // configuramos duas chamadas consecutivas:
      dbMock
        .mockReturnValueOnce(ordersQuery)
        .mockReturnValueOnce(reservationsQuery);

      const detailedStats = await dashboardService.getDetailedStats("day");

      // Valida as chamadas dos métodos em ordersQuery e reservationsQuery
      expect(ordersQuery.whereBetween).toHaveBeenCalledWith("created_at", [
        startStr,
        endStr,
      ]);
      expect(ordersQuery.count).toHaveBeenCalledWith("* as count");

      expect(reservationsQuery.where).toHaveBeenCalledWith("status", "active");
      expect(reservationsQuery.whereBetween).toHaveBeenCalledWith(
        "start_time",
        [startStr, endStr]
      );

      expect(detailedStats).toEqual({
        period: "day",
        startDate: today.toISO(),
        endDate: todayEnd.toISO(),
        metrics: {
          orders: 12,
          reservations: 7,
        },
      });
    });
  });
});
