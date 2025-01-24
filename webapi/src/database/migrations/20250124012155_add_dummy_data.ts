import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    console.log("Skipping dev-only migration in production environment.");
    return;
  }

  await knex("employees").insert([
    {
      name: "João da Silva",
      email: "joao.silva@example.com",
      role: "manager",
      created_at: "2025-01-30 15:00:00",
    },
    {
      name: "Maria Souza",
      email: "maria.souza@example.com",
      role: "attendant",
      created_at: "2025-01-30 15:05:00",
    },
  ]);

  await knex("customers").insert([
    {
      name: "Cliente Exemplo 1",
      email: "cliente1@example.com",
      phone: "1199999-0001",
      created_at: "2025-01-30 16:20:00",
    },
    {
      name: "Cliente Exemplo 2",
      email: "cliente2@example.com",
      phone: "1198888-2222",
      created_at: "2025-01-30 16:21:00",
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
  ]);

  await knex("tables").insert([
    {
      table_number: 1,
      capacity: 4,
      status: "available",
      created_at: "2025-01-30 17:10:00",
    },
    {
      table_number: 2,
      capacity: 6,
      status: "available",
      created_at: "2025-01-30 17:15:00",
    },
  ]);

  await knex("orders").insert([
    {
      table_id: 1,
      employee_id: 1,
      status: "pending",
      created_at: "2025-01-30 17:30:00",
    },
  ]);

  await knex("reservations").insert([
    {
      table_id: 1,
      customer_id: 1,
      start_time: "2025-02-01 18:00:00",
      end_time: "2025-02-01 20:00:00",
      status: "active",
      created_at: "2025-01-30 17:45:00",
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {}
