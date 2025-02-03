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
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { tableService } from "../../services/table.service";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";

export function Tables() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { showToast, ToastComponent } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tables", page, rowsPerPage],
    queryFn: () => tableService.getTables(page + 1, rowsPerPage),
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

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await tableService.deleteTable(deleteId);
        showToast("Mesa excluída com sucesso", "success");
        refetch();
      } catch {
        showToast("Erro ao excluir mesa", "error");
      }
      setDeleteId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "unavailable":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível";
      case "unavailable":
        return "Indisponível";
      default:
        return status;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Mesas"
        action={{
          label: "Nova Mesa",
          onClick: () => navigate("/tables/new"),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell align="center">Capacidade</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((table) => (
              <TableRow key={table.id}>
                <TableCell>Mesa {table.table_number}</TableCell>
                <TableCell align="center">{table.capacity} lugares</TableCell>
                <TableCell align="center">
                  <Chip
                    label={getStatusText(table.status)}
                    color={getStatusColor(table.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/tables/${table.id}`)}
                      size="small"
                      title="Editar mesa"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteId(table.id)}
                      size="small"
                      title="Excluir mesa"
                    >
                      <DeleteIcon />
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

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Mesa"
        message="Tem certeza que deseja excluir esta mesa? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ToastComponent />

      {/* Loading State */}
      {isLoading && (
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
    </Box>
  );
}
