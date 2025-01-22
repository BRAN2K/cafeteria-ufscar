import Joi from "joi";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow("").default(""),
});

export function validatePagination(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const { error, value } = paginationSchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }

  // Sobrescreve req.query só com valores validados
  req.query = value;
  return next();
}

const paramIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number",
    "any.required": "id is required",
  }),
});

export function validateIdParam(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = paramIdSchema.validate(req.params, { abortEarly: false });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}
