import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";
import {
  validateCreateEmployee,
  validateUpdateEmployee,
} from "../validations/employee.validations";
import {
  validatePagination,
  validateIdParam,
} from "../validations/shared.validations";

// Middlewares de auth
import { checkAuth } from "../middlewares/checkAuth";
import { checkRole } from "../middlewares/checkRole";

const router = Router();
const employeeController = new EmployeeController();

/**
 * @openapi
 * /employees:
 *   post:
 *     summary: Cria um novo funcionário
 *     tags:
 *       - Employees
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - role
 *               - password
 *             example:
 *               name: "Alice"
 *               email: "alice@example.com"
 *               role: "manager"
 *               password: "alice123"
 *     responses:
 *       201:
 *         description: Funcionário criado com sucesso
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/",
  checkAuth,
  checkRole(["admin"]),
  validateCreateEmployee,
  (req, res, next) => employeeController.createEmployee(req, res, next)
);

/**
 * @openapi
 * /employees:
 *   get:
 *     summary: Retorna lista paginada de funcionários
 *     tags:
 *       - Employees
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Número da página (padrão 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Quantidade de itens por página (padrão 10, máximo 100)
 *     responses:
 *       200:
 *         description: Lista de funcionários paginada
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
 *                     # $ref: '#/components/schemas/Employee'
 *                     type: object
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/",
  checkAuth,
  checkRole(["admin", "manager"]),
  validatePagination,
  (req, res, next) => employeeController.getAllEmployees(req, res, next)
);

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     summary: Retorna um funcionário específico pelo ID
 *     tags:
 *       - Employees
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do funcionário
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Funcionário encontrado
 *       400:
 *         description: Parâmetro inválido
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Funcionário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/:id",
  checkAuth,
  checkRole(["admin", "manager"]),
  validateIdParam,
  (req, res, next) => employeeController.getEmployeeById(req, res, next)
);

/**
 * @openapi
 * /employees/{id}:
 *   put:
 *     summary: Atualiza os dados de um funcionário específico
 *     tags:
 *       - Employees
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do funcionário
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *             example:
 *               name: "Bob"
 *               email: "bob@example.com"
 *               role: "admin"
 *     responses:
 *       200:
 *         description: Funcionário atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Funcionário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/:id",
  checkAuth,
  checkRole(["admin"]),
  validateIdParam,
  validateUpdateEmployee,
  (req, res, next) => employeeController.updateEmployee(req, res, next)
);

/**
 * @openapi
 * /employees/{id}:
 *   delete:
 *     summary: Remove um funcionário específico
 *     tags:
 *       - Employees
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do funcionário
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Funcionário removido com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Funcionário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/:id",
  checkAuth,
  checkRole(["admin"]),
  validateIdParam,
  (req, res, next) => employeeController.deleteEmployee(req, res, next)
);

export default router;
