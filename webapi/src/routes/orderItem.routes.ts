import { Router } from "express";
import { OrderItemController } from "../controllers/orderItem.controller";
import { validateCreateOrderItem } from "../validations/orderItem.validations";
import {
  validatePagination,
  validateIdParam,
} from "../validations/shared.validations";
import { checkAuth } from "../middlewares/checkAuth";
import { checkRole } from "../middlewares/checkRole";

const router = Router();
const orderItemController = new OrderItemController();

/**
 * @openapi
 * /order-items:
 *   post:
 *     summary: Cria um novo item de pedido
 *     tags:
 *       - OrderItems
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: number
 *               product_id:
 *                 type: number
 *               quantity:
 *                 type: number
 *             example:
 *               order_id: 1
 *               product_id: 2
 *               quantity: 3
 *     responses:
 *       201:
 *         description: Item de pedido criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Pedido ou Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/",
  checkAuth,
  checkRole(["admin", "manager", "attendant"]),
  validateCreateOrderItem,
  (req, res, next) => orderItemController.createOrderItem(req, res, next)
);

/**
 * @openapi
 * /order-items:
 *   get:
 *     summary: Retorna lista paginada de itens de pedido
 *     tags:
 *       - OrderItems
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: order_id
 *         schema:
 *           type: number
 *         description: (Opcional) Filtra por order_id específico
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Número da página (padrão = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Itens por página (padrão = 10)
 *     responses:
 *       200:
 *         description: Lista de itens de pedido paginada
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
 *                     $ref: '#/components/schemas/OrderItem'
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/",
  checkAuth,
  checkRole(["admin", "manager", "attendant"]),
  validatePagination,
  (req, res, next) => orderItemController.getAllOrderItems(req, res, next)
);

/**
 * @openapi
 * /order-items/{id}:
 *   get:
 *     summary: Obtém um item de pedido específico pelo ID
 *     tags:
 *       - OrderItems
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Item de pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderItem'
 *       400:
 *         description: Parâmetro inválido (id não numérico)
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Item de pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/:id",
  checkAuth,
  checkRole(["admin", "manager", "attendant"]),
  validateIdParam,
  (req, res, next) => orderItemController.getOrderItemById(req, res, next)
);

/**
 * @openapi
 * /order-items/{id}:
 *   delete:
 *     summary: Remove um item de pedido específico
 *     tags:
 *       - OrderItems
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Item de pedido removido com sucesso
 *       400:
 *         description: Parâmetro inválido
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Item de pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/:id",
  checkAuth,
  checkRole(["admin", "manager", "attendant"]),
  validateIdParam,
  (req, res, next) => orderItemController.deleteOrderItem(req, res, next)
);

export default router;
