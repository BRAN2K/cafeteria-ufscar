import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { reservationService } from "../../../services/reservation.service";
import { useToast } from "../../../hooks/useToast";
import { ConfirmDialog } from "../../../components/ConfirmDialog";

export function CustomerReservations() {
  const [cancelId, setCancelId] = useState<number | null>(null);
  const { showToast, ToastComponent } = useToast();

  // Buscar apenas as reservas do cliente logado
  const {
    data: reservations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["customer-reservations"],
    queryFn: () => reservationService.getReservations(1, 100),
  });

  const handleCancelReservation = async () => {
    if (cancelId) {
      try {
        await reservationService.cancelReservation(cancelId);
        showToast("Reserva cancelada com sucesso", "success");
        refetch();
      } catch {
        showToast("Erro ao cancelar reserva", "error");
      }
      setCancelId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "canceled":
        return "error";
      case "completed":
        return "default";
      default:
        return "primary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa";
      case "canceled":
        return "Cancelada";
      case "completed":
        return "Concluída";
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Minhas Reservas</Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : !reservations?.records.length ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            Você ainda não possui reservas
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mesa</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.records.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>Mesa {reservation.table_id}</TableCell>
                  <TableCell>
                    {format(new Date(reservation.start_time), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(reservation.start_time), "HH:mm", {
                      locale: ptBR,
                    })}
                    {" - "}
                    {format(new Date(reservation.end_time), "HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(reservation.status)}
                      color={getStatusColor(reservation.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => setCancelId(reservation.id)}
                      disabled={reservation.status !== "active"}
                      title={
                        reservation.status !== "active"
                          ? "Não é possível cancelar esta reserva"
                          : "Cancelar reserva"
                      }
                    >
                      <CancelIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmação de cancelamento */}
      <ConfirmDialog
        open={!!cancelId}
        title="Cancelar Reserva"
        message="Tem certeza que deseja cancelar esta reserva?"
        onConfirm={handleCancelReservation}
        onCancel={() => setCancelId(null)}
      />

      <ToastComponent />
    </Box>
  );
}
