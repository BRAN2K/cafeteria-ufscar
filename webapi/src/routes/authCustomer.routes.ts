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
 *     tags:
 *       - Auth
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

export default router;
