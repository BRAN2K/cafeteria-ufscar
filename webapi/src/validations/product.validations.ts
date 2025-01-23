import Joi from "joi";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    "string.base": "name must be a string",
    "any.required": "name is required",
  }),
  description: Joi.string().allow("").default(""),
  price: Joi.number().min(0).required().messages({
    "number.base": "price must be a number",
    "any.required": "price is required",
  }),
  stock_quantity: Joi.number().integer().min(0).default(0),
});

export function validateCreateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createProductSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  description: Joi.string().allow("").optional(),
  price: Joi.number().min(0).optional(),
  stock_quantity: Joi.number().integer().min(0).optional(),
});

export function validateUpdateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = updateProductSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}

const stockAdjustmentSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "quantity must be an integer",
    "number.min": "quantity must be at least 1",
    "any.required": "quantity is required",
  }),
});

export function validateStockAdjustment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = stockAdjustmentSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}
