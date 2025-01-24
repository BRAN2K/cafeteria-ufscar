import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("reservations", (table) => {
    table.string("status", 50).notNullable().defaultTo("active");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("reservations", (table) => {
    table.dropColumn("status");
  });
}
