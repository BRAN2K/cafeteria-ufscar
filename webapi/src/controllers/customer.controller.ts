import { NextFunction, Request, Response } from "express";
import { CustomerService } from "../services/customer.service";

const customerService = new CustomerService();

export class CustomerController {
  public async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, password } = req.body;
      const customerId = await customerService.createCustomer({
        name,
        email,
        phone,
        password,
      });

      res.status(201).json({
        message: "Customer created",
        customerId,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllCustomers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
      } = req.query as {
        page?: number;
        limit?: number;
        search?: string;
      };
      const result = await customerService.getAllCustomers(page, limit, search);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getCustomerById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(Number(id));

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  public async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;
      await customerService.updateCustomer(Number(id), { name, email, phone });

      res.json({ message: "Customer updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(Number(id));

      res.json({ message: "Customer deleted" });
    } catch (error) {
      next(error);
    }
  }

  public async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      await customerService.updatePassword(
        Number(id),
        oldPassword,
        newPassword
      );

      res.json({ message: "Password updated successfully." });
    } catch (error) {
      next(error);
    }
  }
}
