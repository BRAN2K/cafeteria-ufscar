import { useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
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
    // Aqui você pode fazer chamadas à API para buscar as estatísticas
    // Por enquanto, vamos usar dados mockados
    setStats({
      totalOrders: 15,
      totalReservations: 8,
      lowStockProducts: 3,
    });
  }, []);

  // src/pages/Dashboard/index.tsx (continuação)
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Bem-vindo, {user?.email}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Pedidos Hoje</Typography>
            <Typography variant="h3">{stats.totalOrders}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Reservas Ativas</Typography>
            <Typography variant="h3">{stats.totalReservations}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: stats.lowStockProducts > 0 ? "#fff3e0" : "white",
            }}
          >
            <Typography variant="h6">Produtos com Estoque Baixo</Typography>
            <Typography variant="h3">{stats.lowStockProducts}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
