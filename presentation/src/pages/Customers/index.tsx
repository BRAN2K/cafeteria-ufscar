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
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "../../services/customer.service";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { PasswordChangeDialog } from "./PasswordChangeDialog";

export function Customers() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [passwordChange, setPasswordChange] = useState<{
    open: boolean;
    customerId: number | null;
  }>({ open: false, customerId: null });

  const { showToast, ToastComponent } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customers", page, rowsPerPage, search],
    queryFn: () => customerService.getCustomers(page + 1, rowsPerPage, search),
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
        await customerService.deleteCustomer(deleteId);
        showToast("Cliente excluído com sucesso", "success");
        refetch();
      } catch {
        showToast("Erro ao excluir cliente", "error");
      }
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Clientes"
        action={{
          label: "Novo Cliente",
          onClick: () => navigate("/customers/new"),
        }}
      />

      {/* Barra de Pesquisa */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tabela de Clientes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || "-"}</TableCell>
                <TableCell align="center">
                  <Box
                    sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      size="small"
                      title="Editar cliente"
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="warning"
                      onClick={() =>
                        setPasswordChange({
                          open: true,
                          customerId: customer.id,
                        })
                      }
                      size="small"
                      title="Alterar senha"
                    >
                      <LockIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => setDeleteId(customer.id)}
                      size="small"
                      title="Excluir cliente"
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
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Diálogo de Alteração de Senha */}
      <PasswordChangeDialog
        open={passwordChange.open}
        customerId={passwordChange.customerId}
        onClose={() => setPasswordChange({ open: false, customerId: null })}
      />

      {/* Componente de Toast para feedback */}
      <ToastComponent />

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
    </Box>
  );
}
