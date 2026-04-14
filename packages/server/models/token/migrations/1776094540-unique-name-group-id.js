exports.up = async knex => {
  try {
    await knex.schema.alterTable('tokens', table => {
      table.unique(['name', 'group_id'], {
        indexName: 'tokens_unique_name_groupid',
      })
    })

    return true
  } catch (e) {
    throw new Error(
      `Migration: Token: create unique name and groupId failed: ${e}`,
    )
  }
}

exports.down = async knex => {
  try {
    await knex.schema.alterTable('tokens', table => {
      table.dropUnique(['name', 'group_id'], 'tokens_unique_name_groupid')
    })

    return true
  } catch (e) {
    throw new Error(
      `Migration: Token: drop unique name and groupId failed: ${e}`,
    )
  }
}
