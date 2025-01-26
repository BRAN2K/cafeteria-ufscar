import { NextFunction, Request, Response } from "express";
import { ReservationService } from "../services/reservation.service";

const reservationService = new ReservationService();

export class ReservationController {
  public async createReservation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { table_id, customer_id, start_time, end_time, status } = req.body;
      const reservationId = await reservationService.createReservation(
        table_id,
        customer_id,
        start_time,
        end_time,
        status
      );

      res.status(201).json({
        message: "Reservation created",
        reservationId,
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
        customer_id,
      } = req.query as {
        page?: number;
        limit?: number;
        status?: string;
        table_id?: string;
        start_time?: string;
        end_time?: string;
        customer_id?: string;
      };

      const result = await reservationService.getAllReservations(
        page,
        limit,
        status,
        table_id ? Number(table_id) : undefined,
        start_time,
        end_time,
        customer_id ? Number(customer_id) : undefined
      );

      res.json(result);
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
      const reservation = await reservationService.getReservationById(
        Number(id)
      );

      res.json(reservation);
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

      await reservationService.updateReservation(
        Number(id),
        table_id,
        customer_id,
        start_time,
        end_time,
        status
      );

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
      const { start, end } = req.query as { start: string; end: string };
      const availableTables = await reservationService.checkAvailability(
        start,
        end
      );

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
      await reservationService.cancelReservation(Number(id));

      res.json({ message: "Reservation canceled" });
    } catch (error) {
      next(error);
    }
  }
}
