import { type Db } from '@coko/server'

export async function up(db: Db): Promise<void> {
  return db.raw(`
    ALTER TABLE forms ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE cms_pages ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE cms_layouts ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE coar_notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE cms_file_templates ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE publishing_collections ALTER COLUMN id SET DEFAULT gen_random_uuid();
  `)
}

export async function down(db: Db): Promise<void> {
  return db.raw(`
    ALTER TABLE forms ALTER COLUMN id SET DEFAULT public.gen_random_uuid();
    ALTER TABLE cms_pages ALTER COLUMN id SET DEFAULT public.gen_random_uuid();
    ALTER TABLE cms_layouts ALTER COLUMN id SET DEFAULT public.gen_random_uuid();
    ALTER TABLE coar_notifications ALTER COLUMN id SET DEFAULT public.gen_random_uuid();
    ALTER TABLE cms_file_templates ALTER COLUMN id SET DEFAULT public.gen_random_uuid();
    ALTER TABLE publishing_collections ALTER COLUMN id SET DEFAULT public.gen_random_uuid();
  `)
}
