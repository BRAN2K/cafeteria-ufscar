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
import { checkAuth } from "../middlewares/checkAuth";
import { checkRole } from "../middlewares/checkRole";

const router = Router();
const reservationController = new ReservationController();

/**
 * @openapi
 * /reservations:
 *   post:
 *     summary: Cria uma nova reserva
 *     tags:
 *       - Reservations
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       409:
 *         description: Conflito de horário/mesa
 *       500:
 *         description: Erro interno
 */
router.post(
  // #TODO: Implementar lógica de criação de reservas do cliente autenticado
  // (cliente não pode criar reservas em nome de outros clientes)
  "/",
  checkAuth,
  checkRole(["admin", "manager", "attendant", "customer"]),
  validateCreateReservation,
  (req, res, next) => reservationController.createReservation(req, res, next)
);

/**
 * @openapi
 * /reservations:
 *   get:
 *     summary: Retorna lista paginada de reservas com filtros opcionais
 *     tags:
 *       - Reservations
 *     security:
 *       - BearerAuth: []
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
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       500:
 *         description: Erro interno
 */
router.get(
  // #TODO: Implementar lógica de recuperação de informaçoes de reservas do cliente autenticado
  // (cliente não pode recuperar informações de reservas que não são dele)
  "/",
  checkAuth,
  checkRole(["admin", "manager", "attendant", "customer"]),
  validatePagination,
  (req, res, next) => reservationController.getAllReservations(req, res, next)
);

/**
 * @openapi
 * /reservations/check-availability:
 *   get:
 *     summary: Verifica mesas disponíveis em um intervalo de tempo
 *     tags:
 *       - Reservations
 *     security:
 *       - BearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available_tables:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Table'
 *       400:
 *         description: Parâmetros inválidos (sem start ou end)
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       500:
 *         description: Erro interno
 */
router.get(
  "/check-availability",
  checkAuth,
  checkRole(["admin", "manager", "attendant", "customer"]),
  validateCheckAvailability,
  (req, res, next) => reservationController.checkAvailability(req, res, next)
);

/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     summary: Retorna uma reserva específica pelo ID
 *     tags:
 *       - Reservations
 *     security:
 *       - BearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Parâmetro inválido
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Reserva não encontrada
 *       500:
 *         description: Erro interno
 */
router.get(
  // #TODO: Implementar lógica de recuperação de informaçoes de reserva do cliente autenticado
  // (cliente não pode recuperar informações de uma reserva que não são dele)
  "/:id",
  checkAuth,
  checkRole(["admin", "manager", "attendant", "customer"]),
  validateIdParam,
  (req, res, next) => reservationController.getReservationById(req, res, next)
);

/**
 * @openapi
 * /reservations/{id}:
 *   put:
 *     summary: Atualiza os dados de uma reserva
 *     tags:
 *       - Reservations
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Reserva não encontrada
 *       409:
 *         description: Conflito de horário/mesa
 *       500:
 *         description: Erro interno
 */
router.put(
  // #TODO: Implementar lógica de atualização de reserva do cliente autenticado
  // (cliente não pode atualizar reservas que não são dele)
  "/:id",
  checkAuth,
  checkRole(["admin", "manager", "attendant", "customer"]),
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
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Falha de autenticação
 *       403:
 *         description: Role não autorizada
 *       404:
 *         description: Reserva não encontrada ou já cancelada
 *       500:
 *         description: Erro interno
 */
router.patch(
  // #TODO: Implementar lógica de cancelamento de reserva do cliente autenticado
  // (cliente não pode cancelar reservas que não são dele)
  "/:id/cancel",
  checkAuth,
  checkRole(["admin", "manager", "attendant", "customer"]),
  validateIdParam,
  (req, res, next) => reservationController.cancelReservation(req, res, next)
);

export default router;
