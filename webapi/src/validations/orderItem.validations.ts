import Joi from "joi";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

const createOrderItemSchema = Joi.object({
  order_id: Joi.number().integer().required().messages({
    "number.base": "order_id must be a number",
    "any.required": "order_id is required",
  }),
  product_id: Joi.number().integer().required().messages({
    "number.base": "product_id must be a number",
    "any.required": "product_id is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "quantity must be a number",
    "number.min": "quantity must be at least 1",
    "any.required": "quantity is required",
  }),
});

export function validateCreateOrderItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createOrderItemSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}
