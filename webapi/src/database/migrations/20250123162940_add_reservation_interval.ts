import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("reservations", (table) => {
    table.datetime("start_time").notNullable().defaultTo(knex.fn.now());
    table.datetime("end_time").notNullable().defaultTo(knex.fn.now());
  });

  await knex("reservations").update({
    start_time: knex.ref("reservation_time"),
    end_time: knex.raw("DATE_ADD(reservation_time, INTERVAL 1 HOUR)"),
  });

  await knex.schema.alterTable("reservations", (table) => {
    table.dropColumn("reservation_time");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("reservations", (table) => {
    table.datetime("reservation_time").notNullable().defaultTo(knex.fn.now());
  });

  await knex("reservations").update({
    reservation_time: knex.ref("start_time"),
  });

  await knex.schema.alterTable("reservations", (table) => {
    table.dropColumn("start_time");
    table.dropColumn("end_time");
  });
}
