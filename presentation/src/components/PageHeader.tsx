import { Box, Typography, Button } from "@mui/material";

interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h4">{title}</Typography>
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
