// src/controllers/reservation.controller.ts

import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import db from "../database";
import { DateTime } from "luxon";

export class ReservationController {
  /**
   * Função auxiliar para checar se start_time < end_time no formato "yyyy-MM-dd HH:mm:ss".
   *
   * @param start_time - string representando a data/hora inicial
   * @param end_time   - string representando a data/hora final
   */
  private validateTimeInterval(start_time?: string, end_time?: string) {
    if (start_time && end_time) {
      const format = "yyyy-MM-dd HH:mm:ss";

      const dtStart = DateTime.fromFormat(start_time, format);
      const dtEnd = DateTime.fromFormat(end_time, format);

      if (dtStart >= dtEnd) {
        throw createError.BadRequest("start_time must be before end_time");
      }
    }
  }

  /**
   * Verifica se uma mesa específica está disponível
   * no intervalo [start_time, end_time].
   *
   * @param tableId - ID da mesa a ser verificada
   * @param start - Data/hora inicial
   * @param end - Data/hora final
   * @param ignoreReservationId - Se for um update, podemos ignorar a própria reserva para não acusar conflito
   */
  private async isTableAvailable(
    tableId: number,
    start: string,
    end: string,
    ignoreReservationId?: number
  ): Promise<boolean> {
    const query = db("reservations")
      .where("table_id", tableId)
      .andWhere(function () {
        this.where("start_time", "<", end).andWhere("end_time", ">", start);
      });

    if (ignoreReservationId) {
      query.andWhere("id", "<>", ignoreReservationId);
    }

    const conflictingReservations = await query.count({ total: "*" }).first();

    return Number(conflictingReservations?.total) === 0;
  }

  /**
   * Retorna todas as mesas que estejam livres em [start, end].
   * (Ex.: para a rota GET /reservations/check-availability)
   *
   * @param start - Data/hora inicial
   * @param end - Data/hora final
   */
  private async getAvailableTables(start: string, end: string) {
    const allTables = await db("tables").select("*");

    const conflicting = await db("reservations")
      .where("start_time", "<", end)
      .andWhere("end_time", ">", start)
      .select("table_id");

    const conflictingTableIds = conflicting.map((r) => r.table_id);

    const available = allTables.filter(
      (table) => !conflictingTableIds.includes(table.id)
    );

    return available;
  }

  public async createReservation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { table_id, customer_id, start_time, end_time } = req.body;

      this.validateTimeInterval(start_time, end_time);

      const canReserve = await this.isTableAvailable(
        table_id,
        start_time,
        end_time
      );
      if (!canReserve) {
        throw createError.Conflict(
          "Table unavailable during this time interval"
        );
      }

      const [id] = await db("reservations").insert({
        table_id,
        customer_id,
        start_time,
        end_time,
        status: "active",
      });

      res.status(201).json({
        message: "Reservation created",
        reservationId: id,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllReservations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        table_id,
        start_time,
        end_time,
      } = req.query as {
        page?: number;
        limit?: number;
        status?: string;
        table_id?: string;
        start_time?: string;
        end_time?: string;
      };

      const offset = (page - 1) * limit;
      let query = db("reservations").whereNotNull("id");

      if (status) {
        query = query.where("status", status);
      }
      if (table_id) {
        query = query.where("table_id", table_id);
      }
      if (start_time && end_time) {
        query = query.where((builder) => {
          builder
            .where("start_time", ">=", start_time)
            .andWhere("end_time", "<=", end_time);
        });
      } else if (start_time) {
        query = query.where("end_time", ">=", start_time);
      } else if (end_time) {
        query = query.where("start_time", "<=", end_time);
      }

      const [countResult] = await query.clone().count({ total: "*" });
      const total = Number(countResult.total) || 0;

      const records = await query
        .select("*")
        .limit(limit)
        .offset(offset)
        .orderBy("start_time", "asc");

      res.json({
        page,
        limit,
        total,
        records,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getReservationById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const reservation = await db("reservations").where({ id }).first();
      if (!reservation) {
        throw createError.NotFound("Reservation not found");
      }

      res.json({ ...reservation });
    } catch (error) {
      next(error);
    }
  }

  public async updateReservation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { table_id, customer_id, start_time, end_time, status } = req.body;

      this.validateTimeInterval(start_time, end_time);

      if (table_id && start_time && end_time) {
        const canReserve = await this.isTableAvailable(
          table_id,
          start_time,
          end_time,
          Number(id)
        );
        if (!canReserve) {
          throw createError.Conflict(
            "Table unavailable during this time interval"
          );
        }
      }

      const updatedCount = await db("reservations").where({ id }).update({
        table_id,
        customer_id,
        start_time,
        end_time,
        status,
      });

      if (!updatedCount) {
        throw createError.NotFound("Reservation not found");
      }

      res.json({ message: "Reservation updated" });
    } catch (error) {
      next(error);
    }
  }

  public async checkAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { start, end } = req.query as {
        start: string;
        end: string;
      };

      const availableTables = await this.getAvailableTables(start, end);

      res.json({
        available_tables: availableTables,
      });
    } catch (error) {
      next(error);
    }
  }

  public async cancelReservation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const updated = await db("reservations")
        .where({ id, status: "active" })
        .update({ status: "canceled" });

      if (!updated) {
        throw createError.NotFound("Reservation not found or already canceled");
      }
      res.json({ message: "Reservation canceled" });
    } catch (error) {
      next(error);
    }
  }
}
