import { Router } from "express";
import { TableController } from "../controllers/table.controller";
import {
  validateCreateTable,
  validateUpdateTable,
} from "../validations/table.validations";
import {
  validatePagination,
  validateIdParam,
} from "../validations/shared.validations";
import { checkAuth } from "../middlewares/checkAuth";
import { checkRole } from "../middlewares/checkRole";

const router = Router();
const tableController = new TableController();

/**
 * @openapi
 * /tables:
 *   post:
 *     summary: Cria uma nova mesa
 *     tags:
 *       - Tables
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_number:
 *                 type: number
 *               capacity:
 *                 type: number
 *               status:
 *                 type: string
 *             required:
 *               - table_number
 *               - capacity
 *             example:
 *               table_number: 1
 *               capacity: 4
 *               status: "available"
 *     responses:
 *       201:
 *         description: Mesa criada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/",
  checkAuth,
  checkRole(["admin"]),
  validateCreateTable,
  (req, res, next) => tableController.createTable(req, res, next)
);

/**
 * @openapi
 * /tables:
 *   get:
 *     summary: Retorna lista paginada de mesas
 *     tags:
 *       - Tables
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página (padrão 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Quantidade de itens por página (padrão 10, máx 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filtro no campo "status" (available, unavailable)
 *     responses:
 *       200:
 *         description: Lista de mesas paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     # $ref: '#/components/schemas/Table'
 *                     type: object
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       500:
 *         description: Erro interno
 */
router.get(
  "/",
  checkAuth,
  checkRole(["admin", "manager", "attendant", "customer"]),
  validatePagination,
  (req, res, next) => tableController.getAllTables(req, res, next)
);

/**
 * @openapi
 * /tables/{id}:
 *   get:
 *     summary: Retorna uma mesa específica pelo ID
 *     tags:
 *       - Tables
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: ID da mesa
 *     responses:
 *       200:
 *         description: Mesa encontrada
 *       400:
 *         description: Parâmetro inválido
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Mesa não encontrada
 *       500:
 *         description: Erro interno
 */
router.get(
  "/:id",
  checkAuth,
  checkRole(["admin", "manager", "attendant", "customer"]),
  validateIdParam,
  (req, res, next) => tableController.getTableById(req, res, next)
);

/**
 * @openapi
 * /tables/{id}:
 *   put:
 *     summary: Atualiza os dados de uma mesa
 *     tags:
 *       - Tables
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: ID da mesa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_number:
 *                 type: number
 *               capacity:
 *                 type: number
 *               status:
 *                 type: string
 *             example:
 *               table_number: 2
 *               capacity: 6
 *               status: "unavailable"
 *     responses:
 *       200:
 *         description: Mesa atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Mesa não encontrada
 *       500:
 *         description: Erro interno
 */
router.put(
  "/:id",
  checkAuth,
  checkRole(["admin", "manager"]),
  validateIdParam,
  validateUpdateTable,
  (req, res, next) => tableController.updateTable(req, res, next)
);

/**
 * @openapi
 * /tables/{id}:
 *   delete:
 *     summary: Remove uma mesa específica
 *     tags:
 *       - Tables
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID da mesa
 *     responses:
 *       200:
 *         description: Mesa removida com sucesso
 *       400:
 *         description: Parâmetro inválido
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Mesa não encontrada
 *       500:
 *         description: Erro interno
 */
router.delete(
  "/:id",
  checkAuth,
  checkRole(["admin"]),
  validateIdParam,
  (req, res, next) => tableController.deleteTable(req, res, next)
);

export default router;
