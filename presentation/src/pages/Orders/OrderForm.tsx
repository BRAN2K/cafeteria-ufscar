// src/pages/Orders/CreateOrder.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { orderService } from "../../services/order.service";
import { tableService } from "../../services/table.service";
import { productService } from "../../services/product.service";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { CurrencyFormat } from "../../components/CurrencyFormat";

interface OrderItem {
  product_id: number;
  quantity: number;
  // Campos auxiliares para exibição
  productName?: string;
  productPrice?: number;
}

export function CreateOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();

  const [tableId, setTableId] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");

  // Buscar mesas disponíveis
  const { data: tables, isLoading: loadingTables } = useQuery({
    queryKey: ["tables-available"],
    queryFn: () => tableService.getTables(1, 100, "available"),
  });

  // Buscar produtos
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getProducts(1, 100),
  });

  // Mutation para criar pedido
  const createOrderMutation = useMutation({
    mutationFn: () => {
      if (!user?.id || !tableId) return Promise.reject("Dados inválidos");

      return orderService.createOrder({
        table_id: Number(tableId),
        employee_id: user.id,
        items: items.map(({ product_id, quantity }) => ({
          product_id,
          quantity,
        })),
      });
    },
    onSuccess: () => {
      showToast("Pedido criado com sucesso", "success");
      navigate("/orders");
    },
    onError: () => {
      showToast("Erro ao criar pedido", "error");
    },
  });

  const handleAddItem = () => {
    if (!selectedProduct || Number(quantity) <= 0) {
      showToast("Selecione um produto e quantidade válida", "error");
      return;
    }

    const product = products?.data.find(
      (p) => p.id === Number(selectedProduct)
    );
    if (!product) return;

    // Verificar se já existe o produto no pedido
    const existingItemIndex = items.findIndex(
      (item) => item.product_id === Number(selectedProduct)
    );

    if (existingItemIndex >= 0) {
      // Atualizar quantidade se já existe
      const newItems = [...items];
      newItems[existingItemIndex].quantity += Number(quantity);
      setItems(newItems);
    } else {
      // Adicionar novo item
      setItems([
        ...items,
        {
          product_id: Number(selectedProduct),
          quantity: Number(quantity),
          productName: product.name,
          productPrice: product.price,
        },
      ]);
    }

    // Limpar seleção
    setSelectedProduct("");
    setQuantity("1");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableId) {
      showToast("Selecione uma mesa", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Adicione pelo menos um item ao pedido", "error");
      return;
    }

    createOrderMutation.mutate();
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + item.quantity * (item.productPrice ?? 0);
    }, 0);
  };

  if (loadingTables || loadingProducts) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h4">
          Novo Pedido
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/orders")}>
          Voltar
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Seleção de Mesa */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography component="h2" variant="h6" gutterBottom>
                Mesa
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Selecione a Mesa</InputLabel>
                <Select
                  value={tableId}
                  label="Selecione a Mesa"
                  onChange={(e) => setTableId(e.target.value)}
                >
                  {tables?.data.map((table) => (
                    <MenuItem key={table.id} value={table.id}>
                      Mesa {table.table_number} ({table.capacity} lugares)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Adicionar Itens */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography component="h2" variant="h6" gutterBottom>
                Itens do Pedido
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Produto</InputLabel>
                    <Select
                      value={selectedProduct}
                      label="Produto"
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      {products?.data.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name} -{" "}
                          <CurrencyFormat value={product.price} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Quantidade"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    inputProps={{ min: "1" }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddItem}
                    sx={{ height: "56px" }}
                  >
                    Adicionar Item
                  </Button>
                </Grid>
              </Grid>

              {/* Lista de Itens */}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell align="center">Quantidade</TableCell>
                    <TableCell align="right">Preço Unitário</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">
                        <CurrencyFormat value={item.productPrice ?? 0} />
                      </TableCell>
                      <TableCell align="right">
                        <CurrencyFormat
                          value={(item.productPrice ?? 0) * item.quantity}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveItem(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography
                          component="span"
                          sx={{ fontWeight: "bold" }}
                        >
                          Total:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          component="span"
                          sx={{ fontWeight: "bold" }}
                        >
                          <CurrencyFormat value={calculateTotal()} />
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">
                          Nenhum item adicionado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Botões de Ação */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/orders")}
                disabled={createOrderMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  items.length === 0 ||
                  !tableId ||
                  createOrderMutation.isPending
                }
              >
                {createOrderMutation.isPending
                  ? "Criando Pedido..."
                  : "Criar Pedido"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Loading Overlay */}
      {createOrderMutation.isPending && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <ToastComponent />
    </Box>
  );
}
