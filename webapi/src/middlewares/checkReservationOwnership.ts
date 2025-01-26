import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import db from "../database";

export async function checkCreateReservationOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.user?.role === "customer") {
      const bodyCustomerId = Number(req.body.customer_id);
      if (req.user.id !== bodyCustomerId) {
        throw createError.Forbidden(
          "Clientes não podem criar reservas com outro customer_id."
        );
      }
    }
    // Se for admin/manager/attendant, segue adiante
    next();
  } catch (error) {
    next(error);
  }
}

export async function checkReservationOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw createError.Unauthorized("Usuário não autenticado");
    }

    if (req.user.role !== "customer") {
      return next();
    }

    // Se for 'customer', busca a reserva pelo ID da rota
    const reservationId = Number(req.params.id);
    const reservation = await db("reservations")
      .where({ id: reservationId })
      .first();

    // Compara o customer_id da reserva com o user.id do token
    if (!reservation || reservation.customer_id !== req.user.id) {
      throw createError.Forbidden(
        "Você não pode manipular reservas que não sejam suas ou essa(s) reserva(s) não existe(m)."
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function filterReservationsForCustomer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role === "customer") {
    req.query.customer_id = String(req.user.id);
  }
  next();
}
