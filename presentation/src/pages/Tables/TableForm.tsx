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
import { tableService } from "../../services/table.service";
import { useToast } from "../../hooks/useToast";
import { LoadingButton } from "../../components/LoadingButton";

interface TableFormData {
  table_number: string;
  capacity: string;
  status: "available" | "unavailable";
}

const statusOptions = [
  { value: "available", label: "Disponível" },
  { value: "unavailable", label: "Indisponível" },
];

export function TableForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState<TableFormData>({
    table_number: "",
    capacity: "",
    status: "available",
  });

  const { data: table } = useQuery({
    queryKey: ["table", id],
    queryFn: () => tableService.getTableById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (table) {
      setFormData({
        table_number: String(table.table_number),
        capacity: String(table.capacity),
        status: table.status,
      });
    }
  }, [table]);

  const mutation = useMutation({
    mutationFn: async (data: TableFormData) => {
      const tableData = {
        table_number: Number(data.table_number),
        capacity: Number(data.capacity),
        status: data.status,
      };

      if (id) {
        await tableService.updateTable(Number(id), tableData);
        return Number(id);
      }
      return tableService.createTable(tableData);
    },
    onSuccess: () => {
      showToast(
        id ? "Mesa atualizada com sucesso" : "Mesa criada com sucesso",
        "success"
      );
      navigate("/tables");
    },
    onError: () => {
      showToast(id ? "Erro ao atualizar mesa" : "Erro ao criar mesa", "error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.table_number.trim()) {
      showToast("Número da mesa é obrigatório", "error");
      return;
    }

    if (Number(formData.table_number) <= 0) {
      showToast("Número da mesa deve ser maior que zero", "error");
      return;
    }

    if (!formData.capacity.trim()) {
      showToast("Capacidade é obrigatória", "error");
      return;
    }

    if (Number(formData.capacity) <= 0) {
      showToast("Capacidade deve ser maior que zero", "error");
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange =
    (field: keyof TableFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {id ? "Editar Mesa" : "Nova Mesa"}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número da Mesa"
                type="number"
                value={formData.table_number}
                onChange={handleChange("table_number")}
                required
                inputProps={{
                  min: "1",
                  step: "1",
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Capacidade"
                type="number"
                value={formData.capacity}
                onChange={handleChange("capacity")}
                required
                inputProps={{
                  min: "1",
                  step: "1",
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as TableFormData["status"],
                    }))
                  }
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/tables")}
                  disabled={mutation.isPending}
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
