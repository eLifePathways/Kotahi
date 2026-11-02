import { type Db } from '@coko/server'

export async function up(db: Db): Promise<void> {
  const hasRecentTabColumn = await db.schema.hasColumn('users', 'recent_tab')

  if (hasRecentTabColumn) {
    await db.schema.table('users', table => {
      table.dropColumn('recent_tab')
    })
  }
}

export async function down(db: Db): Promise<void> {
  const hasRecentTabColumn = await db.schema.hasColumn('users', 'recent_tab')

  if (!hasRecentTabColumn) {
    await db.schema.table('users', table => {
      table.text('recent_tab')
    })
  }
}
