const { useTransaction } = require('@coko/server')

const { seedNotifications } = require('../../../scripts/seedNotifications')

const Group = require('../../group/group.model')
const Config = require('../../config/config.model')

exports.up = async knex => {
  await knex.schema.createTable('notifications', table => {
    table.uuid('id').primary()
    table.uuid('groupId').notNullable()
    table.uuid('emailTemplateId').nullable()
    table.string('notificationType').notNullable()
    table.string('event').notNullable()
    table.string('recipient').notNullable()
    table.string('subject').nullable()
    table.jsonb('ccEmails').notNullable()
    table.string('displayName').notNullable()
    table.boolean('active').notNullable().defaultTo(false)
    table.boolean('isDefault').notNullable().defaultTo(false)
    table.integer('delay').notNullable().defaultTo(0)
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true }).nullable()
    table.foreign('groupId').references('id').inTable('groups')
    table
      .foreign('emailTemplateId')
      .references('id')
      .inTable('email_templates')
      .onDelete('SET NULL')
  })

  return useTransaction(async trx => {
    const { result: groups } = await Group.find({}, { trx })

    await Promise.all(
      groups.map(async group => {
        const config = await Config.query(trx).findOne({
          groupId: group.id,
        })

        if (!config) throw new Error('No config found for group')

        await seedNotifications(trx, group.id, config)
      }),
    )
  })
}

exports.down = async knex => {
  const tableExists = await knex.schema.hasTable('notifications')

  if (tableExists) {
    await knex.schema.dropTable('notifications')
  }
}
