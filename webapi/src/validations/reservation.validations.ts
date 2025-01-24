import Joi from "joi";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";

const statusValues = ["active", "canceled", "completed"];

function validateDateTimeFormat(value: string, helpers: Joi.CustomHelpers) {
  const dt = DateTime.fromFormat(value, "yyyy-MM-dd HH:mm:ss");
  if (!dt.isValid) {
    return helpers.error("date.format");
  }
  return value;
}

const dateTimeSchema = Joi.string().custom(
  validateDateTimeFormat,
  "DateTime format validator"
);

const createReservationSchema = Joi.object({
  table_id: Joi.number().integer().required().messages({
    "number.base": "table_id must be a number",
    "any.required": "table_id is required",
  }),
  customer_id: Joi.number().integer().required().messages({
    "number.base": "customer_id must be a number",
    "any.required": "customer_id is required",
  }),
  start_time: dateTimeSchema.required().messages({
    "date.format":
      "start_time must be a valid date in the format: yyyy-MM-dd HH:mm:ss",
    "any.required": "start_time is required",
  }),
  end_time: dateTimeSchema.required().messages({
    "date.format":
      "end_time must be a valid date in the format: yyyy-MM-dd HH:mm:ss",
    "any.required": "end_time is required",
  }),
  status: Joi.string()
    .valid(...statusValues)
    .default("active"),
});

export function validateCreateReservation(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // #TODO: Se quiser, também valide se start_time < end_time, etc.
  const { error } = createReservationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}

const updateReservationSchema = Joi.object({
  table_id: Joi.number().integer().optional(),
  customer_id: Joi.number().integer().optional(),
  start_time: dateTimeSchema.optional().messages({
    "date.format":
      "start_time must be a valid date in the format: yyyy-MM-dd HH:mm:ss",
  }),
  end_time: dateTimeSchema.optional().messages({
    "date.format":
      "end_time must be a valid date in the format: yyyy-MM-dd HH:mm:ss",
  }),
  status: Joi.string()
    .valid(...statusValues)
    .optional(),
});

export function validateUpdateReservation(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const { error } = updateReservationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}

const checkAvailabilitySchema = Joi.object({
  start: dateTimeSchema.required().messages({
    "date.format":
      "start must be a valid date in the format: yyyy-MM-dd HH:mm:ss",
    "any.required": "start is required",
  }),
  end: dateTimeSchema.required().messages({
    "date.format":
      "end must be a valid date in the format: yyyy-MM-dd HH:mm:ss",
    "any.required": "end is required",
  }),
});

export function validateCheckAvailability(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const { error } = checkAvailabilitySchema.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    throw createError.BadRequest(
      error.details.map((d) => d.message).join("; ")
    );
  }
  next();
}
