/**
 * @openapi
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador único da reserva
 *         table_id:
 *           type: integer
 *           description: ID da mesa reservada
 *         customer_id:
 *           type: integer
 *           description: ID do cliente que realizou a reserva
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Data/hora de início da reserva
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Data/hora de término da reserva
 *         status:
 *           type: string
 *           description: Status da reserva (active, canceled, completed)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data/hora em que a reserva foi criada
 *         customer_name:
 *           type: string
 *           description: Nome do cliente que realizou a reserva
 *         customer_email:
 *           type: string
 *           description: E-mail do cliente que realizou a reserva
 */
