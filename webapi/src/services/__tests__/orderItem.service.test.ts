// src/services/orderItemService.test.ts
import createError from "http-errors";
import { OrderItemService } from "../orderItem.service";
import db from "../../database";

// Simula o módulo 'db' com jest.mock
jest.mock("../../database", () => jest.fn());

describe("OrderItemService", () => {
  let orderItemService: OrderItemService;
  const dbMock = db as unknown as jest.Mock;

  beforeEach(() => {
    orderItemService = new OrderItemService();
    // Limpa todos os mocks antes de cada teste
    dbMock.mockReset();
  });

  describe("createOrderItem", () => {
    it("deve criar um item de pedido e retornar o id inserido", async () => {
      const orderId = 1;
      const productId = 2;
      const quantity = 3;
      const productPrice = 10;

      // Primeiro, simula a consulta da order
      const orderFirstMock = jest.fn().mockResolvedValue({ id: orderId });
      const orderQuery = {
        where: jest.fn().mockReturnThis(),
        first: orderFirstMock,
      };

      // Em seguida, simula a consulta do produto
      const productFirstMock = jest
        .fn()
        .mockResolvedValue({ id: productId, price: productPrice });
      const productQuery = {
        where: jest.fn().mockReturnThis(),
        first: productFirstMock,
      };

      // Finalmente, simula a inserção no item de pedido
      const insertedId = 789;
      const insertMock = jest.fn().mockResolvedValue([insertedId]);
      const orderItemsQuery = {
        insert: insertMock,
      };

      // Simular as chamadas sequenciais
      // O primeiro uso: consulta da order
      dbMock.mockReturnValueOnce(orderQuery);
      // O segundo uso: consulta do produto
      dbMock.mockReturnValueOnce(productQuery);
      // O terceiro uso: inserção no order_items
      dbMock.mockReturnValueOnce(orderItemsQuery);

      const result = await orderItemService.createOrderItem(
        orderId,
        productId,
        quantity
      );

      expect(result).toBe(insertedId);
      expect(orderQuery.where).toHaveBeenCalledWith({ id: orderId });
      expect(productQuery.where).toHaveBeenCalledWith({ id: productId });
      expect(insertMock).toHaveBeenCalledWith({
        order_id: orderId,
        product_id: productId,
        quantity,
        price_at_order_time: productPrice,
      });
    });

    it("deve lançar NotFound se a ordem não existir", async () => {
      const orderId = 999;
      const productId = 2;
      const quantity = 3;

      // Simula consulta da order retornando undefined
      const orderFirstMock = jest.fn().mockResolvedValue(undefined);
      const orderQuery = {
        where: jest.fn().mockReturnThis(),
        first: orderFirstMock,
      };

      dbMock.mockReturnValue(orderQuery);

      await expect(
        orderItemService.createOrderItem(orderId, productId, quantity)
      ).rejects.toThrowError(createError.NotFound("Order not found"));
    });

    it("deve lançar NotFound se o produto não existir", async () => {
      const orderId = 1;
      const productId = 999;
      const quantity = 3;

      // Simula consulta da order com sucesso
      const orderFirstMock = jest.fn().mockResolvedValue({ id: orderId });
      const orderQuery = {
        where: jest.fn().mockReturnThis(),
        first: orderFirstMock,
      };

      // Simula consulta do produto retornando undefined
      const productFirstMock = jest.fn().mockResolvedValue(undefined);
      const productQuery = {
        where: jest.fn().mockReturnThis(),
        first: productFirstMock,
      };

      // Configura os mocks: primeiro para order e depois para product
      dbMock.mockReturnValueOnce(orderQuery);
      dbMock.mockReturnValueOnce(productQuery);

      await expect(
        orderItemService.createOrderItem(orderId, productId, quantity)
      ).rejects.toThrowError(createError.NotFound("Product not found"));
    });
  });

  describe("getAllOrderItems", () => {
    it("deve retornar a paginação e os itens do pedido sem filtro de order_id", async () => {
      const page = 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      // Mocks para o método encadeado do Knex
      const countMock = jest.fn().mockResolvedValue([{ total: 5 }]);
      const offsetMock = jest.fn().mockResolvedValue([
        {
          id: 1,
          order_id: 1,
          product_id: 2,
          quantity: 3,
          price_at_order_time: 10,
        },
      ]);

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnValue({ count: countMock }),
        limit: jest.fn().mockReturnThis(),
        offset: offsetMock,
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await orderItemService.getAllOrderItems(
        undefined,
        page,
        limit
      );

      expect(result).toEqual({
        page,
        limit,
        total: 5,
        data: [
          {
            id: 1,
            order_id: 1,
            product_id: 2,
            quantity: 3,
            price_at_order_time: 10,
          },
        ],
      });

      expect(mockQuery.clone).toHaveBeenCalled();
      expect(countMock).toHaveBeenCalledWith({ total: "*" });
      expect(mockQuery.limit).toHaveBeenCalledWith(limit);
    });

    it("deve filtrar os itens do pedido por order_id", async () => {
      const orderId = 2;
      const page = 1;
      const limit = 10;

      const countMock = jest.fn().mockResolvedValue([{ total: 2 }]);
      const offsetMock = jest.fn().mockResolvedValue([
        {
          id: 3,
          order_id: orderId,
          product_id: 4,
          quantity: 1,
          price_at_order_time: 15,
        },
      ]);

      const whereMock = jest.fn().mockReturnThis();
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        where: whereMock,
        clone: jest.fn().mockReturnValue({ count: countMock }),
        limit: jest.fn().mockReturnThis(),
        offset: offsetMock,
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await orderItemService.getAllOrderItems(
        orderId,
        page,
        limit
      );

      expect(whereMock).toHaveBeenCalledWith("order_id", orderId);
      expect(result).toEqual({
        page,
        limit,
        total: 2,
        data: [
          {
            id: 3,
            order_id: orderId,
            product_id: 4,
            quantity: 1,
            price_at_order_time: 15,
          },
        ],
      });
    });
  });

  describe("getOrderItemById", () => {
    it("deve retornar o item do pedido se existir", async () => {
      const orderItemId = 1;
      const expectedItem = {
        id: orderItemId,
        order_id: 1,
        product_id: 2,
        quantity: 3,
        price_at_order_time: 10,
      };

      const firstMock = jest.fn().mockResolvedValue(expectedItem);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await orderItemService.getOrderItemById(orderItemId);

      expect(result).toEqual(expectedItem);
      expect(mockQuery.where).toHaveBeenCalledWith({ id: orderItemId });
      expect(firstMock).toHaveBeenCalled();
    });

    it("deve lançar NotFound se o item do pedido não existir", async () => {
      const orderItemId = 999;
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(
        orderItemService.getOrderItemById(orderItemId)
      ).rejects.toThrowError(createError.NotFound("Order item not found"));
    });
  });

  describe("deleteOrderItem", () => {
    it("deve deletar o item do pedido se existir", async () => {
      const orderItemId = 1;
      const deleteMock = jest.fn().mockResolvedValue(1);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(
        orderItemService.deleteOrderItem(orderItemId)
      ).resolves.toBeUndefined();

      expect(mockQuery.where).toHaveBeenCalledWith({ id: orderItemId });
      expect(deleteMock).toHaveBeenCalled();
    });

    it("deve lançar NotFound se tentar deletar um item de pedido inexistente", async () => {
      const orderItemId = 999;
      const deleteMock = jest.fn().mockResolvedValue(0);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(
        orderItemService.deleteOrderItem(orderItemId)
      ).rejects.toThrowError(createError.NotFound("Order item not found"));
    });
  });
});
