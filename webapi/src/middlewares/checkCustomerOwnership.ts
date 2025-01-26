import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

export function checkCustomerOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (user && user.role === "customer") {
      const routeId = parseInt(req.params.id, 10);
      if (user.id !== routeId) {
        throw createError.Forbidden(
          "Você não tem permissão para acessar dados de outro cliente."
        );
      }
    }

    return next();
  } catch (error) {
    next(error);
  }
}
