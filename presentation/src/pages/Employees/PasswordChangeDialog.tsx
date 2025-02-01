// src/pages/Employees/PasswordChangeDialog.tsx

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { employeeService } from "../../services/employee.service";
import { useToast } from "../../hooks/useToast";
import { LoadingButton } from "../../components/LoadingButton";

interface PasswordChangeDialogProps {
  open: boolean;
  employeeId: number | null;
  onClose: () => void;
}

export function PasswordChangeDialog({
  open,
  employeeId,
  onClose,
}: PasswordChangeDialogProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!employeeId) return;
      return employeeService.updatePassword(
        employeeId,
        oldPassword,
        newPassword
      );
    },
    onSuccess: () => {
      showToast("Senha alterada com sucesso", "success");
      handleClose();
    },
    onError: () => {
      showToast("Erro ao alterar senha", "error");
    },
  });

  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      showToast("Preencha todos os campos", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("A nova senha deve ter no mínimo 6 caracteres", "error");
      return;
    }

    mutation.mutate();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Senha Atual"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Nova Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              helperText="Mínimo de 6 caracteres"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={mutation.isPending}
          >
            Confirmar
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
