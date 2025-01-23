import Joi from "joi";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

// Schema para criar mesa
const createTableSchema = Joi.object({
  table_number: Joi.number().integer().min(1).required().messages({
    "number.base": "table_number must be a number",
    "number.min": "table_number must be a positive integer",
    "any.required": "table_number is required",
  }),
  capacity: Joi.number().integer().min(1).required().messages({
    "number.base": "capacity must be a number",
    "number.min": "capacity must be at least 1",
    "any.required": "capacity is required",
  }),
  status: Joi.string()
    .valid("available", "reserved", "occupied")
    .default("available")
    .messages({
      "any.only": "status must be one of: available, reserved, occupied",
    }),
});

export function validateCreateTable(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createTableSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}

// Schema para atualizar mesa
const updateTableSchema = Joi.object({
  table_number: Joi.number().integer().min(1).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  status: Joi.string().valid("available", "reserved", "occupied").optional(),
});

export function validateUpdateTable(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = updateTableSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}
