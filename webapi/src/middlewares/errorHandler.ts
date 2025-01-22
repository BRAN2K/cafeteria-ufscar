import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { HttpError } from "http-errors";

export const errorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Tratando erros de http-errors, usamos o status específico
  if ((err as HttpError).status) {
    const httpErr = err as HttpError;

    res.status(httpErr.status).json({
      status: "error",
      message: httpErr.message,
    });
    return;
  }

  // Tratando erros específicos de constraints do Knex
  const knexErr = err as any;
  if (knexErr && knexErr.code) {
    if (knexErr.code === "ER_NO_REFERENCED_ROW_2") {
      // MySQL: Foreign key constraint falhou (referenciando registro que não existe)
      res.status(400).json({
        status: "error",
        message: "One of the specified foreign keys does not exist",
      });
      return;
    }
    if (knexErr.code === "ER_ROW_IS_REFERENCED_2") {
      // MySQL: Tenta excluir uma linha que outros registros referenciam
      res.status(400).json({
        status: "error",
        message: "Cannot delete or update because a related record exists",
      });
      return;
    }
  }

  // Tratando erros que não são http-errors => Internal Server Error
  console.error("[ERROR]", err);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
  return;
};
