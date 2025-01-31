import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Edit as EditIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { reservationService } from "../../services/reservation.service";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { DateTimePicker } from "@mui/x-date-pickers";

export function Reservations() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const { showToast, ToastComponent } = useToast();

  const [filters, setFilters] = useState({
    status: "",
    start_time: "",
    end_time: "",
  });

  // Atualizar a query para usar os filtros
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reservations", page, rowsPerPage, filters],
    queryFn: () =>
      reservationService.getReservations(page + 1, rowsPerPage, filters),
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCancel = async () => {
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
      <PageHeader
        title="Reservas"
        action={{
          label: "Nova Reserva",
          onClick: () => navigate("/reservations/new"),
        }}
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Ativas</MenuItem>
                <MenuItem value="canceled">Canceladas</MenuItem>
                <MenuItem value="completed">Concluídas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <DateTimePicker
              label="Data Inicial"
              value={filters.start_time ? new Date(filters.start_time) : null}
              onChange={(newValue) => {
                setFilters((prev) => ({
                  ...prev,
                  start_time: newValue
                    ? format(newValue, "yyyy-MM-dd HH:mm:ss")
                    : "",
                }));
              }}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DateTimePicker
              label="Data Final"
              value={filters.end_time ? new Date(filters.end_time) : null}
              onChange={(newValue) => {
                setFilters((prev) => ({
                  ...prev,
                  end_time: newValue
                    ? format(newValue, "yyyy-MM-dd HH:mm:ss")
                    : "",
                }));
              }}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={() =>
                setFilters({ status: "", start_time: "", end_time: "" })
              }
            >
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Tabela de Reservas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mesa</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Término</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.records.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>Mesa {reservation.table_id}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {reservation.customer_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reservation.customer_email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {format(
                    new Date(reservation.start_time),
                    "dd/MM/yyyy HH:mm",
                    {
                      locale: ptBR,
                    }
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(reservation.end_time), "dd/MM/yyyy HH:mm", {
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
                  <Box
                    sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() =>
                        navigate(`/reservations/${reservation.id}`)
                      }
                      size="small"
                      title="Editar reserva"
                      disabled={reservation.status !== "active"}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => setCancelId(reservation.id)}
                      size="small"
                      title="Cancelar reserva"
                      disabled={reservation.status !== "active"}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </TableContainer>

      {/* Diálogo de Confirmação de Cancelamento */}
      <ConfirmDialog
        open={!!cancelId}
        title="Cancelar Reserva"
        message="Tem certeza que deseja cancelar esta reserva?"
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <ToastComponent />
    </Box>
  );
}
