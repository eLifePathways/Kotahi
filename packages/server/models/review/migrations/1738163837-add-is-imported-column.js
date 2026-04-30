const { useTransaction } = require('@coko/server')
const Review = require('../review.model')

exports.up = async () => {
  return useTransaction(async trx => {
    await trx.schema.alterTable(Review.tableName, table => {
      table.boolean('is_imported').notNullable().defaultTo('false')
    })

    await Review.query(trx).where({ userId: null }).patch({ isImported: true })
  })
}

exports.down = async () => {
  return useTransaction(async trx => {
    await trx.schema.alterTable(Review.tableName, table => {
      table.dropColumn('is_imported')
    })
  })
}
