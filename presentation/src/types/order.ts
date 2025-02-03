export type OrderStatus =
  | "pending"
  | "in_preparation"
  | "delivered"
  | "canceled";

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_order_time: number;
  product: {
    name: string;
    description: string;
  };
}

// src/types/order.ts (ajuste)
export interface Order {
  id: number;
  table_id: number;
  employee_id: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface CreateOrderInput {
  table_id: number;
  employee_id: number;
  items: {
    product_id: number;
    quantity: number;
  }[];
}

// Função auxiliar para calcular o total
export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.price_at_order_time * item.quantity,
    0
  );
}
