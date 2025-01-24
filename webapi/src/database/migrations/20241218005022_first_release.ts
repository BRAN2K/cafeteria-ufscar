import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Tabela de funcionários
  await knex.schema.createTable("employees", (table) => {
    table.increments("id").primary();
    table.string("name", 100).notNullable();
    table.string("email", 100).notNullable().unique();
    table.string("role", 50).notNullable().defaultTo("attendant"); // 'admin', 'attendant', 'manager', 'other'
    table.datetime("created_at").defaultTo(knex.fn.now());
  });

  // Tabela de clientes
  await knex.schema.createTable("customers", (table) => {
    table.increments("id").primary();
    table.string("name", 100).notNullable();
    table.string("email", 100).notNullable().unique();
    table.string("phone", 20).defaultTo("");
    table.datetime("created_at").defaultTo(knex.fn.now());
  });

  // Tabela de mesas
  await knex.schema.createTable("tables", (table) => {
    table.increments("id").primary();
    table.integer("table_number").notNullable().unique();
    table.integer("capacity").notNullable().defaultTo(4);
    table.string("status", 50).notNullable().defaultTo("available"); // 'available', 'reserved', 'occupied'
    table.datetime("created_at").defaultTo(knex.fn.now());
  });

  // Tabela de reservas
  await knex.schema.createTable("reservations", (table) => {
    table.increments("id").primary();
    table.integer("table_id").unsigned().notNullable();
    table.integer("customer_id").unsigned().notNullable();
    table.datetime("reservation_time").notNullable();
    table.datetime("created_at").defaultTo(knex.fn.now());

    table
      .foreign("table_id")
      .references("id")
      .inTable("tables")
      .onDelete("CASCADE");
    table
      .foreign("customer_id")
      .references("id")
      .inTable("customers")
      .onDelete("CASCADE");
  });

  // Tabela de produtos
  await knex.schema.createTable("products", (table) => {
    table.increments("id").primary();
    table.string("name", 150).notNullable();
    table.text("description").defaultTo("");
    table.decimal("price", 10, 2).notNullable().defaultTo(0.0);
    table.integer("stock_quantity").notNullable().defaultTo(0);
    table.datetime("created_at").defaultTo(knex.fn.now());
  });

  // Tabela de pedidos
  await knex.schema.createTable("orders", (table) => {
    table.increments("id").primary();
    table.integer("table_id").unsigned().notNullable();
    table.integer("employee_id").unsigned().notNullable();
    table.string("status", 50).notNullable().defaultTo("pending"); // 'pending', 'in_preparation', 'delivered', 'canceled'
    table.datetime("created_at").defaultTo(knex.fn.now());

    table
      .foreign("table_id")
      .references("id")
      .inTable("tables")
      .onDelete("RESTRICT");
    table
      .foreign("employee_id")
      .references("id")
      .inTable("employees")
      .onDelete("RESTRICT");
  });

  // Tabela de itens do pedido
  await knex.schema.createTable("order_items", (table) => {
    table.increments("id").primary();
    table.integer("order_id").unsigned().notNullable();
    table.integer("product_id").unsigned().notNullable();
    table.integer("quantity").notNullable().defaultTo(1);
    table.decimal("price_at_order_time", 10, 2).notNullable().defaultTo(0.0);
    table.datetime("created_at").defaultTo(knex.fn.now());

    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");
    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("RESTRICT");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("order_items");
  await knex.schema.dropTableIfExists("orders");
  await knex.schema.dropTableIfExists("products");
  await knex.schema.dropTableIfExists("reservations");
  await knex.schema.dropTableIfExists("tables");
  await knex.schema.dropTableIfExists("customers");
  await knex.schema.dropTableIfExists("employees");
}
