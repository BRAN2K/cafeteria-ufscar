import { Request, Response, NextFunction } from "express";

export function filterReservationsForCustomer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role === "customer") {
    req.query.customer_id = String(req.user.id);
  }
  next();
}
