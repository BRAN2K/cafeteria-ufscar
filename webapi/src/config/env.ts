import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

export const PORT = process.env.API_PORT || "3000";
export const NODE_ENV = process.env.NODE_ENV || "development";

export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = process.env.DB_PORT || "3308";
export const DB_USER = process.env.DB_USER || "cafeteria";
export const DB_PASSWORD = process.env.DB_PASSWORD || "ufscar";
export const DB_ROOT_PASSWORD = process.env.DB_PASSWORD || "ufscar";
export const DB_NAME = process.env.DB_NAME || "cafeteria_db";

export const JWT_SECRET = process.env.JWT_SECRET || "secretjwt";
