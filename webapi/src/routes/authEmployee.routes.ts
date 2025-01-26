// src/routes/authEmployee.routes.ts

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /auth/employee/login:
 *   post:
 *     summary: Login de funcionário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Retorna token JWT
 */
router.post("/login", (req, res, next) =>
  authController.loginEmployee(req, res, next)
);

export default router;
