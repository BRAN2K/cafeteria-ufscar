import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { PORT, NODE_ENV } from "./config/env";
import { swaggerSpecs } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";

import orderRoutes from "./routes/order.routes";
import employeeRoutes from "./routes/employee.routes";

const app = express();

app.use(express.json());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.send("Hello World! API is working!");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use("/orders", orderRoutes);
app.use("/employees", employeeRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
