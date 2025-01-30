import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { reservationService } from "../../services/reservation.service";
import { customerService } from "../../services/customer.service";
import { useAvailableSlots } from "../../hooks/useAvailableSlots";
import { useToast } from "../../hooks/useToast";
import { ReservationStatus } from "../../services/reservation.service";

interface ReservationFormData {
  table_id: string;
  customer_id: string;
  start_time: Date | null;
  end_time: Date | null;
}

const steps = [
  "Selecionar Data",
  "Escolher Mesa",
  "Informações do Cliente",
  "Confirmação",
];

export function ReservationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState<ReservationFormData>({
    table_id: "",
    customer_id: "",
    start_time: null,
    end_time: null,
  });

  // Carregar dados da reserva se for edição
  const { data: reservation } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => reservationService.getReservationById(Number(id)),
    enabled: !!id,
  });

  // Buscar lista de clientes
  const { data: customersResponse, isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAllCustomers(),
  });

  // Buscar mesas disponíveis
  const { data: availableTables, isLoading: loadingTables } = useQuery({
    queryKey: ["available-tables", formData.start_time, formData.end_time],
    queryFn: () => {
      if (formData.start_time && formData.end_time) {
        return reservationService.checkAvailability(
          format(formData.start_time, "yyyy-MM-dd HH:mm:ss"),
          format(formData.end_time, "yyyy-MM-dd HH:mm:ss")
        );
      }
      return [];
    },
    enabled: !!(formData.start_time && formData.end_time),
  });

  // Hook personalizado para slots de horário
  const { slots, loading: loadingSlots } = useAvailableSlots(
    formData.start_time ? new Date(formData.start_time) : null
  );

  // Carregar dados da reserva quando disponível
  useEffect(() => {
    if (reservation) {
      setFormData({
        table_id: reservation.table_id.toString(),
        customer_id: reservation.customer_id.toString(),
        start_time: new Date(reservation.start_time),
        end_time: new Date(reservation.end_time),
      });
    }
  }, [reservation]);

  // Mutation para criar/atualizar reserva
  const mutation = useMutation({
    mutationFn: async (data: ReservationFormData) => {
      const reservationData = {
        table_id: Number(data.table_id),
        customer_id: Number(data.customer_id),
        start_time: format(data.start_time!, "yyyy-MM-dd HH:mm:ss"),
        end_time: format(data.end_time!, "yyyy-MM-dd HH:mm:ss"),
        status: "active" as ReservationStatus,
      };

      if (id) {
        await reservationService.updateReservation(Number(id), reservationData);
        return Number(id);
      }
      return reservationService.createReservation(reservationData);
    },
    onSuccess: () => {
      showToast(
        id ? "Reserva atualizada com sucesso" : "Reserva criada com sucesso",
        "success"
      );
      navigate("/reservations");
    },
    onError: () => {
      showToast(
        id ? "Erro ao atualizar reserva" : "Erro ao criar reserva",
        "error"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    mutation.mutate(formData);
  };

  const validateForm = (): boolean => {
    if (!formData.start_time || !formData.end_time) {
      showToast("Selecione os horários da reserva", "error");
      return false;
    }

    if (formData.start_time >= formData.end_time) {
      showToast(
        "O horário de início deve ser anterior ao horário de término",
        "error"
      );
      return false;
    }

    if (!formData.table_id) {
      showToast("Selecione uma mesa", "error");
      return false;
    }

    if (!formData.customer_id) {
      showToast("Selecione um cliente", "error");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Data
        if (!formData.start_time || !formData.end_time) {
          showToast("Selecione um horário disponível", "error");
          return false;
        }
        return true;

      case 1: // Mesa
        if (!formData.table_id) {
          showToast("Selecione uma mesa", "error");
          return false;
        }
        return true;

      case 2: // Cliente
        if (!formData.customer_id) {
          showToast("Selecione um cliente", "error");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      // Seleção de Data
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Data da Reserva"
                value={formData.start_time}
                onChange={(newValue) => {
                  if (newValue) {
                    // Resetar o horário ao selecionar uma nova data
                    setFormData((prev) => ({
                      ...prev,
                      start_time: newValue,
                      end_time: null,
                      table_id: "",
                    }));
                  }
                }}
                views={["year", "month", "day"]} // Remover seleção de hora
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              {formData.start_time && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Horários Disponíveis
                  </Typography>
                  {loadingSlots ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 3 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: 2,
                      }}
                    >
                      {slots.map((slot, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 2,
                            cursor: slot.available ? "pointer" : "not-allowed",
                            bgcolor: slot.available
                              ? formData.start_time?.getTime() ===
                                slot.start.getTime()
                                ? "primary.light"
                                : "background.paper"
                              : "action.disabledBackground",
                            "&:hover": slot.available
                              ? {
                                  bgcolor: "action.hover",
                                }
                              : {},
                            opacity: slot.available ? 1 : 0.7,
                          }}
                          onClick={() => {
                            if (slot.available) {
                              setFormData((prev) => ({
                                ...prev,
                                start_time: slot.start,
                                end_time: slot.end,
                                table_id: "",
                              }));
                            }
                          }}
                        >
                          <Typography variant="subtitle1" align="center">
                            {format(slot.start, "HH:mm")} -{" "}
                            {format(slot.end, "HH:mm")}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={
                              slot.available ? "success.main" : "error.main"
                            }
                            align="center"
                            display="block"
                          >
                            {slot.available ? "Disponível" : "Indisponível"}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        );

      case 1: // Seleção de Mesa
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Mesas Disponíveis para{" "}
              {formData.start_time &&
                format(formData.start_time, "dd 'de' MMMM 'às' HH:mm", {
                  locale: ptBR,
                })}
            </Typography>
            {loadingTables ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {availableTables?.map((table) => (
                  <Grid item xs={12} sm={6} md={4} key={table.id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        bgcolor:
                          formData.table_id === table.id.toString()
                            ? "primary.light"
                            : "background.paper",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          table_id: table.id.toString(),
                        }))
                      }
                    >
                      <Typography variant="h6">
                        Mesa {table.table_number}
                      </Typography>
                      <Typography color="text.secondary">
                        {table.capacity} lugares
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 2: // Seleção de Cliente
        return (
          <Box>
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={formData.customer_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customer_id: e.target.value as string,
                  }))
                }
                label="Cliente"
                disabled={loadingCustomers}
              >
                {loadingCustomers ? (
                  <MenuItem disabled>Carregando clientes...</MenuItem>
                ) : (
                  customersResponse?.data.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        );

      case 3: // Confirmação
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirmar Reserva
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Data e Horário
                  </Typography>
                  <Typography>
                    Início:{" "}
                    {formData.start_time &&
                      format(formData.start_time, "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                  </Typography>
                  <Typography>
                    Término:{" "}
                    {formData.end_time &&
                      format(formData.end_time, "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Mesa Selecionada
                  </Typography>
                  {availableTables?.find(
                    (t) => t.id.toString() === formData.table_id
                  ) && (
                    <>
                      <Typography>
                        Mesa{" "}
                        {
                          availableTables.find(
                            (t) => t.id.toString() === formData.table_id
                          )?.table_number
                        }
                      </Typography>
                      <Typography color="text.secondary">
                        {
                          availableTables.find(
                            (t) => t.id.toString() === formData.table_id
                          )?.capacity
                        }{" "}
                        lugares
                      </Typography>
                    </>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Cliente
                  </Typography>
                  {customersResponse?.data.find(
                    (c) => c.id.toString() === formData.customer_id
                  ) && (
                    <>
                      <Typography>
                        {
                          customersResponse.data.find(
                            (c) => c.id.toString() === formData.customer_id
                          )?.name
                        }
                      </Typography>
                      <Typography color="text.secondary">
                        {
                          customersResponse.data.find(
                            (c) => c.id.toString() === formData.customer_id
                          )?.email
                        }
                      </Typography>
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {id ? "Editar Reserva" : "Nova Reserva"}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/reservations")}
            >
              Cancelar
            </Button>

            {activeStep > 0 && (
              <Button variant="outlined" onClick={handleBack}>
                Voltar
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Salvando..." : "Confirmar Reserva"}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Próximo
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      <ToastComponent />
    </Box>
  );
}
