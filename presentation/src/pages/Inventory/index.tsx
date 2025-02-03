import { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/product.service";
import { PageHeader } from "../../components/PageHeader";
import { StockAdjustment } from "./StockAdjustment";
import { useToast } from "../../hooks/useToast";

export function Inventory() {
  const [search, setSearch] = useState("");
  const [stockAdjustment, setStockAdjustment] = useState<{
    open: boolean;
    productId: number | null;
    productName: string;
    currentStock: number;
    type: "increase" | "decrease";
  }>({
    open: false,
    productId: null,
    productName: "",
    currentStock: 0,
    type: "increase",
  });

  const { showToast, ToastComponent } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => productService.getProducts(1, 100, search),
    meta: {
      onFailure: () => {
        showToast("Erro ao carregar produtos", "error");
      },
    },
  });

  type ChipColor =
    | "error"
    | "warning"
    | "success"
    | "default"
    | "primary"
    | "secondary"
    | "info";

  const getStockStatus = (
    quantity: number
  ): { label: string; color: ChipColor } => {
    if (quantity <= 5) return { label: "Crítico", color: "error" };
    if (quantity <= 10) return { label: "Baixo", color: "warning" };
    return { label: "Normal", color: "success" };
  };

  return (
    <Box>
      <PageHeader title="Controle de Estoque" />

      {/* Barra de Pesquisa */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar produto..."
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

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : !products?.data.length ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            {search
              ? "Nenhum produto encontrado para esta busca"
              : "Nenhum produto cadastrado"}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="center">Estoque Atual</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ajustar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.data.map((product) => {
                const status = getStockStatus(product.stock_quantity);

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Typography variant="subtitle1">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6">
                        {product.stock_quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setStockAdjustment({
                              open: true,
                              productId: product.id,
                              productName: product.name,
                              currentStock: product.stock_quantity,
                              type: "increase",
                            });
                            showToast(
                              "Ajuste o estoque conforme necessário",
                              "info"
                            );
                          }}
                          size="small"
                          title="Adicionar ao estoque"
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          color="warning"
                          onClick={() => {
                            if (product.stock_quantity === 0) {
                              showToast(
                                "Não é possível diminuir estoque zerado",
                                "error"
                              );
                              return;
                            }
                            setStockAdjustment({
                              open: true,
                              productId: product.id,
                              productName: product.name,
                              currentStock: product.stock_quantity,
                              type: "decrease",
                            });
                          }}
                          size="small"
                          title="Remover do estoque"
                          disabled={product.stock_quantity === 0}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Ajuste de Estoque */}
      {stockAdjustment.productId && (
        <StockAdjustment
          open={stockAdjustment.open}
          onClose={() => {
            setStockAdjustment((prev) => ({ ...prev, open: false }));
            showToast("Operação cancelada", "info");
          }}
          productId={stockAdjustment.productId}
          productName={stockAdjustment.productName}
          currentStock={stockAdjustment.currentStock}
          type={stockAdjustment.type}
        />
      )}

      <ToastComponent />
    </Box>
  );
}
