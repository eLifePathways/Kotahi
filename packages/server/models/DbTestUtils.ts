import { db, config } from '@coko/server'

const PRESERVED_TABLES = ['migrations', 'coko_server_meta']

class DbTestUtils {
  static checkEnv(): void {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('DbTestUtils should only be used in test environments!')
    }
  }

  static async dropAllTables(): Promise<void> {
    DbTestUtils.checkEnv()

    await db.raw(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO "${config.get('db.user')}";
      GRANT ALL ON SCHEMA public TO public;
    `)
  }

  static async clearDb(): Promise<void> {
    DbTestUtils.checkEnv()

    const preserved = PRESERVED_TABLES.map(t => `'${t}'`).join(', ')

    await db.raw(`
      DO $$
      DECLARE
        tabname text;
        seqname text;
        alltables text;
      BEGIN
        IF current_setting('is_superuser') = 'on' THEN
          PERFORM set_config('session_replication_role', 'replica', true);

          FOR tabname IN
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public' AND tablename NOT IN (${preserved})
          LOOP
            EXECUTE format('DELETE FROM %I.%I', 'public', tabname);
          END LOOP;

          FOR seqname IN
            SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
          LOOP
            EXECUTE format('ALTER SEQUENCE %I.%I RESTART', 'public', seqname);
          END LOOP;

          PERFORM set_config('session_replication_role', 'origin', true);
        ELSE
          SELECT string_agg(format('%I.%I', 'public', tablename), ', ')
          INTO alltables
          FROM pg_tables
          WHERE schemaname = 'public' AND tablename NOT IN (${preserved});

          IF alltables IS NOT NULL THEN
            EXECUTE 'TRUNCATE TABLE ' || alltables || ' RESTART IDENTITY CASCADE';
          END IF;
        END IF;
      END
      $$;
    `)
  }
}

export default DbTestUtils
