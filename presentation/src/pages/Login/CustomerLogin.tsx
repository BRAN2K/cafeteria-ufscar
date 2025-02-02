import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/auth.service";
import { RedirectIfAuthenticated } from "../../components/RedirectIfAuthenticated";
import { PasswordField } from "../../components/PasswordFields";

export function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.loginCustomer({ email, password });
      login(response.token);
      navigate("/dashboard");
    } catch {
      setError("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RedirectIfAuthenticated>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Cafeteria UFSCar
          </Typography>

          <Paper sx={{ width: "100%", p: 3 }}>
            <Typography
              component="h2"
              variant="h5"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Login do Cliente
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordField
                margin="normal"
                required
                fullWidth
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </RedirectIfAuthenticated>
  );
}
