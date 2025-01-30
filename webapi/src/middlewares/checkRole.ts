import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

export function checkRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw createError.Unauthorized("Usuário não autenticado");
      }

      if (!allowedRoles.includes(user.role)) {
        throw createError.Forbidden("Acesso negado. Role não autorizada.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
