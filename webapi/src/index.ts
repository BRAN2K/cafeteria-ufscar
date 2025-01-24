import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { PORT, NODE_ENV } from "./config/env";
import { swaggerSpecs } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";

import orderRoutes from "./routes/order.routes";
import employeeRoutes from "./routes/employee.routes";
import customerRoutes from "./routes/customer.routes";
import tableRoutes from "./routes/table.routes";
import productRoutes from "./routes/product.routes";
import reservationRoutes from "./routes/reservation.routes";
import orderItemRoutes from "./routes/orderItem.routes";

const app = express();

app.use(express.json());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.send("Hello World! API is working!");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use("/orders", orderRoutes);
app.use("/employees", employeeRoutes);
app.use("/customers", customerRoutes);
app.use("/tables", tableRoutes);
app.use("/products", productRoutes);
app.use("/reservations", reservationRoutes);
app.use("/order-items", orderItemRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
