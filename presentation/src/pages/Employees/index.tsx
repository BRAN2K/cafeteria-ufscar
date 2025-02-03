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
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { employeeService, EmployeeRole } from "../../services/employee.service";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { PasswordChangeDialog } from "./PasswordChangeDialog";

const getRoleLabel = (role: EmployeeRole) => {
  const labels = {
    admin: "Administrador",
    manager: "Gerente",
    attendant: "Atendente",
  };
  return labels[role] || role;
};

const getRoleColor = (
  role: EmployeeRole
): "error" | "warning" | "info" | "default" => {
  const colors: Record<EmployeeRole, "error" | "warning" | "info"> = {
    admin: "error",
    manager: "warning",
    attendant: "info",
  };
  return colors[role] || "default";
};

export function Employees() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [passwordChange, setPasswordChange] = useState<{
    open: boolean;
    employeeId: number | null;
  }>({ open: false, employeeId: null });

  const { showToast, ToastComponent } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["employees", page, rowsPerPage, search],
    queryFn: () => employeeService.getEmployees(page + 1, rowsPerPage, search),
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
        await employeeService.deleteEmployee(deleteId);
        showToast("Funcionário excluído com sucesso", "success");
        refetch();
      } catch {
        showToast("Erro ao excluir funcionário", "error");
      }
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Funcionários"
        action={{
          label: "Novo Funcionário",
          onClick: () => navigate("/employees/new"),
        }}
      />

      {/* Barra de Pesquisa */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar funcionários..."
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

      {/* Tabela de Funcionários */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(employee.role)}
                    color={getRoleColor(employee.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      size="small"
                      title="Editar funcionário"
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="warning"
                      onClick={() =>
                        setPasswordChange({
                          open: true,
                          employeeId: employee.id,
                        })
                      }
                      size="small"
                      title="Alterar senha"
                    >
                      <LockIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => setDeleteId(employee.id)}
                      size="small"
                      title="Excluir funcionário"
                      disabled={employee.role === "admin"} // Impede exclusão de admins
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
        title="Excluir Funcionário"
        message="Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Diálogo de Alteração de Senha */}
      <PasswordChangeDialog
        open={passwordChange.open}
        employeeId={passwordChange.employeeId}
        onClose={() => setPasswordChange({ open: false, employeeId: null })}
      />

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
