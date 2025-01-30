// src/services/product.service.ts
import api from "./api";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
}

export interface ProductResponse {
  page: number;
  limit: number;
  total: number;
  data: Product[];
}

export const productService = {
  async getProducts(
    page = 1,
    limit = 10,
    search = ""
  ): Promise<ProductResponse> {
    const { data } = await api.get("/products", {
      params: { page, limit, search },
    });
    return data;
  },

  async getProductById(id: number): Promise<Product> {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  async createProduct(product: Omit<Product, "id">): Promise<number> {
    const { data } = await api.post("/products", product);
    return data.productId;
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<number> {
    await api.put(`/products/${id}`, product);
    return id;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async increaseStock(id: number, quantity: number): Promise<void> {
    await api.post(`/products/${id}/increase`, { quantity });
  },

  async decreaseStock(id: number, quantity: number): Promise<void> {
    await api.post(`/products/${id}/decrease`, { quantity });
  },
};
