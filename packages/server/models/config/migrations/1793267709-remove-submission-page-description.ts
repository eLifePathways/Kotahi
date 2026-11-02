import { type Db } from '@coko/server'

export async function up(db: Db): Promise<void> {
  await db.raw(`
    UPDATE configs
    SET form_data = form_data #- '{submission,submissionPage,submissionPagedescription}'
    WHERE form_data #> '{submission,submissionPage,submissionPagedescription}' IS NOT NULL
  `)
}

export async function down(): Promise<void> {
  // we would have removed the value here, so there is nothing to reinstate
}
