import { type Db } from '@coko/server'

export async function up(db: Db): Promise<void> {
  const hasChatExpandedColumn = await db.schema.hasColumn(
    'users',
    'chat_expanded',
  )

  if (hasChatExpandedColumn) {
    await db.schema.table('users', table => {
      table.dropColumn('chat_expanded')
    })
  }
}

export async function down(db: Db): Promise<void> {
  const hasChatExpandedColumn = await db.schema.hasColumn(
    'users',
    'chat_expanded',
  )

  if (!hasChatExpandedColumn) {
    await db.schema.table('users', table => {
      table.boolean('chat_expanded').notNullable().defaultTo(false)
    })
  }
}
