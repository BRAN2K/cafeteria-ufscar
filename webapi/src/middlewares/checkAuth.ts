import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import createError from "http-errors";

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function checkAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw createError.Unauthorized("No token provided");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
      throw createError.Unauthorized("Token error");
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      throw createError.Unauthorized("Malformed token");
    }

    let decoded: JwtPayload;
    try {
      // valida token
      decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    } catch (error) {
      throw createError.Unauthorized("Invalid token signature");
    }

    // injeta info
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
