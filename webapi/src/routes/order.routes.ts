import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import {
  validateCreateOrder,
  validateUpdateOrder,
} from "../validations/order.validations";
import {
  validatePagination,
  validateIdParam,
} from "../validations/shared.validations";

const router = Router();
const orderController = new OrderController();

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Cria um novo pedido com itens inclusos
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateOrderInput"
 *           example:
 *             table_id: 1
 *             employee_id: 2
 *             items:
 *               - product_id: 3
 *                 quantity: 2
 *               - product_id: 1
 *                 quantity: 1
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Erro de validação ou estoque insuficiente
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", validateCreateOrder, (req, res, next) =>
  orderController.createOrder(req, res, next)
);

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Retorna uma lista paginada de pedidos (com itens e produtos)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtro para pesquisar pedidos pelo campo status
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
 *         description: Lista de pedidos paginada com itens
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
 *                     $ref: "#/components/schemas/OrderWithItems"
 *       400:
 *         description: Parâmetros inválidos (falha de validação)
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", validatePagination, (req, res, next) =>
  orderController.getAllOrders(req, res, next)
);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Retorna um pedido específico pelo ID, com itens e produtos
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pedido
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Retorna o pedido correspondente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/OrderWithItems"
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", validateIdParam, (req, res, next) =>
  orderController.getOrderById(req, res, next)
);

/**
 * @openapi
 * /orders/{id}:
 *   put:
 *     summary: Atualiza os dados de um pedido específico (SEM alterar itens)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pedido
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *             example:
 *               status: "in_preparation"
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/:id", validateIdParam, validateUpdateOrder, (req, res, next) =>
  orderController.updateOrder(req, res, next)
);

/**
 * @openapi
 * /orders/{id}:
 *   delete:
 *     summary: Remove um pedido específico pelo ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pedido
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Pedido removido com sucesso
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/:id", validateIdParam, (req, res, next) =>
  orderController.deleteOrder(req, res, next)
);

export default router;
