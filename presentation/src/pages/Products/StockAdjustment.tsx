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
      // src/pages/Products/StockAdjustment.tsx (continuação)
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
      onClose();
      setQuantity("");
    },
    onError: () => {
      showToast(
        `Erro ao ${type === "increase" ? "aumentar" : "diminuir"} estoque`,
        "error"
      );
    },
  });

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {type === "increase" ? "Aumentar" : "Diminuir"} Estoque
      </DialogTitle>

      <form onSubmit={handleSubmit}>
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
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Processando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
