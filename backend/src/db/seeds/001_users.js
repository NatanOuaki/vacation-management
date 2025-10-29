export async function seed(knex) {
  await knex('vacation_requests').del();
  await knex('users').del();

  await knex('users').insert([
    { id: 1, name: 'Natan Ouaki', role: 'requester' },
    { id: 2, name: 'Laura Yair', role: 'validator' }
  ]);
}
