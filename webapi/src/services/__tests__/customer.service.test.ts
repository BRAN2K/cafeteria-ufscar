import createError from "http-errors";
import bcrypt from "bcrypt";
import { CustomerService, Customer } from "../customer.service";
import db from "../../database";

// Simula o módulo 'db' e 'bcrypt'
jest.mock("../../database", () => jest.fn());
jest.mock("bcrypt");

describe("CustomerService", () => {
  let customerService: CustomerService;
  const dbMock = db as unknown as jest.Mock;

  beforeEach(() => {
    customerService = new CustomerService();
    dbMock.mockReset();
    (bcrypt.hash as jest.Mock).mockReset();
    (bcrypt.compare as jest.Mock).mockReset();
  });

  describe("createCustomer", () => {
    it("deve criar um cliente e retornar o id inserido", async () => {
      // Simula o hash da senha
      const fakeHash = "fake-hash";
      (bcrypt.hash as jest.Mock).mockResolvedValue(fakeHash);

      // Simula a inserção e retorno do id
      const insertedId = 101;
      const insertMock = jest.fn().mockResolvedValue([insertedId]);
      const query = { insert: insertMock };

      dbMock.mockReturnValue(query);

      const customerData: Customer = {
        name: "Maria Silva",
        email: "maria@example.com",
        phone: "123456789",
        password: "minhaSenha",
      };

      const id = await customerService.createCustomer(customerData);

      expect(bcrypt.hash).toHaveBeenCalledWith("minhaSenha", 10);
      expect(insertMock).toHaveBeenCalledWith({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        password: fakeHash,
      });
      expect(id).toBe(insertedId);
    });
  });

  describe("getAllCustomers", () => {
    it("deve retornar paginação e lista de clientes sem filtro de busca", async () => {
      const page = 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const countMock = jest.fn().mockResolvedValue([{ total: 20 }]);
      const offsetMock = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: "Maria Silva",
          email: "maria@example.com",
          phone: "123456789",
          password: "fake-hash",
        },
      ]);

      // Simula o encadeamento de métodos do Knex
      const mockQuery = {
        clone: jest.fn().mockReturnValue({ count: countMock }),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: offsetMock,
        // Quando não há filtro, o método where não será chamado explicitamente
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await customerService.getAllCustomers(page, limit, "");

      expect(result).toEqual({
        page,
        limit,
        total: 20,
        data: [
          {
            id: 1,
            name: "Maria Silva",
            email: "maria@example.com",
            phone: "123456789",
            password: "fake-hash",
          },
        ],
      });
      expect(mockQuery.clone).toHaveBeenCalled();
      expect(countMock).toHaveBeenCalledWith({ total: "*" });
      expect(mockQuery.limit).toHaveBeenCalledWith(limit);
      expect(offsetMock).toHaveBeenCalledWith(offset);
    });

    it("deve aplicar filtro de busca e retornar os clientes filtrados", async () => {
      const page = 1;
      const limit = 10;
      const search = "Maria";

      const countMock = jest.fn().mockResolvedValue([{ total: 5 }]);
      const offsetMock = jest.fn().mockResolvedValue([
        {
          id: 2,
          name: "Maria Oliveira",
          email: "mariao@example.com",
          phone: "987654321",
          password: "fake-hash",
        },
      ]);

      // Cria um mock para o builder usado no where
      const builderMock = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
      };

      // O método where receberá uma função que deverá ser invocada com o builder
      const whereFnMock = jest.fn((fn: (builder: any) => void) => {
        fn(builderMock);
        return mockQuery;
      });

      const mockQuery: any = {
        where: whereFnMock,
        clone: jest.fn().mockReturnValue({ count: countMock }),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: offsetMock,
      };

      dbMock.mockReturnValue(mockQuery);

      const result = await customerService.getAllCustomers(page, limit, search);

      // Verifica se a função passada para where foi chamada e se os métodos do builder foram usados
      expect(whereFnMock).toHaveBeenCalled();
      expect(builderMock.where).toHaveBeenCalledWith(
        "name",
        "like",
        `%${search}%`
      );
      expect(builderMock.orWhere).toHaveBeenCalledWith(
        "email",
        "like",
        `%${search}%`
      );

      expect(result).toEqual({
        page,
        limit,
        total: 5,
        data: [
          {
            id: 2,
            name: "Maria Oliveira",
            email: "mariao@example.com",
            phone: "987654321",
            password: "fake-hash",
          },
        ],
      });
    });
  });

  describe("getCustomerById", () => {
    it("deve retornar o cliente se encontrado", async () => {
      const customerId = 1;
      const customerFound = {
        id: customerId,
        name: "Maria Silva",
        email: "maria@example.com",
        phone: "123456789",
        password: "fake-hash",
      };
      const firstMock = jest.fn().mockResolvedValue(customerFound);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      const result = await customerService.getCustomerById(customerId);
      expect(query.where).toHaveBeenCalledWith({ id: customerId });
      expect(firstMock).toHaveBeenCalled();
      expect(result).toEqual(customerFound);
    });

    it("deve lançar NotFound se o cliente não existir", async () => {
      const customerId = 999;
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      await expect(customerService.getCustomerById(customerId)).rejects.toThrow(
        createError.NotFound("Customer not found")
      );
    });
  });

  describe("updateCustomer", () => {
    it("deve atualizar o cliente se existir", async () => {
      const customerId = 1;
      const updateData: Partial<Customer> = {
        name: "Maria Souza",
        email: "marias@example.com",
        phone: "555555555",
      };

      const updateMock = jest.fn().mockResolvedValue(1);
      const query = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValue(query);

      await expect(
        customerService.updateCustomer(customerId, updateData)
      ).resolves.toBeUndefined();

      expect(query.where).toHaveBeenCalledWith({ id: customerId });
      expect(updateMock).toHaveBeenCalledWith({
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
      });
    });

    it("deve lançar NotFound se tentar atualizar um cliente inexistente", async () => {
      const customerId = 999;
      const updateData: Partial<Customer> = {
        name: "Cliente Inexistente",
      };

      const updateMock = jest.fn().mockResolvedValue(0);
      const query = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValue(query);

      await expect(
        customerService.updateCustomer(customerId, updateData)
      ).rejects.toThrow(createError.NotFound("Customer not found"));
    });
  });

  describe("deleteCustomer", () => {
    it("deve deletar o cliente se existir", async () => {
      const customerId = 1;
      const deleteMock = jest.fn().mockResolvedValue(1);
      const query = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };
      dbMock.mockReturnValue(query);

      await expect(
        customerService.deleteCustomer(customerId)
      ).resolves.toBeUndefined();

      expect(query.where).toHaveBeenCalledWith({ id: customerId });
      expect(deleteMock).toHaveBeenCalled();
    });

    it("deve lançar NotFound se tentar deletar um cliente inexistente", async () => {
      const customerId = 999;
      const deleteMock = jest.fn().mockResolvedValue(0);
      const query = {
        where: jest.fn().mockReturnThis(),
        del: deleteMock,
      };
      dbMock.mockReturnValue(query);

      await expect(customerService.deleteCustomer(customerId)).rejects.toThrow(
        createError.NotFound("Customer not found")
      );
    });
  });

  describe("updatePassword", () => {
    it("deve atualizar a senha se o cliente existir e a senha antiga estiver correta", async () => {
      const customerId = 1;
      const oldPassword = "oldPass";
      const newPassword = "newPass";
      const currentCustomer = {
        id: customerId,
        password: "hashedOldPassword",
      };

      // Simula encontrar o cliente
      const firstMock = jest.fn().mockResolvedValue(currentCustomer);
      const querySelect = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      // Primeiro mock para buscar o cliente
      dbMock.mockReturnValueOnce(querySelect);

      // Simula comparação de senha
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      // Simula o hash da nova senha
      const newHash = "hashedNewPassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHash);

      // Em seguida, simula a atualização retornando 1 (sucesso)
      const updateMock = jest.fn().mockResolvedValue(1);
      const queryUpdate = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValueOnce(queryUpdate);

      await expect(
        customerService.updatePassword(customerId, oldPassword, newPassword)
      ).resolves.toBeUndefined();

      expect(querySelect.where).toHaveBeenCalledWith({ id: customerId });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        oldPassword,
        currentCustomer.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(queryUpdate.where).toHaveBeenCalledWith({ id: customerId });
      expect(updateMock).toHaveBeenCalledWith({ password: newHash });
    });

    it("deve lançar NotFound se o cliente não existir", async () => {
      const customerId = 999;
      const firstMock = jest.fn().mockResolvedValue(undefined);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      await expect(
        customerService.updatePassword(customerId, "anyOldPass", "anyNewPass")
      ).rejects.toThrow(createError.NotFound("Customer not found"));
    });

    it("deve lançar Unauthorized se a senha antiga não corresponder", async () => {
      const customerId = 1;
      const oldPassword = "oldPass";
      const newPassword = "newPass";
      const currentCustomer = {
        id: customerId,
        password: "hashedOldPassword",
      };

      const firstMock = jest.fn().mockResolvedValue(currentCustomer);
      const query = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValue(query);

      // Simula que a comparação retorna false
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        customerService.updatePassword(customerId, oldPassword, newPassword)
      ).rejects.toThrow(createError.Unauthorized("Old password is incorrect."));
    });

    it("deve lançar InternalServerError se a atualização não afetar nenhuma linha", async () => {
      const customerId = 1;
      const oldPassword = "oldPass";
      const newPassword = "newPass";
      const currentCustomer = {
        id: customerId,
        password: "hashedOldPassword",
      };

      const firstMock = jest.fn().mockResolvedValue(currentCustomer);
      const querySelect = {
        where: jest.fn().mockReturnThis(),
        first: firstMock,
      };
      dbMock.mockReturnValueOnce(querySelect);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const newHash = "hashedNewPassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHash);

      // Simula que o update não afeta nenhuma linha (0)
      const updateMock = jest.fn().mockResolvedValue(0);
      const queryUpdate = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValueOnce(queryUpdate);

      await expect(
        customerService.updatePassword(customerId, oldPassword, newPassword)
      ).rejects.toThrow(
        createError.InternalServerError(
          "Failed to update password. Please try again."
        )
      );
    });
  });
});
