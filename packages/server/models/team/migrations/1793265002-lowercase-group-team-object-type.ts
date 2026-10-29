import { type Db } from '@coko/server'

export async function up(db: Db): Promise<void> {
  await db('teams')
    .where({ objectType: 'Group' })
    .update({ objectType: 'group' })
}

export async function down(db: Db): Promise<void> {
  await db('teams')
    .where({ objectType: 'group' })
    .update({ objectType: 'Group' })
}
