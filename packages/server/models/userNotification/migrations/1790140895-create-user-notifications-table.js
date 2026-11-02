exports.up = async knex => {
  return knex.schema.createTable('user_notifications', table => {
    table.uuid('id').primary()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true })

    table
      .uuid('user_id')
      .references('users.id')
      .onDelete('CASCADE')
      .notNullable()
    table
      .uuid('group_id')
      .references('groups.id')
      .onDelete('CASCADE')
      .notNullable()
    table.uuid('manuscript_id').references('manuscripts.id').onDelete('CASCADE')

    table.string('event_type').notNullable()
    table.jsonb('data').notNullable().defaultTo({})

    table.index('user_id')
    table.index('group_id')
    table.index('manuscript_id')
  })
}

exports.down = async knex => {
  const tableExists = await knex.schema.hasTable('user_notifications')

  if (tableExists) {
    await knex.schema.dropTable('user_notifications')
  }
}
