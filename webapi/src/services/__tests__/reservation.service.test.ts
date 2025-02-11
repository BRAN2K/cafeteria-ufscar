import createError from "http-errors";
import { DateTime } from "luxon";
import db from "../../database";
import { ReservationService } from "../reservation.service";
import { count } from "console";

// Mock do módulo db
jest.mock("../../database", () => jest.fn());

describe("ReservationService", () => {
  let reservationService: ReservationService;
  const dbMock = db as unknown as jest.Mock;

  beforeEach(() => {
    reservationService = new ReservationService();
    dbMock.mockReset();
  });

  /* 
    Teste do método createReservation 
      - valida o intervalo de tempo através do validateTimeInterval
      - verifica se a mesa está disponível (isTableAvailable) e insere a reserva
  */
  describe("createReservation", () => {
    const validStart = "2023-10-10 10:00:00";
    const validEnd = "2023-10-10 12:00:00";

    it("deve lançar BadRequest se o intervalo de tempo for inválido", async () => {
      const invalidStart = "2023-10-10 14:00:00";
      const invalidEnd = "2023-10-10 12:00:00";
      await expect(
        reservationService.createReservation(1, 1, invalidStart, invalidEnd)
      ).rejects.toThrow(
        createError.BadRequest("start_time must be before end_time")
      );
    });

    it("deve lançar Conflict se a mesa não estiver disponível", async () => {
      // Simula que a mesa não está disponível (isTableAvailable retorna false)
      // Para isso, o mock da query em isTableAvailable deve retornar um count diferente de zero.
      const reservationsQueryMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ total: "1" }), // Conflito: count > 0
        // Se houver ignoreReservationId, pode ter andWhere extra – mas não é necessário aqui.
      };

      // Configura o db para a tabela reservations usada em isTableAvailable
      dbMock.mockImplementation((tableName: string) => {
        if (tableName === "reservations") {
          return reservationsQueryMock;
        }
        // Para outras chamadas, retorne um objeto vazio
        return {};
      });

      await expect(
        reservationService.createReservation(1, 1, validStart, validEnd)
      ).rejects.toThrow(
        createError.Conflict("Table unavailable during this time interval")
      );
    });

    it("deve criar a reserva e retornar o id quando a mesa estiver disponível", async () => {
      // Simula que a mesa está disponível: count retorna 0
      const reservationsAvailabilityMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ total: "0" }),
        // Poderíamos também deixar "first" ser idêntico ao resolvedValue
      };

      // Em seguida, quando for inserida a reserva, simula o insert retornando um array com o reservation id.
      const insertMock = jest.fn().mockResolvedValue([555]);

      // Vamos usar mockImplementation() para distinguir as chamadas ao db("reservations")
      dbMock.mockImplementation((tableName: string) => {
        if (tableName === "reservations") {
          // Se o método chamado for count (da disponibilidade) ou insert (da criação)
          return {
            // Se for chamada count, usamos o mock de disponibilidade
            where: reservationsAvailabilityMock.where,
            andWhere: reservationsAvailabilityMock.andWhere,
            count: reservationsAvailabilityMock.count,
            first: reservationsAvailabilityMock.first,
            insert: insertMock,
          };
        }
        return {};
      });

      const reservationId = await reservationService.createReservation(
        1,
        2,
        validStart,
        validEnd,
        "active"
      );
      expect(insertMock).toHaveBeenCalledWith({
        table_id: 1,
        customer_id: 2,
        start_time: validStart,
        end_time: validEnd,
        status: "active",
      });
      expect(reservationId).toBe(555);
    });
  });

  /* 
    Teste do método getAllReservations
      - Filtra por status, table_id, períodos e customer_id
      - Usa clone() para contar os registros e depois faz join com customers
  */
  describe("getAllReservations", () => {
    it("deve retornar paginação, total e registros com dados do cliente", async () => {
      const page = 1;
      const limit = 10;
      const offset = 0;

      // Mock para a query base (reservations)
      const countMock = jest.fn().mockResolvedValue([{ total: "3" }]);
      const baseQueryMock = {
        clone: jest.fn().mockReturnThis(),
        clearSelect: jest.fn().mockReturnThis(),
        clearOrder: jest.fn().mockReturnThis(),
        count: countMock,
        where: jest.fn().mockReturnThis(),
      };

      // Para a query com join, simulamos depois de aplicar join e select
      const joinAndSelectQueryMock = {
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue([
          {
            id: 10,
            table_id: 2,
            customer_id: 5,
            start_time: "2023-10-10 10:00:00",
            end_time: "2023-10-10 12:00:00",
            status: "active",
            customer_name: "Fulano",
            customer_email: "fulano@example.com",
          },
        ]),
      };

      // Configura o mock para db() conforme o nome da tabela
      dbMock.mockImplementation((tableName: string) => {
        if (tableName === "reservations") {
          // Aqui, retornamos um objeto que permita encadeamento
          return Object.assign({}, baseQueryMock, {
            join: jest.fn().mockReturnValue(joinAndSelectQueryMock),
            select: jest.fn().mockReturnValue(joinAndSelectQueryMock),
            orderBy: joinAndSelectQueryMock.orderBy,
            limit: joinAndSelectQueryMock.limit,
            offset: joinAndSelectQueryMock.offset,
          });
        }
        if (tableName === "customers") {
          // Não será chamado diretamente
          return {};
        }
        return {};
      });

      const result = await reservationService.getAllReservations(page, limit);

      expect(baseQueryMock.clone).toHaveBeenCalled();
      expect(countMock).toHaveBeenCalledWith({ total: "*" });
      expect(result.total).toBe(3);
      expect(result.records).toHaveLength(1);
      expect(result.records[0].customer_name).toBe("Fulano");
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
    });
  });

  /* 
    Teste do método getReservationById
  */
  describe("getReservationById", () => {
    it("deve retornar a reserva se encontrada", async () => {
      const reservationData = { id: 99, status: "active", table_id: 1 };
      const queryMock = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(reservationData),
      };
      dbMock.mockImplementation((tableName: string) => {
        if (tableName === "reservations") {
          return queryMock;
        }
        return {};
      });

      const result = await reservationService.getReservationById(99);
      expect(queryMock.where).toHaveBeenCalledWith({ id: 99 });
      expect(result).toEqual(reservationData);
    });

    it("deve lançar NotFound se a reserva não for encontrada", async () => {
      const queryMock = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(undefined),
      };
      dbMock.mockReturnValue(queryMock);

      await expect(reservationService.getReservationById(999)).rejects.toThrow(
        createError.NotFound("Reservation not found")
      );
    });
  });

  /* 
    Teste do método updateReservation
  */
  describe("updateReservation", () => {
    const validStart = "2023-11-01 08:00:00";
    const validEnd = "2023-11-01 10:00:00";

    it("deve atualizar a reserva se encontrada e válida", async () => {
      // Simula que o intervalo é válido e a mesa está disponível
      // Para updateReservation, após a validação, realiza update no db.
      const updateMock = jest.fn().mockResolvedValue(1);
      const queryMock = {
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ total: "0" }),
        andWhere: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValue(queryMock);

      await expect(
        reservationService.updateReservation(
          50,
          3,
          7,
          validStart,
          validEnd,
          "active"
        )
      ).resolves.toBeUndefined();

      expect(queryMock.where).toHaveBeenCalledWith({ id: 50 });
      expect(updateMock).toHaveBeenCalledWith({
        table_id: 3,
        customer_id: 7,
        start_time: validStart,
        end_time: validEnd,
        status: "active",
      });
    });

    it("deve lançar Conflict se a mesa não estiver disponível para atualizar", async () => {
      // Para simular conflito, na verificação de disponibilidade, devemos fazer o count retornar valor > 0.
      const reservationsQueryMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ total: "2" }),
      };
      dbMock.mockImplementation((tableName: string) => {
        if (tableName === "reservations") {
          return reservationsQueryMock;
        }
        return {};
      });

      await expect(
        reservationService.updateReservation(
          60,
          4,
          8,
          validStart,
          validEnd,
          "active"
        )
      ).rejects.toThrow(
        createError.Conflict("Table unavailable during this time interval")
      );
    });
  });

  /* 
    Teste do método checkAvailability que utiliza getAvailableTables
  */
  describe("checkAvailability", () => {
    it("deve retornar as mesas disponíveis no intervalo informado", async () => {
      const start = "2023-12-01 09:00:00";
      const end = "2023-12-01 11:00:00";

      // Simula todas as mesas
      const tablesArray = [
        { id: 1, number: 101 },
        { id: 2, number: 102 },
        { id: 3, number: 103 },
      ];

      // Simula reservas conflitantes (apenas para mesa 2, por exemplo)
      const reservationsArray = [{ table_id: 2 }];

      // Configura as chamadas do db:
      dbMock.mockImplementation((tableName: string) => {
        if (tableName === "tables") {
          return {
            select: jest.fn().mockResolvedValue(tablesArray),
          };
        }
        if (tableName === "reservations") {
          return {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(reservationsArray),
          };
        }
        return {};
      });

      const available = await reservationService.checkAvailability(start, end);
      expect(available).toEqual([
        { id: 1, number: 101 },
        { id: 3, number: 103 },
      ]);
    });
  });

  /* 
    Teste do método cancelReservation
  */
  describe("cancelReservation", () => {
    it("deve cancelar a reserva se ela existir e estiver ativa", async () => {
      const updateMock = jest.fn().mockResolvedValue(1);
      const queryMock = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValue(queryMock);

      await expect(
        reservationService.cancelReservation(77)
      ).resolves.toBeUndefined();
      expect(queryMock.where).toHaveBeenCalledWith({
        id: 77,
        status: "active",
      });
      expect(updateMock).toHaveBeenCalledWith({ status: "canceled" });
    });

    it("deve lançar NotFound se a reserva não for encontrada ou já estiver cancelada", async () => {
      const updateMock = jest.fn().mockResolvedValue(0);
      const queryMock = {
        where: jest.fn().mockReturnThis(),
        update: updateMock,
      };
      dbMock.mockReturnValue(queryMock);

      await expect(reservationService.cancelReservation(999)).rejects.toThrow(
        createError.NotFound("Reservation not found or already canceled")
      );
    });
  });
});
