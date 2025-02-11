import createError from "http-errors";
import db from "../../database";
import { OrderService } from "../order.service";

// Vamos simular o módulo "db"
jest.mock("../../database", () => jest.fn());

interface TrxMock {
  (tableName: string): any;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

describe("OrderService", () => {
  let orderService: OrderService;
  const dbMock = db as unknown as jest.Mock;

  beforeEach(() => {
    orderService = new OrderService();
    dbMock.mockReset();
  });

  describe("createOrder", () => {
    it("deve criar uma ordem, inserir os itens e atualizar o estoque, retornando o orderId", async () => {
      const table_id = 1;
      const employee_id = 10;
      const items = [{ product_id: 100, quantity: 2 }];

      // Order ID que será retornado na inserção da ordem
      const createdOrderId = 101;

      // Mocks para a transação
      // Cria um objeto trx simulado, que é uma função mock que recebe o nome da tabela e retorna
      // um objeto com os métodos necessários (insert, where, first, decrement).
      const ordersInsertMock = jest.fn().mockResolvedValue([createdOrderId]);
      const productFirstMock = jest.fn().mockResolvedValue({
        id: 100,
        price: 20,
        stock_quantity: 10,
      });
      const orderItemsInsertMock = jest.fn().mockResolvedValue([1]);
      const productDecrementMock = jest.fn().mockResolvedValue(1);

      // Criamos um mock para o método "where" para a tabela "products".
      // Aqui, para simplificar, a mesma implementação é utilizada para ambas as chamadas:
      // a consulta para buscar o produto (com .first()) e a atualização do estoque (com .decrement()).
      const productsWhereMock = jest.fn().mockReturnValue({
        first: productFirstMock,
        decrement: productDecrementMock,
      });

      // A função simulada da transação: quando chamada com um nome de tabela, retorna um objeto com os métodos
      // configurados conforme abaixo.
      const trxMockFn: any = jest.fn((tableName: string) => {
        if (tableName === "orders") {
          return { insert: ordersInsertMock };
        } else if (tableName === "products") {
          return { where: productsWhereMock };
        } else if (tableName === "order_items") {
          return { insert: orderItemsInsertMock };
        }
        return {};
      }) as unknown as TrxMock;

      // Adiciona os mocks de commit e rollback na transação
      trxMockFn.commit = jest.fn().mockResolvedValue(undefined);
      trxMockFn.rollback = jest.fn().mockResolvedValue(undefined);

      (db as any).transaction = jest.fn().mockResolvedValue(trxMockFn);

      // Simula o retorno da transação utilizando db.transaction()
      dbMock.mockResolvedValue(trxMockFn);

      const orderId = await orderService.createOrder(
        table_id,
        employee_id,
        items
      );

      // Verificações:
      // 1. A transação foi iniciada chamando db.transaction()
      expect(db.transaction).toHaveBeenCalled();

      // 2. Inserção da ordem foi realizada, retornando o orderId
      expect(ordersInsertMock).toHaveBeenCalledWith({
        table_id,
        employee_id,
      });

      // 3. Para cada item, foi realizada a consulta do produto
      expect(productsWhereMock).toHaveBeenCalledWith({
        id: items[0].product_id,
      });
      expect(productFirstMock).toHaveBeenCalled();

      // 4. Foi inserido o item na tabela "order_items"
      expect(orderItemsInsertMock).toHaveBeenCalledWith({
        order_id: createdOrderId,
        product_id: items[0].product_id,
        quantity: items[0].quantity,
        price_at_order_time: 20, // preço do produto
      });

      // 5. Foi executado o decrement do estoque
      expect(productDecrementMock).toHaveBeenCalledWith(
        "stock_quantity",
        items[0].quantity
      );

      // 6. Commit foi chamado na transação
      expect(trxMockFn.commit).toHaveBeenCalled();

      expect(orderId).toBe(createdOrderId);
    });

    it("deve lançar NotFound se algum produto não for encontrado e fazer rollback", async () => {
      const table_id = 1;
      const employee_id = 10;
      const items = [{ product_id: 200, quantity: 1 }];

      // Simula a transação
      const ordersInsertMock = jest.fn().mockResolvedValue([111]);
      // Aqui, a consulta retorna undefined simulando produto não encontrado
      const productFirstMock = jest.fn().mockResolvedValue(undefined);
      const productsWhereMock = jest.fn().mockReturnValue({
        first: productFirstMock,
      });
      const trxMockFn = jest.fn((tableName: string) => {
        if (tableName === "orders") {
          return { insert: ordersInsertMock };
        } else if (tableName === "products") {
          return { where: productsWhereMock };
        }
        return {};
      }) as unknown as TrxMock;

      trxMockFn.commit = jest.fn();
      trxMockFn.rollback = jest.fn().mockResolvedValue(undefined);

      (db as any).transaction = jest.fn().mockResolvedValue(trxMockFn);

      dbMock.mockResolvedValue(trxMockFn);

      // Como o produto não é encontrado, espera-se que seja lançado NotFound.
      await expect(
        orderService.createOrder(table_id, employee_id, items)
      ).rejects.toThrow(
        createError.NotFound(`Product not found: ID ${items[0].product_id}`)
      );

      // Rollback deve ter sido chamado
      expect(trxMockFn.rollback).toHaveBeenCalled();
    });

    it("deve lançar BadRequest se não houver estoque suficiente e fazer rollback", async () => {
      const table_id = 1;
      const employee_id = 10;
      const items = [{ product_id: 300, quantity: 5 }];

      const ordersInsertMock = jest.fn().mockResolvedValue([121]);
      // Simula produto encontrado, mas com estoque inferior à quantidade solicitada
      const productFirstMock = jest.fn().mockResolvedValue({
        id: 300,
        price: 15,
        stock_quantity: 2,
      });
      const productsWhereMock = jest.fn().mockReturnValue({
        first: productFirstMock,
      });
      const trxMockFn = jest.fn((tableName: string) => {
        if (tableName === "orders") {
          return { insert: ordersInsertMock };
        } else if (tableName === "products") {
          return { where: productsWhereMock };
        }
        return {};
      }) as unknown as TrxMock;

      trxMockFn.commit = jest.fn();
      trxMockFn.rollback = jest.fn().mockResolvedValue(undefined);

      (db as any).transaction = jest.fn().mockResolvedValue(trxMockFn);

      dbMock.mockResolvedValue(trxMockFn);

      await expect(
        orderService.createOrder(table_id, employee_id, items)
      ).rejects.toThrow(
        createError.BadRequest(
          `Not enough stock for product ID ${items[0].product_id}`
        )
      );

      expect(trxMockFn.rollback).toHaveBeenCalled();
    });
  });

  describe("getAllOrders", () => {
    it("deve retornar paginação, total de orders e incluir os itens de cada ordem", async () => {
      const page = 1;
      const limit = 10;
      const offset = 0;

      // Mock para a query base em orders
      const countMock = jest.fn().mockResolvedValue([{ total: 2 }]);
      const offsetMock = jest.fn().mockResolvedValue([
        { id: 1, status: "pending" },
        { id: 2, status: "delivered" },
      ]);
      const baseQueryMock = {
        clone: jest.fn().mockReturnThis(),
        clearSelect: jest.fn().mockReturnThis(),
        clearOrder: jest.fn().mockReturnThis(),
        count: countMock,
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: offsetMock,
        where: jest.fn().mockReturnThis(),
      };

      // Quando db("orders") for chamado, retorna a query base
      dbMock.mockReturnValue(baseQueryMock);

      // Para cada ordem, simula a query para obter os itens
      const orderItemsArray = [
        {
          order_item_id: 10,
          quantity: 2,
          price_at_order_time: 20,
          product_id: 100,
          name: "Produto X",
          description: "Descrição X",
          price: 20,
          stock_quantity: 50,
        },
      ];
      // Quando a query para order_items for realizada, retornamos o mock apropriado
      const orderItemsQueryMock = {
        select: jest.fn().mockReturnThis(),
        join: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(orderItemsArray),
      };
      // Como getAllOrders chama db("order_items") separadamente,
      // configuramos o dbMock para que na próxima chamada retorne o mock para order_items.
      dbMock.mockImplementation((tableName: string) => {
        if (tableName === "orders") {
          return baseQueryMock; // seu objeto baseQueryMock já definido para "orders"
        }
        if (tableName === "order_items") {
          return orderItemsQueryMock;
        }
        return {};
      });

      const result = await orderService.getAllOrders("", page, limit);

      expect(baseQueryMock.clone).toHaveBeenCalled();
      expect(countMock).toHaveBeenCalledWith({ total: "*" });
      expect(baseQueryMock.select).toHaveBeenCalledWith("*");
      expect(baseQueryMock.limit).toHaveBeenCalledWith(limit);
      expect(offsetMock).toHaveBeenCalledWith(offset);

      // Verifica que para cada ordem, a query de order_items foi feita
      expect(orderItemsQueryMock.join).toHaveBeenCalled();
      expect(orderItemsQueryMock.where).toHaveBeenCalledWith(
        "order_items.order_id",
        1
      );

      // Verificação simplificada do resultado final
      const expected = {
        page,
        limit,
        total: 2,
        data: [
          {
            id: 1,
            status: "pending",
            items: [
              {
                id: 10,
                quantity: 2,
                price_at_order_time: 20,
                product: {
                  id: 100,
                  name: "Produto X",
                  description: "Descrição X",
                  price: 20,
                  stock_quantity: 50,
                },
              },
            ],
          },
          // A segunda ordem (id: 2) também seria populada com itens se a query de order_items fosse chamada para ela.
        ],
      };
      // Como criamos apenas a query para a primeira ordem em getAllOrders (os mocks podem ser ajustados para múltiplos),
      // validamos que o total e a estrutura geral estão corretos.
      expect(result.page).toBe(expected.page);
      expect(result.limit).toBe(expected.limit);
      expect(result.total).toBe(expected.total);
      // Exemplo: para o primeiro order
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].items[0].id).toBe(10);
    });
  });

