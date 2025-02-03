/**
 * @openapi
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador único da mesa
 *         table_number:
 *           type: integer
 *           description: Número da mesa
 *         capacity:
 *           type: integer
 *           description: Capacidade de lugares da mesa
 *         status:
 *           type: string
 *           description: Estado da mesa (available, unavailable)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data/hora em que a mesa foi criada
 */
