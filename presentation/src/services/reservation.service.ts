import api from "./api";

export type ReservationStatus = "active" | "canceled" | "completed";

export interface Reservation {
  id: number;
  table_id: number;
  customer_id: number;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  customer_name?: string;
  customer_email?: string;
}

export interface ReservationResponse {
  page: number;
  limit: number;
  total: number;
  records: Reservation[];
}

export interface TableAvailability {
  id: number;
  table_number: number;
  capacity: number;
  status: string;
}

export const reservationService = {
  async getReservations(
    page = 1,
    limit = 10,
    filters?: {
      status?: string;
      table_id?: number;
      start_time?: string;
      end_time?: string;
      customer_id?: number;
    }
  ): Promise<ReservationResponse> {
    const { data } = await api.get("/reservations", {
      params: {
        page,
        limit,
        ...filters,
      },
    });
    return data;
  },

  async getReservationById(id: number): Promise<Reservation> {
    const { data } = await api.get(`/reservations/${id}`);
    return data;
  },

  async createReservation(
    reservation: Omit<Reservation, "id">
  ): Promise<number> {
    const { data } = await api.post("/reservations", reservation);
    return data.reservationId;
  },

  async updateReservation(
    id: number,
    reservation: Partial<Reservation>
  ): Promise<number> {
    await api.put(`/reservations/${id}`, reservation);
    return id;
  },

  async cancelReservation(id: number): Promise<void> {
    await api.patch(`/reservations/${id}/cancel`);
  },

  async checkAvailability(
    start: string,
    end: string
  ): Promise<TableAvailability[]> {
    const { data } = await api.get("/reservations/check-availability", {
      params: { start, end },
    });
    return data.available_tables;
  },
};
