/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador único do item do pedido
 *         order_id:
 *           type: integer
 *           description: ID do pedido ao qual este item pertence
 *         product_id:
 *           type: integer
 *           description: ID do produto relacionado a este item
 *         quantity:
 *           type: integer
 *           description: Quantidade do produto neste item
 *         price_at_order_time:
 *           type: number
 *           format: float
 *           description: Valor unitário do produto no momento em que o pedido foi feito
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data/hora em que o item foi criado
 */
