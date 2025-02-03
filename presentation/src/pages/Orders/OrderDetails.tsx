// src/pages/Orders/OrderDetails.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { orderService } from "../../services/order.service";
import { OrderStatus, calculateOrderTotal } from "../../types/order";
import { useToast } from "../../hooks/useToast";
import { CurrencyFormat } from "../../components/CurrencyFormat";

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast, ToastComponent } = useToast();
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderById(Number(id)),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) =>
      orderService.updateOrderStatus(Number(id), status),
    onSuccess: () => {
      showToast("Status atualizado com sucesso", "success");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      setNewStatus("");
    },
    onError: () => {
      showToast("Erro ao atualizar status", "error");
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(Number(id)),
    onSuccess: () => {
      showToast("Pedido cancelado com sucesso", "success");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      setCancelDialogOpen(false);
    },
    onError: () => {
      showToast("Erro ao cancelar pedido", "error");
    },
  });

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: "pending", label: "Pendente" },
    { value: "in_preparation", label: "Em Preparação" },
    { value: "delivered", label: "Entregue" },
    { value: "canceled", label: "Cancelado" },
  ];

  if (isLoading || !order) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

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
        <Typography component="h1" variant="h4">
          Pedido #{order.id}
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/orders")}>
          Voltar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Informações Gerais */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography component="h2" variant="h6" gutterBottom>
              Informações Gerais
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Mesa:
                </Typography>{" "}
                <Typography component="span">{order.table_id}</Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Data:
                </Typography>{" "}
                <Typography component="span">
                  {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  Status:
                </Typography>{" "}
                <Chip
                  label={
                    statusOptions.find((s) => s.value === order.status)?.label
                  }
                  color={order.status === "canceled" ? "error" : "primary"}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Atualização de Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography component="h2" variant="h6" gutterBottom>
              Atualizar Status
            </Typography>
            {order.status !== "canceled" && order.status !== "delivered" && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Novo Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="Novo Status"
                    onChange={(e) =>
                      setNewStatus(e.target.value as OrderStatus)
                    }
                  >
                    {statusOptions.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        disabled={option.value === order.status}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!newStatus || updateStatusMutation.isPending}
                    onClick={() =>
                      newStatus && updateStatusMutation.mutate(newStatus)
                    }
                  >
                    Atualizar Status
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={["canceled", "delivered"].includes(order.status)}
                  >
                    Cancelar Pedido
                  </Button>
                </Box>
              </Box>
            )}
            {(order.status === "canceled" || order.status === "delivered") && (
              <Box sx={{ mt: 2 }}>
                <Typography color="text.secondary">
                  Este pedido não pode mais ser alterado.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Itens do Pedido */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography component="h2" variant="h6" gutterBottom>
              Itens do Pedido
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell align="center">Quantidade</TableCell>
                  <TableCell align="right">Preço Unitário</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body1">
                        {item.product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.product.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">
                      <CurrencyFormat value={item.price_at_order_time} />
                    </TableCell>
                    <TableCell align="right">
                      <CurrencyFormat
                        value={item.price_at_order_time * item.quantity}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {/* Linha do Total */}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography component="span" sx={{ fontWeight: "bold" }}>
                      Total:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography component="span" sx={{ fontWeight: "bold" }}>
                      <CurrencyFormat
                        value={calculateOrderTotal(order.items)}
                      />
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de Confirmação de Cancelamento */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Cancelamento</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tem certeza que deseja cancelar este pedido? Esta ação não pode ser
            desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={cancelOrderMutation.isPending}
          >
            Não
          </Button>
          <Button
            onClick={() => cancelOrderMutation.mutate()}
            color="error"
            variant="contained"
            disabled={cancelOrderMutation.isPending}
          >
            {cancelOrderMutation.isPending
              ? "Cancelando..."
              : "Sim, Cancelar Pedido"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status de Loading */}
      {(updateStatusMutation.isPending || cancelOrderMutation.isPending) && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <ToastComponent />
    </Box>
  );
}
