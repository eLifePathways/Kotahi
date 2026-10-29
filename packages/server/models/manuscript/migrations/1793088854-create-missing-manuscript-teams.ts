import { type Db } from '@coko/server'

const MANUSCRIPT_TEAMS = [
  { role: 'author', displayName: 'Author' },
  { role: 'reviewer', displayName: 'Reviewers' },
  { role: 'collaborativeReviewer', displayName: 'Collaborative Reviewers' },
  { role: 'editor', displayName: 'Editor' },
  { role: 'seniorEditor', displayName: 'Senior Editor' },
  { role: 'handlingEditor', displayName: 'Handling Editor' },
  { role: 'managingEditor', displayName: 'Managing Editor' },
]

export async function up(db: Db): Promise<void> {
  return db.transaction(async trx => {
    for (const { role, displayName } of MANUSCRIPT_TEAMS) {
      // eslint-disable-next-line no-await-in-loop
      await trx.raw(
        `
          INSERT INTO teams (id, role, display_name, object_id, object_type, global, type)
          SELECT gen_random_uuid(), ?, ?, manuscripts.id, 'manuscript', false, 'team'
          FROM manuscripts
          WHERE NOT EXISTS (
            SELECT 1 FROM teams
            WHERE teams.object_id = manuscripts.id
              AND teams.role = ?
              AND teams.global = false
          )
        `,
        [role, displayName, role],
      )
    }
  })
}

export async function down(): Promise<void> {
  // We were just back-filling missing teams, nothing to roll back
}
