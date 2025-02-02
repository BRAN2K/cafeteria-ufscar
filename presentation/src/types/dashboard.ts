export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  todayReservations: number;
  weekReservations: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  topSellingProducts: {
    id: number;
    name: string;
    quantitySold: number;
  }[];
}

export interface DetailedStats {
  period: "day" | "week" | "month";
  startDate: string;
  endDate: string;
  metrics: {
    orders: number;
    reservations: number;
  };
}
