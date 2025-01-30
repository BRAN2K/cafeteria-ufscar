// src/components/Layout/MainLayout.tsx
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Restaurant,
  Event,
  Inventory,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Clientes", icon: <People />, path: "/customers" },
    { text: "Produtos", icon: <Restaurant />, path: "/products" },
    { text: "Reservas", icon: <Event />, path: "/reservations" },
    { text: "Estoque", icon: <Inventory />, path: "/inventory" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cafeteria UFSCar
          </Typography>

          {/* Área do usuário */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
              {user?.name ? getInitials(user.name) : "?"}
            </Avatar>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.name || "Usuário"}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Sair
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          {/* Cabeçalho do Drawer */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {user?.name ? getInitials(user.name) : "?"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">
                {user?.name || "Usuário"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role === "admin"
                  ? "Administrador"
                  : user?.role === "manager"
                  ? "Gerente"
                  : user?.role === "attendant"
                  ? "Atendente"
                  : "Cliente"}
              </Typography>
            </Box>
          </Box>

          {/* Lista de Menu */}
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: (theme) => theme.palette.grey[100],
          minHeight: "100vh",
          width: "100%",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
