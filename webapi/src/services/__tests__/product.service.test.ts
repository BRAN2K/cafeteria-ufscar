import createError from "http-errors";
import { ProductService, Product } from "../product.service";
import db from "../../database";

// Vamos simular o módulo 'db' com jest.mock
jest.mock("../../database", () => jest.fn());

describe("ProductService", () => {
  let productService: ProductService;
  const dbMock = db as unknown as jest.Mock;

  beforeEach(() => {
    productService = new ProductService();
    // Limpa todos os mocks antes de cada teste
    dbMock.mockReset();
  });

  describe("createProduct", () => {
    it("deve criar um produto e retornar o id inserido", async () => {
      const insertedId = 456;
      // Simula o comportamento de db("products").insert({ ... })
      const mockInsert = jest.fn().mockResolvedValue([insertedId]);
      dbMock.mockReturnValue({ insert: mockInsert });

      const product: Product = {
        name: "Coffee",
        price: 5.0,
        stock_quantity: 100,
        description: "Delicious coffee",
      };

      const id = await productService.createProduct(product);

      expect(id).toBe(insertedId);
      expect(mockInsert).toHaveBeenCalledWith({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        stock_quantity: product.stock_quantity,
      });
    });
  });

  describe("getAllProducts", () => {
    it("deve retornar a paginação e os dados dos produtos (sem filtro de busca)", async () => {
      const page = 1;
      const limit = 10;
      // Mocks para o método encadeado do Knex
      const countMock = jest.fn().mockResolvedValue([{ total: 15 }]);
      const offsetMock = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: "Coffee",
          price: 5,
          stock_quantity: 100,
          description: "Delicious coffee",
        },
      ]);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnValue({ count: countMock }),
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: offsetMock,
          }),
        }),
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await productService.getAllProducts(page, limit, "");

      expect(result).toEqual({
        page,
        limit,
        total: 15,
        data: [
          {
            id: 1,
            name: "Coffee",
            price: 5,
            stock_quantity: 100,
            description: "Delicious coffee",
          },
        ],
      });

      // Verifica se clone e count foram chamados corretamente
      expect(mockQuery.clone).toHaveBeenCalled();
      expect(countMock).toHaveBeenCalledWith({ total: "*" });
      expect(mockQuery.select).toHaveBeenCalledWith("*");
    });

    it("deve aplicar o filtro de busca se search for informado", async () => {
      const page = 1;
      const limit = 10;
      const searchTerm = "Coffee";

      const countMock = jest.fn().mockResolvedValue([{ total: 3 }]);
      const offsetMock = jest.fn().mockResolvedValue([
        {
          id: 2,
          name: "Coffee Latte",
          price: 6,
          stock_quantity: 50,
          description: "Smooth and creamy",
        },
      ]);

      const whereMock = jest.fn().mockReturnThis();

      const mockQuery = {
        where: whereMock,
        clone: jest.fn().mockReturnValue({ count: countMock }),
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: offsetMock,
          }),
        }),
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await productService.getAllProducts(
        page,
        limit,
        searchTerm
      );

      expect(whereMock).toHaveBeenCalledWith("name", "like", `%${searchTerm}%`);
      expect(result).toEqual({
        page,
        limit,
        total: 3,
        data: [
          {
            id: 2,
            name: "Coffee Latte",
            price: 6,
            stock_quantity: 50,
            description: "Smooth and creamy",
          },
        ],
      });
    });
  });

  describe("getProductById", () => {
    it("deve retornar o produto se ele existir", async () => {
      const productId = 1;
      const expectedProduct = {
        id: productId,
        name: "Espresso",
        price: 4,
        stock_quantity: 30,
        description: "Strong and bold",
      };

      const firstMock = jest.fn().mockResolvedValue(expectedProduct);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };

      dbMock.mockReturnValue(mockQuery);

      const product = await productService.getProductById(productId);

      expect(product).toEqual(expectedProduct);
      expect(mockQuery.where).toHaveBeenCalledWith({ id: productId });
      expect(firstMock).toHaveBeenCalled();
    });

    it("deve lançar NotFound se o produto não existir", async () => {
      const productId = 999;

      const firstMock = jest.fn().mockResolvedValue(undefined);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(productService.getProductById(productId)).rejects.toThrow(
        createError.NotFound("Product not found")
      );
    });
  });

  describe("updateProduct", () => {
    it("deve atualizar o produto se ele existir", async () => {
      const productId = 1;
      const updateData: Partial<Product> = {
        name: "Updated Coffee",
        description: "New description",
        price: 5.5,
        stock_quantity: 80,
      };

      const updateMock = jest.fn().mockResolvedValue(1);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(
        productService.updateProduct(productId, updateData)
      ).resolves.toBeUndefined();

      expect(mockQuery.where).toHaveBeenCalledWith({ id: productId });
      expect(updateMock).toHaveBeenCalledWith({
        name: updateData.name,
        description: updateData.description,
        price: updateData.price,
        stock_quantity: updateData.stock_quantity,
      });
    });

    it("deve lançar NotFound se tentar atualizar um produto inexistente", async () => {
      const productId = 999;
      const updateData: Partial<Product> = {
        name: "Non Existent Product",
      };

      const updateMock = jest.fn().mockResolvedValue(0);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(
        productService.updateProduct(productId, updateData)
      ).rejects.toThrow(createError.NotFound("Product not found"));
    });
  });

  describe("deleteProduct", () => {
    it("deve deletar o produto se ele existir", async () => {
      const productId = 1;

      const deleteMock = jest.fn().mockResolvedValue(1);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(
        productService.deleteProduct(productId)
      ).resolves.toBeUndefined();

      expect(mockQuery.where).toHaveBeenCalledWith({ id: productId });
      expect(deleteMock).toHaveBeenCalled();
    });

    it("deve lançar NotFound se tentar deletar um produto inexistente", async () => {
      const productId = 999;

      const deleteMock = jest.fn().mockResolvedValue(0);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(productService.deleteProduct(productId)).rejects.toThrow(
        createError.NotFound("Product not found")
      );
    });
  });

  describe("increaseStock", () => {
    it("deve aumentar o estoque se o produto existir", async () => {
      const productId = 1;
      const quantity = 10;
      const product = {
        id: productId,
        name: "Coffee",
        price: 5,
        stock_quantity: 50,
        description: "Delicious coffee",
      };

      // Primeiro, retorna o produto para a verificação
      const firstMock = jest.fn().mockResolvedValue(product);
      // Em seguida, simula o incremento
      const incrementMock = jest.fn().mockResolvedValue(1);
      const mockQuery1 = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      const mockQuery2 = {
        where: jest.fn().mockReturnThis(),
        increment: incrementMock,
      };

      // Simula as duas chamadas encadeadas
      dbMock.mockReturnValueOnce(mockQuery1).mockReturnValueOnce(mockQuery2);

      await expect(
        productService.increaseStock(productId, quantity)
      ).resolves.toBeUndefined();

      expect(incrementMock).toHaveBeenCalledWith("stock_quantity", quantity);
    });

    it("deve lançar NotFound se o produto não existir", async () => {
      const productId = 999;
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(productService.increaseStock(productId, 5)).rejects.toThrow(
        createError.NotFound("Product not found")
      );
    });
  });

  describe("decreaseStock", () => {
    it("deve diminuir o estoque se o produto existir e houver estoque suficiente", async () => {
      const productId = 1;
      const quantity = 5;
      const product = {
        id: productId,
        name: "Coffee",
        price: 5,
        stock_quantity: 10,
        description: "Delicious coffee",
      };

      const firstMock = jest.fn().mockResolvedValue(product);
      const decrementMock = jest.fn().mockResolvedValue(1);
      const mockQuery1 = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      const mockQuery2 = {
        where: jest.fn().mockReturnThis(),
        decrement: decrementMock,
      };

      dbMock.mockReturnValueOnce(mockQuery1).mockReturnValueOnce(mockQuery2);

      await expect(
        productService.decreaseStock(productId, quantity)
      ).resolves.toBeUndefined();
      expect(decrementMock).toHaveBeenCalledWith("stock_quantity", quantity);
    });

    it("deve lançar BadRequest se não houver estoque suficiente para diminuir", async () => {
      const productId = 1;
      const quantity = 20;
      const product = {
        id: productId,
        name: "Coffee",
        price: 5,
        stock_quantity: 10,
        description: "Delicious coffee",
      };

      const firstMock = jest.fn().mockResolvedValue(product);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(
        productService.decreaseStock(productId, quantity)
      ).rejects.toThrow(createError.BadRequest("Not enough stock to decrease"));
    });

    it("deve lançar NotFound se o produto não existir", async () => {
      const productId = 999;
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(productService.decreaseStock(productId, 5)).rejects.toThrow(
        createError.NotFound("Product not found")
      );
    });
  });
});
