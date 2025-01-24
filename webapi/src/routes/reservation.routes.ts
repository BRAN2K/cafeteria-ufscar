import { Router } from "express";
import { ReservationController } from "../controllers/reservation.controller";
import {
  validateCheckAvailability,
  validateCreateReservation,
  validateUpdateReservation,
} from "../validations/reservation.validations";
import {
  validatePagination,
  validateIdParam,
} from "../validations/shared.validations";

const router = Router();
const reservationController = new ReservationController();

/**
 * @openapi
 * /reservations:
 *   post:
 *     summary: Cria uma nova reserva
 *     tags:
 *       - Reservations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_id:
 *                 type: number
 *               customer_id:
 *                 type: number
 *               start_time:
 *                 type: string
 *                 description: Formato "yyyy-MM-dd HH:mm:ss" (ex. 2025-02-05 19:00:00)
 *               end_time:
 *                 type: string
 *                 description: Formato "yyyy-MM-dd HH:mm:ss" (ex. 2025-02-05 21:00:00)
 *               status:
 *                 type: string
 *             required:
 *               - table_id
 *               - customer_id
 *               - start_time
 *               - end_time
 *             example:
 *               table_id: 1
 *               customer_id: 2
 *               start_time: "2025-02-05 19:00:00"
 *               end_time: "2025-02-05 21:00:00"
 *               status: "active"
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *       400:
 *         description: Erro de validação
 *       409:
 *         description: Conflito de horário/mesa
 *       500:
 *         description: Erro interno
 */
router.post("/", validateCreateReservation, (req, res, next) =>
  reservationController.createReservation(req, res, next)
);

/**
 * @openapi
 * /reservations:
 *   get:
 *     summary: Retorna lista paginada de reservas com filtros opcionais
 *     tags:
 *       - Reservations
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtra pelo status da reserva (ex. 'active', 'canceled', ...)
 *       - in: query
 *         name: table_id
 *         schema:
 *           type: number
 *         description: Filtra por mesa específica
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *         description: Formato "yyyy-MM-dd HH:mm:ss" para filtrar reservas cujo end_time >= start_time
 *       - in: query
 *         name: end_time
 *         schema:
 *           type: string
 *         description: Formato "yyyy-MM-dd HH:mm:ss" para filtrar reservas cujo start_time <= end_time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página (padrão = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Itens por página (padrão = 10, max 100)
 *     responses:
 *       200:
 *         description: Lista de reservas paginada
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno
 */
router.get("/", validatePagination, (req, res, next) =>
  reservationController.getAllReservations(req, res, next)
);

/**
 * @openapi
 * /reservations/check-availability:
 *   get:
 *     summary: Verifica mesas disponíveis em um intervalo de tempo
 *     tags:
 *       - Reservations
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           description: Formato "yyyy-MM-dd HH:mm:ss"
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           description: Formato "yyyy-MM-dd HH:mm:ss"
 *     responses:
 *       200:
 *         description: Lista de mesas livres no intervalo
 *       400:
 *         description: Parâmetros inválidos (sem start ou end)
 *       500:
 *         description: Erro interno
 */
router.get("/check-availability", validateCheckAvailability, (req, res, next) =>
  reservationController.checkAvailability(req, res, next)
);
/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     summary: Retorna uma reserva específica pelo ID
 *     tags:
 *       - Reservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID da reserva
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *       400:
 *         description: Parâmetro inválido
 *       404:
 *         description: Reserva não encontrada
 *       500:
 *         description: Erro interno
 */
router.get("/:id", validateIdParam, (req, res, next) =>
  reservationController.getReservationById(req, res, next)
);

/**
 * @openapi
 * /reservations/{id}:
 *   put:
 *     summary: Atualiza os dados de uma reserva
 *     tags:
 *       - Reservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID da reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_id:
 *                 type: number
 *               customer_id:
 *                 type: number
 *               start_time:
 *                 type: string
 *                 description: Formato "yyyy-MM-dd HH:mm:ss"
 *               end_time:
 *                 type: string
 *                 description: Formato "yyyy-MM-dd HH:mm:ss"
 *               status:
 *                 type: string
 *             example:
 *               table_id: 3
 *               customer_id: 5
 *               start_time: "2025-02-05 19:00:00"
 *               end_time: "2025-02-05 22:00:00"
 *               status: "active"
 *     responses:
 *       200:
 *         description: Reserva atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Reserva não encontrada
 *       409:
 *         description: Conflito de horário/mesa
 *       500:
 *         description: Erro interno
 */
router.put(
  "/:id",
  validateIdParam,
  validateUpdateReservation,
  (req, res, next) => reservationController.updateReservation(req, res, next)
);

/**
 * @openapi
 * /reservations/{id}/cancel:
 *   patch:
 *     summary: Cancela explicitamente uma reserva (status = "canceled")
 *     tags:
 *       - Reservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID da reserva
 *     responses:
 *       200:
 *         description: Reserva cancelada com sucesso
 *       404:
 *         description: Reserva não encontrada ou já cancelada
 *       500:
 *         description: Erro interno
 */
router.patch("/:id/cancel", validateIdParam, (req, res, next) =>
  reservationController.cancelReservation(req, res, next)
);

export default router;