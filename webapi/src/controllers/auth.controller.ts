import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  public async loginEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginEmployee(email, password);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async loginCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginCustomer(email, password);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
