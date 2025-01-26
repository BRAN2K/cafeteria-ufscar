import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("employees", (table) => {
    table.string("password", 255).notNullable().defaultTo("changeme");
  });

  await knex.schema.alterTable("customers", (table) => {
    table.string("password", 255).notNullable().defaultTo("changeme");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("employees", (table) => {
    table.dropColumn("password");
  });

  await knex.schema.alterTable("customers", (table) => {
    table.dropColumn("password");
  });
}
