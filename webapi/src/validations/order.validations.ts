import Joi from "joi";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

/**
 * Schema de cada item dentro do pedido
 */
const orderItemSchema = Joi.object({
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

const createOrderSchema = Joi.object({
  table_id: Joi.number().required().messages({
    "number.base": "table_id must be a number",
    "any.required": "table_id is required",
  }),
  employee_id: Joi.number().required().messages({
    "number.base": "employee_id must be a number",
    "any.required": "employee_id is required",
  }),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    "array.min": "At least one item is required",
    "any.required": "items is required",
  }),
});

/**
 * Validação para criação de pedido: agora aceita "items"
 */
export function validateCreateOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createOrderSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}

/**
 * Rota de update permanece a mesma — não queremos permitir edição de itens via update.
 */
const updateOrderSchema = Joi.object({
  // sem alterar a parte de itens
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
