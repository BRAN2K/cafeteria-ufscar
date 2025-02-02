import api from "./api";
import { DashboardStats, DetailedStats } from "../types/dashboard";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>("/dashboard/stats");
    return data;
  },

  async getDetailedStats(
    period: "day" | "week" | "month"
  ): Promise<DetailedStats> {
    const { data } = await api.get<DetailedStats>("/dashboard/stats/detailed", {
      params: { period },
    });
    return data;
  },
};
