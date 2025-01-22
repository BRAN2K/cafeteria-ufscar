import Joi from "joi";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

const createCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.base": "name must be a string",
    "string.empty": "name cannot be empty",
    "any.required": "name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "email must be a valid email",
    "any.required": "email is required",
  }),
  phone: Joi.string().optional().allow("").max(20).messages({
    "string.base": "phone must be a string",
  }),
});

export function validateCreateCustomer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createCustomerSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}

const updateCustomerSchema = Joi.object({
  // Nenhum campo é strictly required, pois pode atualizar só o nome, por ex.
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().max(20).optional(),
});

export function validateUpdateCustomer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = updateCustomerSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}
