// src/components/GlobalStyles.tsx
import { GlobalStyles as MuiGlobalStyles } from "@mui/material";

export function GlobalStyles() {
  return (
    <MuiGlobalStyles
      styles={{
        "*": {
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        },
        html: {
          height: "100%",
          width: "100%",
        },
        body: {
          height: "100%",
          width: "100%",
        },
        "#root": {
          height: "100%",
          width: "100%",
        },
      }}
    />
  );
}
