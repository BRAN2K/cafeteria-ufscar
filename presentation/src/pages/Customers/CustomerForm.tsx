import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  InputAdornment,
} from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { customerService, Customer } from "../../services/customer.service";
import { useToast } from "../../hooks/useToast";
import { LoadingButton } from "../../components/LoadingButton";
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from "../../validations/customer.validations";
import { PasswordField } from "../../components/PasswordFields";

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Carregar dados do cliente se for edição
  const { data: customer } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => customerService.getCustomerById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      });
    }
  }, [customer]);

  const mutation = useMutation({
    mutationFn: async (data: Omit<Customer, "id">) => {
      if (id) {
        await customerService.updateCustomer(Number(id), data);
        return Number(id);
      }
      return customerService.createCustomer(data);
    },
    onSuccess: () => {
      showToast(
        id ? "Cliente atualizado com sucesso" : "Cliente criado com sucesso",
        "success"
      );
      navigate("/customers");
    },
    onError: () => {
      showToast(
        id ? "Erro ao atualizar cliente" : "Erro ao criar cliente",
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

    if (formData.phone && !validatePhone(formData.phone)) {
      showToast("Formato de telefone inválido", "error");
      return;
    }

    if (!id && !validatePassword(formData.password || "")) {
      showToast("A senha deve ter no mínimo 6 caracteres", "error");
      return;
    }

    const customerData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      ...(formData.password && { password: formData.password }),
    };

    mutation.mutate(customerData);
  };

  const handleChange =
    (field: keyof CustomerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {id ? "Editar Cliente" : "Novo Cliente"}
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
              <TextField
                fullWidth
                label="Telefone"
                value={formData.phone}
                onChange={handleChange("phone")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+55</InputAdornment>
                  ),
                }}
              />
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
                <Button
                  variant="outlined"
                  onClick={() => navigate("/customers")}
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
