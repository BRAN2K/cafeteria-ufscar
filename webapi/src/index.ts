import express from "express";
import { PORT, NODE_ENV } from "./config/env";
import orderRoutes from "./routes/order.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// Rota de teste
app.get("/", (req, res) => {
  res.send("Hello World! API is working!");
});

// Rotas do Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rotas de Pedidos
app.use("/orders", orderRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
