import Joi from "joi";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

const createOrderSchema = Joi.object({
  table_id: Joi.number().required().messages({
    "number.base": "table_id must be a number",
    "any.required": "table_id is required",
  }),
  employee_id: Joi.number().required().messages({
    "number.base": "employee_id must be a number",
    "any.required": "employee_id is required",
  }),
});

export function validateCreateOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createOrderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}

const updateOrderSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "in_preparation", "delivered", "canceled")
    .required()
    .messages({
      "any.required": "status is required",
      "any.only":
        "status must be one of: pending, in_preparation, delivered, canceled",
    }),
});

export function validateUpdateOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = updateOrderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}
