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
 *             required:
 *               - name
 *               - email
 *             example:
 *               name: "Jon Snow"
 *               email: "jon@example.com"
 *               phone: "999-888-777"
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", validateCreateCustomer, customerController.createCustomer);

/**
 * @openapi
 * /customers:
 *   get:
 *     summary: Retorna lista paginada de clientes
 *     tags:
 *       - Customers
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
 *       500:
 *         description: Erro interno
 */
router.get("/", validatePagination, customerController.getAllCustomers);

/**
 * @openapi
 * /customers/{id}:
 *   get:
 *     summary: Retorna um cliente específico pelo ID
 *     tags:
 *       - Customers
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
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", validateIdParam, customerController.getCustomerById);

/**
 * @openapi
 * /customers/{id}:
 *   put:
 *     summary: Atualiza os dados de um cliente
 *     tags:
 *       - Customers
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
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno
 */
router.put(
  "/:id",
  validateIdParam,
  validateUpdateCustomer,
  customerController.updateCustomer
);

/**
 * @openapi
 * /customers/{id}:
 *   delete:
 *     summary: Remove um cliente específico
 *     tags:
 *       - Customers
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
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno
 */
router.delete("/:id", validateIdParam, customerController.deleteCustomer);

export default router;
