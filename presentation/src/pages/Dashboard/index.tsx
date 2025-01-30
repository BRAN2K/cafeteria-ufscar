// src/pages/Dashboard/index.tsx
import { useEffect, useState } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardStats {
  totalOrders: number;
  totalReservations: number;
  lowStockProducts: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalReservations: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    setStats({
      totalOrders: 15,
      totalReservations: 8,
      lowStockProducts: 3,
    });
  }, []);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Bem-vindo, {user?.name}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
          mt: 3,
          width: "100%",
        }}
      >
        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          elevation={2}
        >
          <Typography variant="h6" color="primary">
            Pedidos Hoje
          </Typography>
          <Typography variant="h3" sx={{ mt: 2 }}>
            {stats.totalOrders}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          elevation={2}
        >
          <Typography variant="h6" color="primary">
            Reservas Ativas
          </Typography>
          <Typography variant="h3" sx={{ mt: 2 }}>
            {stats.totalReservations}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: stats.lowStockProducts > 0 ? "#fff3e0" : "white",
          }}
          elevation={2}
        >
          <Typography
            variant="h6"
            color={stats.lowStockProducts > 0 ? "warning.main" : "primary"}
          >
            Produtos com Estoque Baixo
          </Typography>
          <Typography variant="h3" sx={{ mt: 2 }}>
            {stats.lowStockProducts}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
