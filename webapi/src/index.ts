import express from "express";
import { PORT } from "./config/env";

const app = express();

app.use(express.json());

// Rota simples de teste
app.get("/", (req, res) => {
  res.send("Hello World! API is working!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
