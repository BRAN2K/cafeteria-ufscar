// src/services/employeeService.test.ts
import createError from "http-errors";
import bcrypt from "bcrypt";
import { EmployeeService, Employee } from "../employee.service";
import db from "../../database";

// Mock dos módulos
jest.mock("../../database", () => jest.fn());
jest.mock("bcrypt");

describe("EmployeeService", () => {
  let employeeService: EmployeeService;
  const dbMock = db as unknown as jest.Mock;

  beforeEach(() => {
    employeeService = new EmployeeService();
    // Reset dos mocks antes de cada teste
    dbMock.mockReset();
    (bcrypt.hash as jest.Mock).mockReset();
    (bcrypt.compare as jest.Mock).mockReset();
  });

  describe("createEmployee", () => {
    it("deve criar um funcionário e retornar o id inserido", async () => {
      const fakeHash = "hashedPassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(fakeHash);

      const insertedId = 1;
      const insertMock = jest.fn().mockResolvedValue([insertedId]);
      const query = { insert: insertMock };
      dbMock.mockReturnValue(query);

      const employeeData: Employee = {
        name: "João Silva",
        email: "joao@example.com",
        role: "staff",
        password: "senhaSecreta",
      };

      const id = await employeeService.createEmployee(employeeData);

      expect(bcrypt.hash).toHaveBeenCalledWith("senhaSecreta", 10);
      expect(insertMock).toHaveBeenCalledWith({
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        password: fakeHash,
      });
      expect(id).toBe(insertedId);
    });
  });

  describe("getAllEmployees", () => {
    it("deve retornar paginação e lista de funcionários sem filtro", async () => {
      const page = 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const countMock = jest.fn().mockResolvedValue([{ total: 5 }]);
      const offsetMock = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: "João Silva",
          email: "joao@example.com",
          role: "staff",
        },
      ]);

      // Simulando o encadeamento dos métodos do Knex
      const mockQuery = {
        clone: jest.fn().mockReturnValue({ count: countMock }),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: offsetMock,
      };
      dbMock.mockReturnValue(mockQuery);

      const result = await employeeService.getAllEmployees(page, limit, "");

      expect(result).toEqual({
        page,
        limit,
        total: 5,
        data: [
          {
            id: 1,
            name: "João Silva",
            email: "joao@example.com",
            role: "staff",
          },
        ],
      });
      expect(mockQuery.clone).toHaveBeenCalled();
      expect(countMock).toHaveBeenCalledWith({ total: "*" });
      expect(mockQuery.select).toHaveBeenCalledWith("*");
      expect(mockQuery.limit).toHaveBeenCalledWith(limit);
      expect(offsetMock).toHaveBeenCalledWith(offset);
    });

    it("deve aplicar filtro de busca e retornar funcionários filtrados", async () => {
      const page = 1;
      const limit = 10;
      const search = "João";

      const countMock = jest.fn().mockResolvedValue([{ total: 2 }]);
      const offsetMock = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: "João Silva",
          email: "joao@example.com",
          role: "staff",
        },
      ]);

      const whereMock = jest.fn().mockReturnThis();
      const mockQuery = {
        where: whereMock,
        clone: jest.fn().mockReturnValue({ count: countMock }),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: offsetMock,
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await employeeService.getAllEmployees(page, limit, search);

      expect(whereMock).toHaveBeenCalledWith("name", "like", `%${search}%`);
      expect(result).toEqual({
        page,
        limit,
        total: 2,
        data: [
          {
            id: 1,
            name: "João Silva",
            email: "joao@example.com",
            role: "staff",
          },
        ],
      });
    });
  });

  describe("getEmployeeById", () => {
    it("deve retornar o funcionário se encontrado", async () => {
      const employeeId = 1;
      const employeeFound = {
        id: employeeId,
        name: "João Silva",
        email: "joao@example.com",
        role: "staff",
      };
      const firstMock = jest.fn().mockResolvedValue(employeeFound);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      const result = await employeeService.getEmployeeById(employeeId);

      expect(query.where).toHaveBeenCalledWith({ id: employeeId });
      expect(firstMock).toHaveBeenCalled();
      expect(result).toEqual(employeeFound);
    });

    it("deve lançar NotFound se o funcionário não existir", async () => {
      const employeeId = 999;
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      await expect(
        employeeService.getEmployeeById(employeeId)
      ).rejects.toThrowError(createError.NotFound("Employee not found"));
    });
  });

  describe("updateEmployee", () => {
    it("deve atualizar o funcionário se existir", async () => {
      const employeeId = 1;
      const updateData: Partial<Employee> = {
        name: "João Oliveira",
        email: "joaoo@example.com",
        role: "manager",
      };

      const updateMock = jest.fn().mockResolvedValue(1);
      const query = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValue(query);

      await expect(
        employeeService.updateEmployee(employeeId, updateData)
      ).resolves.toBeUndefined();

      expect(query.where).toHaveBeenCalledWith({ id: employeeId });
      expect(updateMock).toHaveBeenCalledWith({
        name: updateData.name,
        email: updateData.email,
        role: updateData.role,
      });
    });

    it("deve lançar NotFound se tentar atualizar um funcionário inexistente", async () => {
      const employeeId = 999;
      const updateData: Partial<Employee> = { name: "Inexistente" };

      const updateMock = jest.fn().mockResolvedValue(0);
      const query = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValue(query);

      await expect(
        employeeService.updateEmployee(employeeId, updateData)
      ).rejects.toThrowError(createError.NotFound("Employee not found"));
    });
  });

  describe("deleteEmployee", () => {
    it("deve deletar o funcionário se existir", async () => {
      const employeeId = 1;
      const deleteMock = jest.fn().mockResolvedValue(1);
      const query = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };

      dbMock.mockReturnValue(query);

      await expect(
        employeeService.deleteEmployee(employeeId)
      ).resolves.toBeUndefined();

      expect(query.where).toHaveBeenCalledWith({ id: employeeId });
      expect(deleteMock).toHaveBeenCalled();
    });

    it("deve lançar NotFound se tentar deletar um funcionário inexistente", async () => {
      const employeeId = 999;
      const deleteMock = jest.fn().mockResolvedValue(0);
      const query = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };

      dbMock.mockReturnValue(query);

      await expect(
        employeeService.deleteEmployee(employeeId)
      ).rejects.toThrowError(createError.NotFound("Employee not found"));
    });
  });

  describe("updatePassword", () => {
    it("deve atualizar a senha se o funcionário existir e a senha antiga estiver correta", async () => {
      const employeeId = 1;
      const oldPassword = "oldPass";
      const newPassword = "newPass";
      const currentEmployee = { id: employeeId, password: "hashedOldPassword" };

      // Consulta para buscar o funcionário
      const firstMock = jest.fn().mockResolvedValue(currentEmployee);
      const querySelect = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValueOnce(querySelect);

      // Simula senha antiga correta
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const newHash = "hashedNewPassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHash);

      // Simula update retornando sucesso (1)
      const updateMock = jest.fn().mockResolvedValue(1);
      const queryUpdate = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValueOnce(queryUpdate);

      await expect(
        employeeService.updatePassword(employeeId, oldPassword, newPassword)
      ).resolves.toBeUndefined();

      expect(querySelect.where).toHaveBeenCalledWith({ id: employeeId });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        oldPassword,
        currentEmployee.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(queryUpdate.where).toHaveBeenCalledWith({ id: employeeId });
      expect(updateMock).toHaveBeenCalledWith({ password: newHash });
    });

    it("deve lançar NotFound se o funcionário não existir", async () => {
      const employeeId = 999;
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      await expect(
        employeeService.updatePassword(employeeId, "anything", "newPass")
      ).rejects.toThrowError(createError.NotFound("Employee not found"));
    });

    it("deve lançar Unauthorized se a senha antiga estiver incorreta", async () => {
      const employeeId = 1;
      const oldPassword = "wrongPass";
      const newPassword = "newPass";
      const currentEmployee = { id: employeeId, password: "hashedOldPassword" };

      const firstMock = jest.fn().mockResolvedValue(currentEmployee);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        employeeService.updatePassword(employeeId, oldPassword, newPassword)
      ).rejects.toThrowError(
        createError.Unauthorized("Old password is incorrect.")
      );
    });

    it("deve lançar InternalServerError se a atualização não afetar nenhuma linha", async () => {
      const employeeId = 1;
      const oldPassword = "oldPass";
      const newPassword = "newPass";
      const currentEmployee = { id: employeeId, password: "hashedOldPassword" };

      const firstMock = jest.fn().mockResolvedValue(currentEmployee);
      const querySelect = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValueOnce(querySelect);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const newHash = "hashedNewPassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHash);

      const updateMock = jest.fn().mockResolvedValue(0);
      const queryUpdate = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValueOnce(queryUpdate);

      await expect(
        employeeService.updatePassword(employeeId, oldPassword, newPassword)
      ).rejects.toThrowError(
        createError.InternalServerError(
          "Failed to update password. Please try again."
        )
      );
    });
  });
});
