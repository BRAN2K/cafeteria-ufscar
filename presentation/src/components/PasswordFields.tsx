// src/components/PasswordField.tsx
import { useState, useCallback } from "react";
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  OutlinedInput,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export function PasswordField(props: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setShowPassword((prev) => !prev);

      // Mantém o cursor na mesma posição
      const input =
        event.currentTarget.parentElement?.parentElement?.querySelector(
          "input"
        );
      if (input) {
        const cursorPosition = input.selectionStart;
        // Use setTimeout para garantir que o cursor seja reposicionado após a renderização
        setTimeout(() => {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
      }
    },
    []
  );

  return (
    <TextField
      {...props}
      type={showPassword ? "text" : "password"}
      slots={{
        input: OutlinedInput,
      }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
