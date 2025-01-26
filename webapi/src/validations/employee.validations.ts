import Joi from "joi";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

const createEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.base": "name must be a string",
    "string.empty": "name cannot be empty",
    "any.required": "name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "email must be a valid email",
    "any.required": "email is required",
  }),
  role: Joi.string()
    .valid("admin", "attendant", "manager", "other")
    .required()
    .messages({
      "any.required": "role is required",
      "any.only": "role must be one of: admin, attendant, manager, other",
    }),
  password: Joi.string().min(6).max(100).required().messages({
    "string.base": "password must be a string",
    "string.empty": "password cannot be empty",
    "string.min": "password must have at least {#limit} characters",
    "string.max": "password must have at most {#limit} characters",
    "any.required": "password is required",
  }),
});

export function validateCreateEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createEmployeeSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}

const updateEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid("admin", "attendant", "manager", "other").optional(),
});

export function validateUpdateEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = updateEmployeeSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}
