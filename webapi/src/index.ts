import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import { PORT, NODE_ENV, FRONTEND_URL } from "./config/env";
import { swaggerSpecs } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";

import orderRoutes from "./routes/order.routes";
import employeeRoutes from "./routes/employee.routes";
import customerRoutes from "./routes/customer.routes";
import tableRoutes from "./routes/table.routes";
import productRoutes from "./routes/product.routes";
import reservationRoutes from "./routes/reservation.routes";
import orderItemRoutes from "./routes/orderItem.routes";
import authCustomerRoutes from "./routes/authCustomer.routes";
import authEmployeeRoutes from "./routes/authEmployee.routes";

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Necessário se você estiver enviando cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.send("Hello World! API is working!");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use("/auth/employee", authEmployeeRoutes);
app.use("/auth/customer", authCustomerRoutes);
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