  describe("getOrderById", () => {
    it("deve retornar a ordem e seus itens se encontrada", async () => {
      const orderId = 55;
      const orderFound = { id: orderId, status: "pending" };
      const firstMock = jest.fn().mockResolvedValue(orderFound);
      const orderQueryMock = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(orderQueryMock);

      // Mock para obter os itens do pedido
      const orderItemsArray = [
        {
          order_item_id: 20,
          quantity: 3,
          price_at_order_time: 30,
          product_id: 200,
          name: "Produto Y",
          description: "Descrição Y",
          price: 30,
          stock_quantity: 40,
        },
      ];
      const orderItemsQueryMock = {
        select: jest.fn().mockReturnThis(),
        join: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnValue(orderItemsArray),
      };
      // Para a chamada interna de order items:
      dbMock.mockImplementation((tableName: string) => {
        if (tableName === "orders") {
          return orderQueryMock; // seu mock para a ordem
        }
        if (tableName === "order_items") {
          return orderItemsQueryMock;
        }
        return {};
      });

      const result = await orderService.getOrderById(orderId);

      expect(orderQueryMock.where).toHaveBeenCalledWith({ id: orderId });
      expect(firstMock).toHaveBeenCalled();
      expect(orderItemsQueryMock.join).toHaveBeenCalled();
      expect(orderItemsQueryMock.where).toHaveBeenCalledWith(
        "order_items.order_id",
        orderId
      );

      expect(result.id).toBe(orderId);
      expect(result.items[0]).toEqual({
        id: 20,
        quantity: 3,
        price_at_order_time: 30,
        product: {
          id: 200,
          name: "Produto Y",
          description: "Descrição Y",
          price: 30,
          stock_quantity: 40,
        },
      });
    });

    it("deve lançar NotFound se a ordem não for encontrada", async () => {
      const orderId = 999;
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const orderQueryMock = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(orderQueryMock);

      await expect(orderService.getOrderById(orderId)).rejects.toThrow(
        createError.NotFound("Order not found")
      );
    });
  });

