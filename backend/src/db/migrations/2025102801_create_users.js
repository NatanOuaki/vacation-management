export async function up(knex) {
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.enu('role', ['requester', 'validator'], {
      useNative: true,
      enumName: 'user_role'
    }).notNullable();
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users');
  await knex.schema.raw('DROP TYPE IF EXISTS user_role');
}
