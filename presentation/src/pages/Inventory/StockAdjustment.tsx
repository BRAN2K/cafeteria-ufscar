// src/pages/Inventory/StockAdjustment.tsx
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../../services/product.service";
import { useToast } from "../../hooks/useToast";
import { LoadingButton } from "../../components/LoadingButton";

interface StockAdjustmentProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  currentStock: number;
  type: "increase" | "decrease";
}

export function StockAdjustment({
  open,
  onClose,
  productId,
  productName,
  currentStock,
  type,
}: StockAdjustmentProps) {
  const [quantity, setQuantity] = useState("");
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (qty: number) => {
      if (type === "increase") {
        return productService.increaseStock(productId, qty);
      }
      return productService.decreaseStock(productId, qty);
    },
    onSuccess: () => {
      showToast(
        `Estoque ${
          type === "increase" ? "aumentado" : "diminuído"
        } com sucesso`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleClose();
    },
    onError: () => {
      showToast(
        `Erro ao ${type === "increase" ? "aumentar" : "diminuir"} estoque`,
        "error"
      );
    },
  });

  // src/pages/Inventory/StockAdjustment.tsx (continuação)

  const handleClose = () => {
    setQuantity("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);

    if (qty <= 0) {
      showToast("Quantidade deve ser maior que zero", "error");
      return;
    }

    if (type === "decrease" && qty > currentStock) {
      showToast("Quantidade maior que o estoque atual", "error");
      return;
    }

    mutation.mutate(qty);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {type === "increase" ? "Adicionar ao" : "Remover do"} Estoque
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Produto: {productName}</Typography>
            <Typography variant="body2" color="text.secondary">
              Estoque atual: {currentStock} unidades
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Quantidade"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            inputProps={{
              min: "1",
              step: "1",
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={mutation.isPending}
            color={type === "increase" ? "primary" : "warning"}
          >
            {mutation.isPending ? "Processando..." : "Confirmar"}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
