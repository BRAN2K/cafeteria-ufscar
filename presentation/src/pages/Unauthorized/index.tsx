import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Acesso Não Autorizado
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Você não tem permissão para acessar esta página.
      </Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>
        Voltar
      </Button>
    </Box>
  );
}
