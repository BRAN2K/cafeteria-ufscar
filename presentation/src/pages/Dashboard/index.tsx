import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Alert,
  Tab,
  Tabs,
} from "@mui/material";
import {
  RestaurantMenu,
  Event,
  Inventory,
  Warning,
  TrendingUp,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { dashboardService } from "../../services/dashboard.service";
import type { DashboardStats, DetailedStats } from "../../types/dashboard";

export function Dashboard() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const { user } = useAuth();

  // Query para estatísticas gerais
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  // Query para estatísticas detalhadas
  const {
    data: detailedStats,
    isLoading: loadingDetails,
    error: detailsError,
  } = useQuery<DetailedStats>({
    queryKey: ["dashboard-detailed", period],
    queryFn: () => dashboardService.getDetailedStats(period),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Erro ao carregar dados do dashboard
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Bem-vindo, {user?.name}
      </Typography>

      {/* Cards principais */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Pedidos */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            <RestaurantMenu sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats?.totalOrders ?? 0}</Typography>
            <Typography variant="subtitle1">Pedidos Hoje</Typography>
            <Typography variant="caption">
              {stats?.pendingOrders ?? 0} pendentes
            </Typography>
          </Paper>
        </Grid>

        {/* Reservas */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "success.light",
              color: "success.contrastText",
            }}
          >
            <Event sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">
              {stats?.todayReservations ?? 0}
            </Typography>
            <Typography variant="subtitle1">Reservas Hoje</Typography>
            <Typography variant="caption">
              {stats?.weekReservations ?? 0} esta semana
            </Typography>
          </Paper>
        </Grid>

        {/* Estoque */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "warning.light",
              color: "warning.contrastText",
            }}
          >
            <Inventory sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats?.lowStockProducts ?? 0}</Typography>
            <Typography variant="subtitle1">Estoque Baixo</Typography>
            <Typography variant="caption">
              {stats?.outOfStockProducts ?? 0} produtos esgotados
            </Typography>
          </Paper>
        </Grid>

        {/* Status dos Pedidos */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "info.light",
              color: "info.contrastText",
            }}
          >
            <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats?.completedOrders ?? 0}</Typography>
            <Typography variant="subtitle1">Pedidos Concluídos</Typography>
            <Typography variant="caption">Hoje</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Seção de Estatísticas Detalhadas */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Estatísticas Detalhadas
          </Typography>

          <Tabs
            value={period}
            onChange={(_, newValue) => setPeriod(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Hoje" value="day" />
            <Tab label="Esta Semana" value="week" />
            <Tab label="Este Mês" value="month" />
          </Tabs>

          {loadingDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : detailsError ? (
            <Alert severity="error">
              Erro ao carregar estatísticas detalhadas
            </Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    Pedidos no Período
                  </Typography>
                  <Typography variant="h4">
                    {detailedStats?.metrics.orders ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    Reservas no Período
                  </Typography>
                  <Typography variant="h4">
                    {detailedStats?.metrics.reservations ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {detailedStats?.startDate &&
                      format(parseISO(detailedStats.startDate), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}{" "}
                    até{" "}
                    {detailedStats?.endDate &&
                      format(parseISO(detailedStats.endDate), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Seção de Alertas e Produtos mais Vendidos */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Produtos mais vendidos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Produtos Mais Vendidos
              </Typography>
              <List>
                {stats?.topSellingProducts?.map((product) => (
                  <ListItem key={product.id} divider>
                    <ListItemText
                      primary={product.name}
                      secondary={`${product.quantitySold} unidades vendidas`}
                    />
                  </ListItem>
                ))}
                {(!stats?.topSellingProducts ||
                  stats.topSellingProducts.length === 0) && (
                  <ListItem>
                    <ListItemText
                      primary="Nenhum produto vendido hoje"
                      secondary="Aguardando vendas"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertas de Estoque */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                color="warning.main"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Warning sx={{ mr: 1 }} />
                Alertas de Estoque
              </Typography>
              <Box sx={{ mt: 2 }}>
                {(stats?.lowStockProducts ?? 0) > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {stats?.lowStockProducts}{" "}
                    {stats?.lowStockProducts === 1
                      ? "produto está"
                      : "produtos estão"}{" "}
                    com estoque baixo
                  </Alert>
                )}
                {(stats?.outOfStockProducts ?? 0) > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {stats?.outOfStockProducts}{" "}
                    {stats?.outOfStockProducts === 1
                      ? "produto está"
                      : "produtos estão"}{" "}
                    esgotados
                  </Alert>
                )}
                {stats?.lowStockProducts === 0 &&
                  stats?.outOfStockProducts === 0 && (
                    <Alert severity="success">
                      Todos os produtos estão com estoque adequado
                    </Alert>
                  )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status dos Pedidos em Detalhe */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição dos Pedidos
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                  p: 2,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="primary.main">
                    {stats?.pendingOrders ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendentes
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="info.main">
                    {stats?.completedOrders ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Concluídos
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" color="success.main">
                    {stats?.totalOrders ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hoje
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer com informações de atualização */}
      <Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Última atualização:{" "}
          {format(new Date(), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </Typography>
      </Box>

      {/* Loading overlay */}
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error Snackbar */}
      {error && (
        <Alert
          severity="error"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
          }}
        >
          Erro ao atualizar dados:{" "}
          {error && typeof error === "object" && "message" in error
            ? (error as Error).message
            : "Erro desconhecido"}
        </Alert>
      )}
    </Box>
  );
}

export default Dashboard;
