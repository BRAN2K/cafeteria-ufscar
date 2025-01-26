import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";
import {
  validateCreateCustomer,
  validateUpdateCustomer,
} from "../validations/customer.validations";
import {
  validatePagination,
  validateIdParam,
} from "../validations/shared.validations";
import { checkAuth } from "../middlewares/checkAuth";
import { checkRole } from "../middlewares/checkRole";
import { checkCustomerOwnership } from "../middlewares/checkCustomerOwnership";

const router = Router();
const customerController = new CustomerController();

/**
 * @openapi
 * /customers:
 *   post:
 *     summary: Cria um novo cliente
 *     tags:
 *       - Customers
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
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *             example:
 *               name: "Jon Snow"
 *               email: "jon@example.com"
 *               phone: "999-888-777"
 *               password: "winteriscoming"
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", validateCreateCustomer, (req, res, next) =>
  customerController.createCustomer(req, res, next)
);

/**
 * @openapi
 * /customers:
 *   get:
 *     summary: Retorna lista paginada de clientes
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtro para pesquisar clientes por nome ou email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Número da página (padrão = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Quantidade de itens por página (padrão = 10, máximo = 100)
 *     responses:
 *       200:
 *         description: Lista de clientes paginada
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
 *                     # $ref: '#/components/schemas/Customer'
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
  checkRole(["admin"]),
  validatePagination,
  (req, res, next) => customerController.getAllCustomers(req, res, next)
);

/**
 * @openapi
 * /customers/{id}:
 *   get:
 *     summary: Retorna um cliente específico pelo ID
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       400:
 *         description: Parâmetro inválido
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/:id",
  checkAuth,
  checkRole(["admin", "customer"]),
  validateIdParam,
  checkCustomerOwnership,
  (req, res, next) => customerController.getCustomerById(req, res, next)
);

/**
 * @openapi
 * /customers/{id}:
 *   put:
 *     summary: Atualiza os dados de um cliente
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do cliente
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
 *               phone:
 *                 type: string
 *             example:
 *               name: "Arya Stark"
 *               email: "arya@example.com"
 *               phone: "12345-6789"
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno
 */
router.put(
  "/:id",
  checkAuth,
  checkRole(["admin", "customer"]),
  validateIdParam,
  checkCustomerOwnership,
  validateUpdateCustomer,
  (req, res, next) => customerController.updateCustomer(req, res, next)
);

/**
 * @openapi
 * /customers/{id}:
 *   delete:
 *     summary: Remove um cliente específico
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente removido com sucesso
 *       400:
 *         description: Parâmetro inválido
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno
 */
router.delete(
  "/:id",
  checkAuth,
  checkRole(["admin", "customer"]),
  validateIdParam,
  checkCustomerOwnership,
  (req, res, next) => customerController.deleteCustomer(req, res, next)
);

export default router;
