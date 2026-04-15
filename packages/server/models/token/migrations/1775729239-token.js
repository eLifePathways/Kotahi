exports.up = async knex => {
  return knex.schema.createTable('tokens', table => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('value').notNullable()
    table.uuid('group_id').references('groups.id').notNullable()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true })
  })
}

exports.down = async knex => {
  const tableExists = await knex.schema.hasTable('tokens')

  if (tableExists) {
    await knex.schema.dropTable('tokens')
  }
}
