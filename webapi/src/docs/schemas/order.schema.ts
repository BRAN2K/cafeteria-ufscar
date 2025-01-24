/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItemProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock_quantity:
 *           type: integer
 *
 *     OrderItemWithProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do item do pedido
 *         quantity:
 *           type: integer
 *           description: Quantidade do produto neste item
 *         price_at_order_time:
 *           type: number
 *           description: Preço do produto naquele momento
 *         product:
 *           $ref: "#/components/schemas/OrderItemProduct"
 *
 *     CreateOrderItemInput:
 *       type: object
 *       properties:
 *         product_id:
 *           type: integer
 *         quantity:
 *           type: integer
 *
 *     CreateOrderInput:
 *       type: object
 *       properties:
 *         table_id:
 *           type: number
 *         employee_id:
 *           type: number
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/CreateOrderItemInput"
 *
 *     OrderWithItems:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador único do pedido.
 *         table_id:
 *           type: integer
 *         employee_id:
 *           type: integer
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/OrderItemWithProduct"
 */
