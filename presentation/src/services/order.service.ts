import api from "./api";
import { CreateOrderInput, Order, OrderStatus } from "../types/order";

interface OrderResponse {
  page: number;
  limit: number;
  total: number;
  data: Order[];
}

export const orderService = {
  async getOrders(
    page = 1,
    limit = 10,
    status?: OrderStatus
  ): Promise<OrderResponse> {
    const { data } = await api.get("/orders", {
      params: { page, limit, status },
    });
    return data;
  },

  async getOrderById(id: number): Promise<Order> {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
    await api.put(`/orders/${id}`, { status });
  },

  async cancelOrder(id: number): Promise<void> {
    await api.put(`/orders/${id}`, { status: "canceled" });
  },

  async createOrder(data: CreateOrderInput): Promise<number> {
    const response = await api.post("/orders", data);
    return response.data.orderId;
  },
};
