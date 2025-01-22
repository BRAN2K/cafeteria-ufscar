import swaggerJsdoc, { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API - Cafeteria UFSCar",
      version: "1.0.0",
      description:
        "Documentação da API para o sistema de gestão da Cafeteria UFSCar",
    },
  },
  apis: ["src/routes/*.ts", "src/docs/schemas/*.ts"],
};

export const swaggerSpecs = swaggerJsdoc(swaggerOptions);
