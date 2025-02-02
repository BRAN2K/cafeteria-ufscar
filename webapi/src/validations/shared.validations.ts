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
    allowUnknown: true,
  });

  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }

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

const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).max(100).required().messages({
    "string.base": "oldPassword must be a string",
    "string.min": "oldPassword must have at least {#limit} characters",
    "string.max": "oldPassword must have at most {#limit} characters",
    "any.required": "oldPassword is required",
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    "string.base": "newPassword must be a string",
    "string.min": "newPassword must have at least {#limit} characters",
    "string.max": "newPassword must have at most {#limit} characters",
    "any.required": "newPassword is required",
  }),
});

export function validateUpdatePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = updatePasswordSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}
