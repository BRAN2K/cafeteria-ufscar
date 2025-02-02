// src/pages/Customers/PasswordChangeDialog.tsx

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { customerService } from "../../services/customer.service";
import { useToast } from "../../hooks/useToast";
import { LoadingButton } from "../../components/LoadingButton";
import { PasswordField } from "../../components/PasswordFields";

interface PasswordChangeDialogProps {
  open: boolean;
  customerId: number | null;
  onClose: () => void;
}

export function PasswordChangeDialog({
  open,
  customerId,
  onClose,
}: PasswordChangeDialogProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { showToast } = useToast();

  // src/pages/Customers/PasswordChangeDialog.tsx (continuação)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!customerId) return;
      return customerService.updatePassword(
        customerId,
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
            <PasswordField
              margin="normal"
              required
              fullWidth
              label="Senha Atual"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
            />
            <PasswordField
              margin="normal"
              required
              fullWidth
              label="Nova Senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="current-password"
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
