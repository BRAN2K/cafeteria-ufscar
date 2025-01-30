// src/pages/Products/ProductForm.tsx
import { useState, useEffect } from "react";
import { Box, Paper, TextField, Button, Grid, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { productService, Product } from "../../services/product.service";
import { useToast } from "../../hooks/useToast";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
}

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
  });

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString(),
      });
    }
  }, [product]);

  // Mutation corrigida com tipos apropriados
  const mutation = useMutation({
    mutationFn: async (data: Omit<Product, "id">) => {
      if (id) {
        await productService.updateProduct(Number(id), data);
        return Number(id);
      }
      return productService.createProduct(data);
    },
    onSuccess: () => {
      showToast(
        id ? "Produto atualizado com sucesso" : "Produto criado com sucesso",
        "success"
      );
      navigate("/products");
    },
    onError: () => {
      showToast(
        id ? "Erro ao atualizar produto" : "Erro ao criar produto",
        "error"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      stock_quantity: Number(formData.stock_quantity),
    };

    mutation.mutate(productData);
  };

  const handleChange =
    (field: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {id ? "Editar Produto" : "Novo Produto"}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Produto"
                value={formData.name}
                onChange={handleChange("name")}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={formData.description}
                onChange={handleChange("description")}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                // src/pages/Products/ProductForm.tsx (continuação)
                fullWidth
                label="Preço"
                type="number"
                value={formData.price}
                onChange={handleChange("price")}
                required
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantidade em Estoque"
                type="number"
                value={formData.stock_quantity}
                onChange={handleChange("stock_quantity")}
                required
                inputProps={{
                  min: "0",
                  step: "1",
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/products")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <ToastComponent />
    </Box>
  );
}
