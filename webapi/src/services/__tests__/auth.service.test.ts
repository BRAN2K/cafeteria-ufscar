// src/services/authService.test.ts
import createError from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthService } from "../auth.service";
import db from "../../database";
import { JWT_SECRET } from "../../config/env";

// Mock dos módulos
jest.mock("../../database", () => jest.fn());
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {
  let authService: AuthService;
  const dbMock = db as unknown as jest.Mock;

  beforeEach(() => {
    authService = new AuthService();
    dbMock.mockReset();
    (bcrypt.compare as jest.Mock).mockReset();
    (jwt.sign as jest.Mock).mockReset();
  });

  describe("loginEmployee", () => {
    const email = "employee@example.com";
    const password = "password123";

    it("deve retornar um token se o funcionário existir e a senha corresponder", async () => {
      const employee = {
        id: 1,
        email,
        name: "John Doe",
        role: "manager",
        password: "hashedPassword",
      };
      const fakeToken = "fake-jwt-token";

      // Mock para a consulta de funcionário: db("employees").where({ email }).first()
      const firstMock = jest.fn().mockResolvedValue(employee);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      // Mock do bcrypt para comparar senha: retorna true
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock do jwt para gerar um token
      (jwt.sign as jest.Mock).mockReturnValue(fakeToken);

      const result = await authService.loginEmployee(email, password);

      expect(query.where).toHaveBeenCalledWith({ email });
      expect(firstMock).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, employee.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: employee.id,
          email: employee.email,
          name: employee.name,
          role: employee.role,
          userType: "employee",
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(result).toEqual({ token: fakeToken });
    });

    it("deve lançar Unauthorized se o funcionário não for encontrado", async () => {
      // Simula consulta retornando undefined para funcionário
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      await expect(authService.loginEmployee(email, password)).rejects.toThrow(
        createError.Unauthorized("Funcionário não encontrado")
      );
    });

    it("deve lançar Unauthorized se a senha estiver incorreta", async () => {
      const employee = {
        id: 1,
        email,
        name: "John Doe",
        role: "manager",
        password: "hashedPassword",
      };

      const firstMock = jest.fn().mockResolvedValue(employee);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      // Simula bcrypt.compare retornando false
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.loginEmployee(email, password)).rejects.toThrow(
        createError.Unauthorized("Senha inválida")
      );
    });
  });

  describe("loginCustomer", () => {
    const email = "customer@example.com";
    const password = "password456";

    it("deve retornar um token se o cliente existir e a senha corresponder", async () => {
      const customer = {
        id: 2,
        email,
        name: "Jane Doe",
        password: "hashedPassword",
      };
      const fakeToken = "fake-jwt-token-customer";

      // Mock para a consulta de clientes: db("customers").where({ email }).first()
      const firstMock = jest.fn().mockResolvedValue(customer);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(fakeToken);

      const result = await authService.loginCustomer(email, password);

      expect(query.where).toHaveBeenCalledWith({ email });
      expect(firstMock).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, customer.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          role: "customer",
          userType: "customer",
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(result).toEqual({ token: fakeToken });
    });

    it("deve lançar Unauthorized se o cliente não for encontrado", async () => {
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      await expect(authService.loginCustomer(email, password)).rejects.toThrow(
        createError.Unauthorized("Cliente não encontrado")
      );
    });

    it("deve lançar Unauthorized se a senha estiver incorreta para o cliente", async () => {
      const customer = {
        id: 2,
        email,
        name: "Jane Doe",
        password: "hashedPassword",
      };

      const firstMock = jest.fn().mockResolvedValue(customer);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.loginCustomer(email, password)).rejects.toThrow(
        createError.Unauthorized("Senha inválida")
      );
    });
  });
});
