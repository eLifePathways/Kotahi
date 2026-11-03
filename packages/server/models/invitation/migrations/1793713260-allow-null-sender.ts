import { type Db } from '@coko/server'

export async function up(db: Db): Promise<void> {
  await db.schema.alterTable('invitations', table => {
    table.setNullable('sender_id')
  })
}

export async function down(db: Db): Promise<void> {
  await db.schema.alterTable('invitations', table => {
    table.dropNullable('sender_id')
  })
}
