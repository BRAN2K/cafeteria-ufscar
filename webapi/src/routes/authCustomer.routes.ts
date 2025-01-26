// src/routes/authCustomer.routes.ts

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /auth/customer/login:
 *   post:
 *     summary: Login de cliente
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
  authController.loginCustomer(req, res, next)
);

// #TODO: Implementar rota de logout

// #TODO: Implementar rota de atualização de senha

// #TODO: Implementar rota de recuperação de senha

export default router;
