// src/pages/Employees/EmployeeForm.tsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { employeeService, EmployeeRole } from "../../services/employee.service";
import { useToast } from "../../hooks/useToast";
import { LoadingButton } from "../../components/LoadingButton";
import { validateEmail } from "../../validations/employee.validations";
import { PasswordField } from "../../components/PasswordFields";

interface EmployeeFormData {
  name: string;
  email: string;
  role: EmployeeRole;
  password?: string;
}

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "attendant", label: "Atendente" },
];

export function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    email: "",
    role: "attendant",
    password: "",
  });

  const { data: employee } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getEmployeeById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        role: employee.role,
      });
    }
  }, [employee]);

  const mutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      if (id) {
        const { ...updateData } = data;
        await employeeService.updateEmployee(Number(id), updateData);
        return Number(id);
      }
      return employeeService.createEmployee(data as Required<EmployeeFormData>);
    },
    onSuccess: () => {
      showToast(
        id
          ? "Funcionário atualizado com sucesso"
          : "Funcionário criado com sucesso",
        "success"
      );
      navigate("/employees");
    },
    onError: () => {
      showToast(
        id ? "Erro ao atualizar funcionário" : "Erro ao criar funcionário",
        "error"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.name.trim()) {
      showToast("Nome é obrigatório", "error");
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast("Email inválido", "error");
      return;
    }

    if (!id && !formData.password) {
      showToast("Senha é obrigatória para novos funcionários", "error");
      return;
    }

    if (!id && formData.password && formData.password.length < 6) {
      showToast("A senha deve ter no mínimo 6 caracteres", "error");
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange =
    (field: keyof EmployeeFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {id ? "Editar Funcionário" : "Novo Funcionário"}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.name}
                onChange={handleChange("name")}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Cargo</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value as EmployeeRole,
                    }))
                  }
                  label="Cargo"
                  required
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {!id && (
              <Grid item xs={12}>
                <PasswordField
                  margin="normal"
                  required
                  fullWidth
                  label="Senha"
                  value={formData.password}
                  onChange={handleChange("password")}
                  autoComplete="current-password"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                // src/pages/Employees/EmployeeForm.tsx (conclusão)
                <Button
                  variant="outlined"
                  onClick={() => navigate("/employees")}
                >
                  Cancelar
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={mutation.isPending}
                >
                  {mutation.isPending ? "Salvando..." : "Salvar"}
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <ToastComponent />
    </Box>
  );
}
