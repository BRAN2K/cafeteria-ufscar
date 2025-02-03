import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Chip,
  IconButton,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { orderService } from "../../services/order.service";
import { calculateOrderTotal, OrderStatus } from "../../types/order";
import { PageHeader } from "../../components/PageHeader";

export function Orders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page, rowsPerPage],
    queryFn: () => orderService.getOrders(page + 1, rowsPerPage),
  });

  const getStatusColor = (
    status: OrderStatus
  ): "warning" | "info" | "success" | "error" => {
    const colors = {
      pending: "warning",
      in_preparation: "info",
      delivered: "success",
      canceled: "error",
    } as const;
    return colors[status];
  };

  const getStatusText = (status: OrderStatus) => {
    const texts = {
      pending: "Pendente",
      in_preparation: "Em Preparação",
      delivered: "Entregue",
      canceled: "Cancelado",
    };
    return texts[status];
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Box>
      <PageHeader
        title="Pedidos"
        action={{
          label: "Novo Pedido",
          onClick: () => navigate("/orders/new"),
        }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pedido #</TableCell>
              <TableCell>Mesa</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>Mesa {order.table_id}</TableCell>
                <TableCell>
                  {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(calculateOrderTotal(order.items))}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
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
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Itens por página"
        />
      </TableContainer>
    </Box>
  );
}
