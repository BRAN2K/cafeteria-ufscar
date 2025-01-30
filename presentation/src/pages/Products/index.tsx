// src/pages/Products/index.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { productService, Product } from "../../services/product.service";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { StockAdjustment } from "./StockAdjustment";
import { useToast } from "../../hooks/useToast";

export function Products() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { showToast, ToastComponent } = useToast();

  // Estado para controle do diálogo de ajuste de estoque
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", page, rowsPerPage, search],
    queryFn: () => productService.getProducts(page + 1, rowsPerPage, search),
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await productService.deleteProduct(deleteId);
        showToast("Produto excluído com sucesso", "success");
        refetch();
      } catch {
        showToast("Erro ao excluir produto", "error");
      }
      setDeleteId(null);
    }
  };

  const handleStockAdjustment = (
    product: Product,
    type: "increase" | "decrease"
  ) => {
    setStockAdjustment({
      open: true,
      productId: product.id!,
      productName: product.name,
      currentStock: product.stock_quantity,
      type,
    });
  };

  return (
    <Box>
      <PageHeader
        title="Produtos"
        action={{
          label: "Novo Produto",
          onClick: () => navigate("/products/new"),
        }}
      />
      {/* Barra de Pesquisa */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            // src/pages/Products/index.tsx (continuação)
          }}
        />
      </Paper>
      {/* Tabela de Produtos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Preço</TableCell>
              <TableCell align="right">Estoque</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.price)}
                </TableCell>
                <TableCell align="right">{product.stock_quantity}</TableCell>
                <TableCell align="center">
                  <Box
                    sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                  >
                    {/* Botão de Aumentar Estoque */}
                    <IconButton
                      color="primary"
                      onClick={() => handleStockAdjustment(product, "increase")}
                      size="small"
                      title="Aumentar estoque"
                    >
                      <AddIcon />
                    </IconButton>

                    {/* Botão de Diminuir Estoque */}
                    <IconButton
                      color="warning"
                      onClick={() => handleStockAdjustment(product, "decrease")}
                      size="small"
                      title="Diminuir estoque"
                    >
                      <RemoveIcon />
                    </IconButton>

                    {/* Botão de Editar */}
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/products/${product.id}`)}
                      size="small"
                      title="Editar produto"
                    >
                      <EditIcon />
                    </IconButton>

                    {/* Botão de Excluir */}
                    <IconButton
                      color="error"
                      onClick={() => setDeleteId(product.id)}
                      size="small"
                      title="Excluir produto"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Paginação */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </TableContainer>
      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Produto"
        message="Tem certeza que deseja excluir este produto?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
      {/* Diálogo de Ajuste de Estoque */}
      {stockAdjustment.productId && (
        <StockAdjustment
          open={stockAdjustment.open}
          onClose={() =>
            setStockAdjustment((prev) => ({ ...prev, open: false }))
          }
          productId={stockAdjustment.productId}
          productName={stockAdjustment.productName}
          currentStock={stockAdjustment.currentStock}
          type={stockAdjustment.type}
        />
      )}
      {/* Componente de Toast para feedback */}
      <ToastComponent />
      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
