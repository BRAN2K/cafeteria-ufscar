/**
 * @openapi
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador único do pedido.
 *         table_id:
 *           type: integer
 *           description: ID da mesa associada ao pedido.
 *         employee_id:
 *           type: integer
 *           description: ID do funcionário que abriu o pedido.
 *         status:
 *           type: string
 *           description: Estado atual do pedido (pending, in_preparation, delivered, canceled).
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data/hora em que o pedido foi criado.
 */
