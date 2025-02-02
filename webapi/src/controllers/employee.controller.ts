import { NextFunction, Request, Response } from "express";
import { EmployeeService } from "../services/employee.service";

const employeeService = new EmployeeService();

export class EmployeeController {
  public async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, role, password } = req.body;
      const employeeId = await employeeService.createEmployee({
        name,
        email,
        role,
        password,
      });

      res.status(201).json({
        message: "Employee created",
        employeeId,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllEmployees(
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
      const result = await employeeService.getAllEmployees(page, limit, search);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getEmployeeById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(Number(id));

      res.json(employee);
    } catch (error) {
      next(error);
    }
  }

  public async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      await employeeService.updateEmployee(Number(id), {
        name,
        email,
        role,
      });

      res.json({ message: "Employee updated" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await employeeService.deleteEmployee(Number(id));

      res.json({ message: "Employee deleted" });
    } catch (error) {
      next(error);
    }
  }

  public async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      await employeeService.updatePassword(
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
