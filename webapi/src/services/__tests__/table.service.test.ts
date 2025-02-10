// src/services/tableService.test.ts
import createError from "http-errors";
import { TableService, Table } from "../table.service";
import db from "../../database";

// Vamos simular o módulo 'db' com jest.mock
jest.mock("../../database", () => jest.fn());

describe("TableService", () => {
  let tableService: TableService;
  const dbMock = db as unknown as jest.Mock;

  beforeEach(() => {
    tableService = new TableService();
    // Limpa todos os mocks antes de cada teste
    dbMock.mockReset();
  });

  describe("createTable", () => {
    it("deve criar uma mesa e retornar o id inserido", async () => {
      const insertedId = 123;
      // Simula o comportamento de db("tables").insert({ ... })
      const mockInsert = jest.fn().mockResolvedValue([insertedId]);
      dbMock.mockReturnValue({ insert: mockInsert });

      const table: Table = {
        table_number: 1,
        capacity: 4,
        status: "available",
      };
      const id = await tableService.createTable(table);

      expect(id).toBe(insertedId);
      expect(mockInsert).toHaveBeenCalledWith({
        table_number: table.table_number,
        capacity: table.capacity,
        status: table.status,
      });
    });
  });

  describe("getAllTables", () => {
    it("deve retornar a paginação e os dados das mesas (sem filtro de busca)", async () => {
      const page = 1;
      const limit = 10;
      // Mocks para o método encadeado do Knex
      const countMock = jest.fn().mockResolvedValue([{ total: 20 }]);
      const offsetMock = jest
        .fn()
        .mockResolvedValue([
          { id: 1, table_number: 1, capacity: 4, status: "available" },
        ]);

      const mockQuery = {
        // Quando for chamado o where, mas como não há filtro, esse método não deve ser usado.
        where: jest.fn().mockReturnThis(),
        // O clone é utilizado para pegar o count
        clone: jest.fn().mockReturnValue({ count: countMock }),
        // select retorna um objeto com limit encadeado que depois chama offset
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: offsetMock,
          }),
        }),
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await tableService.getAllTables(page, limit, "");

      expect(result).toEqual({
        page,
        limit,
        total: 20,
        data: [{ id: 1, table_number: 1, capacity: 4, status: "available" }],
      });

      // Verifica se clone e count foram chamados corretamente
      expect(mockQuery.clone).toHaveBeenCalled();
      expect(countMock).toHaveBeenCalledWith({ total: "*" });
      // Verifica se select foi chamado
      expect(mockQuery.select).toHaveBeenCalledWith("*");
    });

    it("deve aplicar o filtro de busca se search for informado", async () => {
      const page = 1;
      const limit = 10;
      const searchTerm = "available";

      const countMock = jest.fn().mockResolvedValue([{ total: 5 }]);
      const offsetMock = jest
        .fn()
        .mockResolvedValue([
          { id: 2, table_number: 2, capacity: 6, status: "available" },
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

      const result = await tableService.getAllTables(page, limit, searchTerm);

      expect(whereMock).toHaveBeenCalledWith(
        "status",
        "like",
        `%${searchTerm}%`
      );
      expect(result).toEqual({
        page,
        limit,
        total: 5,
        data: [{ id: 2, table_number: 2, capacity: 6, status: "available" }],
      });
    });
  });

  describe("getTableById", () => {
    it("deve retornar a tabela se ela existir", async () => {
      const tableId = 1;
      const expectedTable = {
        id: tableId,
        table_number: 1,
        capacity: 4,
        status: "available",
      };

      const firstMock = jest.fn().mockResolvedValue(expectedTable);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await tableService.getTableById(tableId);

      expect(result).toEqual(expectedTable);
      expect(mockQuery.where).toHaveBeenCalledWith({ id: tableId });
      expect(firstMock).toHaveBeenCalled();
    });

    it("deve lançar NotFound se a tabela não existir", async () => {
      const tableId = 999;

      const firstMock = jest.fn().mockResolvedValue(undefined);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(tableService.getTableById(tableId)).rejects.toThrowError(
        createError.NotFound("Table not found")
      );
    });
  });

  describe("updateTable", () => {
    it("deve atualizar a tabela se ela existir", async () => {
      const tableId = 1;
      const updateData: Partial<Table> = {
        capacity: 8,
        status: "unavailable",
        table_number: 2,
      };

      // Simula update retornando 1 (atualização bem sucedida)
      const updateMock = jest.fn().mockResolvedValue(1);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(
        tableService.updateTable(tableId, updateData)
      ).resolves.toBeUndefined();

      expect(mockQuery.where).toHaveBeenCalledWith({ id: tableId });
      expect(updateMock).toHaveBeenCalledWith({
        table_number: updateData.table_number,
        capacity: updateData.capacity,
        status: updateData.status,
      });
    });

    it("deve lançar NotFound se tentar atualizar uma tabela inexistente", async () => {
      const tableId = 999;
      const updateData: Partial<Table> = {
        capacity: 8,
        status: "unavailable",
        table_number: 2,
      };

      // Simula update retornando 0 (nenhuma linha atualizada)
      const updateMock = jest.fn().mockResolvedValue(0);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(
        tableService.updateTable(tableId, updateData)
      ).rejects.toThrowError(createError.NotFound("Table not found"));
    });
  });

  describe("deleteTable", () => {
    it("deve deletar a tabela se ela existir", async () => {
      const tableId = 1;

      const deleteMock = jest.fn().mockResolvedValue(1);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(tableService.deleteTable(tableId)).resolves.toBeUndefined();

      expect(mockQuery.where).toHaveBeenCalledWith({ id: tableId });
      expect(deleteMock).toHaveBeenCalled();
    });

    it("deve lançar NotFound se tentar deletar uma tabela inexistente", async () => {
      const tableId = 999;

      const deleteMock = jest.fn().mockResolvedValue(0);
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };

      dbMock.mockReturnValue(mockQuery);

      await expect(tableService.deleteTable(tableId)).rejects.toThrowError(
        createError.NotFound("Table not found")
      );
    });
  });
});
