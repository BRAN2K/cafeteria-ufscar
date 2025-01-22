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

const router = Router();
const employeeController = new EmployeeController();

/**
 * @openapi
 * /employees:
 *   post:
 *     summary: Cria um novo funcionário
 *     tags:
 *       - Employees
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
 *             required:
 *               - name
 *               - email
 *               - role
 *             example:
 *               name: "Alice"
 *               email: "alice@example.com"
 *               role: "manager"
 *     responses:
 *       201:
 *         description: Funcionário criado com sucesso
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", validateCreateEmployee, employeeController.createEmployee);

/**
 * @openapi
 * /employees:
 *   get:
 *     summary: Retorna lista paginada de funcionários
 *     tags:
 *       - Employees
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
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno
 */
router.get("/", validatePagination, employeeController.getAllEmployees);

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     summary: Retorna um funcionário específico pelo ID
 *     tags:
 *       - Employees
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
 *         description: Parâmetro inválido (erro de validação)
 *       404:
 *         description: Funcionário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", validateIdParam, employeeController.getEmployeeById);

/**
 * @openapi
 * /employees/{id}:
 *   put:
 *     summary: Atualiza os dados de um funcionário específico
 *     tags:
 *       - Employees
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
 *       404:
 *         description: Funcionário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/:id",
  validateIdParam,
  validateUpdateEmployee,
  employeeController.updateEmployee
);

/**
 * @openapi
 * /employees/{id}:
 *   delete:
 *     summary: Remove um funcionário específico
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do funcionário
 *     responses:
 *       200:
 *         description: Funcionário removido com sucesso
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Funcionário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/:id", validateIdParam, employeeController.deleteEmployee);

export default router;
