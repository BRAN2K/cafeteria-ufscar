import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    console.log("Skipping dev-only migration in production environment.");
    return;
  }

  await knex("employees").insert([
    {
      name: "Atendente de Souza",
      email: "atendente@example.com",
      role: "attendant",
      created_at: "2025-01-30 15:05:00",
    },
    {
      name: "Manager da Silva",
      email: "manager@example.com",
      role: "manager",
      created_at: "2025-01-30 15:00:00",
    },
    {
      name: "Admin Moreira",
      email: "admin@example.com",
      role: "admin",
      created_at: "2025-01-30 15:05:00",
    },
  ]);

  await knex("customers").insert([
    {
      name: "Ana Paula Santos",
      email: "ana.santos@example.com",
      phone: "16991234567",
      created_at: "2025-01-30 16:20:00",
    },
    {
      name: "Carlos Eduardo Lima",
      email: "carlos.lima@example.com",
      phone: "16998765432",
      created_at: "2025-01-30 16:21:00",
    },
    {
      name: "Beatriz Oliveira",
      email: "bia.oliveira@example.com",
      phone: "16994567890",
      created_at: "2025-01-30 16:22:00",
    },
    {
      name: "Ricardo Pereira",
      email: "ricardo.p@example.br",
      phone: "16992345678",
      created_at: "2025-01-30 16:23:00",
    },
  ]);

  await knex("products").insert([
    {
      name: "Café Expresso",
      description: "Café tradicional curto",
      price: 5.5,
      stock_quantity: 100,
      created_at: "2025-01-30 17:00:00",
    },
    {
      name: "Pão de Queijo",
      description: "Pão de queijo caseiro",
      price: 3.0,
      stock_quantity: 50,
      created_at: "2025-01-30 17:05:00",
    },
    {
      name: "Bolo de Chocolate",
      description: "Fatia de bolo caseiro de chocolate",
      price: 8.0,
      stock_quantity: 20,
      created_at: "2025-01-30 17:06:00",
    },
    {
      name: "Cappuccino",
      description: "Café com leite e chocolate",
      price: 7.5,
      stock_quantity: 80,
      created_at: "2025-01-30 17:07:00",
    },
    {
      name: "Misto Quente",
      description: "Sanduíche de queijo e presunto",
      price: 6.0,
      stock_quantity: 30,
      created_at: "2025-01-30 17:08:00",
    },
    {
      name: "Suco de Laranja",
      description: "Suco natural de laranja",
      price: 6.5,
      stock_quantity: 40,
      created_at: "2025-01-30 17:09:00",
    },
    {
      name: "Croissant",
      description: "Croissant folhado tradicional",
      price: 4.5,
      stock_quantity: 25,
      created_at: "2025-01-30 17:10:00",
    },
    {
      name: "Chá Verde",
      description: "Chá verde com folhas selecionadas",
      price: 4.0,
      stock_quantity: 60,
      created_at: "2025-01-30 17:11:00",
    },
  ]);

  await knex("tables").insert([
    {
      table_number: 1,
      capacity: 1,
      status: "available",
      created_at: "2025-01-30 17:10:00",
    },
    {
      table_number: 2,
      capacity: 1,
      status: "available",
      created_at: "2025-01-30 17:15:00",
    },
    {
      table_number: 3,
      capacity: 2,
      status: "available",
      created_at: "2025-01-30 17:20:00",
    },
    {
      table_number: 4,
      capacity: 2,
      status: "available",
      created_at: "2025-01-30 17:25:00",
    },
    {
      table_number: 5,
      capacity: 4,
      status: "available",
      created_at: "2025-01-30 17:30:00",
    },
    {
      table_number: 6,
      capacity: 6,
      status: "available",
      created_at: "2025-01-30 17:35:00",
    },
    {
      table_number: 7,
      capacity: 8,
      status: "available",
      created_at: "2025-01-30 17:40:00",
    },
    {
      table_number: 8,
      capacity: 10,
      status: "unavailable",
      created_at: "2025-01-30 17:45:00",
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {}
