import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import {
  validateCreateOrder,
  validateIdParam,
  validateUpdateOrder,
} from "../validations/order.validations";

const router = Router();
const orderController = new OrderController();

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Retorna uma lista paginada de pedidos
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtro para pesquisar pedidos pelo campo status (e.g. "pending", "delivered")
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
 *         description: Lista de pedidos paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   description: Página atual
 *                 limit:
 *                   type: integer
 *                   description: Número de itens retornados por página
 *                 total:
 *                   type: integer
 *                   description: Total de registros que correspondem ao filtro
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       400:
 *         description: Parâmetros inválidos (falha de validação)
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", orderController.getAllOrders);

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Cria um novo pedido
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_id:
 *                 type: number
 *               employee_id:
 *                 type: number
 *             example:
 *               table_id: 1
 *               employee_id: 2
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", validateCreateOrder, orderController.createOrder);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Retorna um pedido específico pelo ID
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
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", validateIdParam, orderController.getOrderById);

/**
 * @openapi
 * /orders/{id}:
 *   put:
 *     summary: Atualiza os dados de um pedido específico
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
router.put(
  "/:id",
  validateIdParam,
  validateUpdateOrder,
  orderController.updateOrder
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
router.delete("/:id", validateIdParam, orderController.deleteOrder);

export default router;
