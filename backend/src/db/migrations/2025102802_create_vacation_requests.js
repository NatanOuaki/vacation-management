export async function up(knex) {
  await knex.schema.createTable('vacation_requests', (t) => {
    t.increments('id').primary();
    t
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    t.date('start_date').notNullable();
    t.date('end_date').notNullable();
    t.text('reason');
    t
      .enu('status', ['Pending', 'Approved', 'Rejected'], {
        useNative: true,
        enumName: 'vacation_status'
      })
      .notNullable()
      .defaultTo('Pending');
    t.text('comments'); // comment du validateur si Rejected
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('vacation_requests');
  await knex.schema.raw('DROP TYPE IF EXISTS vacation_status');
}