  describe("updateOrder", () => {
    it("deve atualizar o status da ordem se ela existir", async () => {
      const orderId = 10;
      const newStatus = "delivered";
      const updateMock = jest.fn().mockResolvedValue(1);
      const queryMock = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValue(queryMock);

      await expect(
        orderService.updateOrder(orderId, newStatus)
      ).resolves.toBeUndefined();

      expect(queryMock.where).toHaveBeenCalledWith({ id: orderId });
      expect(updateMock).toHaveBeenCalledWith({ status: newStatus });
    });

    it("deve lançar NotFound se tentar atualizar uma ordem inexistente", async () => {
      const orderId = 999;
      const newStatus = "cancelled";
      const updateMock = jest.fn().mockResolvedValue(0);
      const queryMock = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValue(queryMock);

      await expect(
        orderService.updateOrder(orderId, newStatus)
      ).rejects.toThrow(createError.NotFound("Order not found"));
    });
  });

  describe("deleteOrder", () => {
    it("deve deletar a ordem se ela existir", async () => {
      const orderId = 15;
      const deleteMock = jest.fn().mockResolvedValue(1);
      const queryMock = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };
      dbMock.mockReturnValue(queryMock);

      await expect(orderService.deleteOrder(orderId)).resolves.toBeUndefined();

      expect(queryMock.where).toHaveBeenCalledWith({ id: orderId });
      expect(deleteMock).toHaveBeenCalled();
    });

    it("deve lançar NotFound se tentar deletar uma ordem inexistente", async () => {
      const orderId = 888;
      const deleteMock = jest.fn().mockResolvedValue(0);
      const queryMock = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };
      dbMock.mockReturnValue(queryMock);

      await expect(orderService.deleteOrder(orderId)).rejects.toThrow(
        createError.NotFound("Order not found")
      );
    });
  });
});
