/** Wait until the users table exists. I'm not sure this is needed, if we use await correctly
 * when running migrations or restoring from dump.
 */
// const waitForDbToSettle = async () => {
//   const User = require('../models/user/user.model')
//   let ready

//   while (!ready) {
//     try {
//       const users = await User.query()
//       ready = !!users
//     } catch (e) {
//       console.error(e)
//       /* eslint-disable-next-line no-promise-executor-return */
//       await new Promise(resolve => setTimeout(resolve, 1000))
//     }
//   }
// }

const clearDb = async () => {
  const { db } = require('@coko/server')

  await db.raw(`
    DO
    $$
    DECLARE
        tab RECORD;
    BEGIN
        FOR tab IN (SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT IN ('migrations', 'coko_server_meta')) LOOP
            EXECUTE 'ALTER TABLE ' || quote_ident(tab.tablename) || ' DISABLE TRIGGER ALL;';
            EXECUTE 'DELETE FROM ' || quote_ident(tab.tablename) || ';';
            EXECUTE 'ALTER TABLE ' || quote_ident(tab.tablename) || ' ENABLE TRIGGER ALL;';
        END LOOP;
    END
    $$;
  `)
}

/** Clears all objects from the public schema and reruns all the migrations. */
const resetDb = async () => {
  // const { logger, db, migrate } = require('@coko/server')
  const seedGroups = require('./seedGroups')

  await clearDb()

  // logger.info('Resetting database')
  // await db.raw('DROP SCHEMA IF EXISTS public CASCADE')
  // await db.raw('CREATE SCHEMA public')
  // logger.info("Dropped and recreated 'public' schema.")
  // await migrate({ logger })
  // logger.info('Successfully ran all migrations.')

  // throw new Error('hello')

  // // I'm not certain this is needed
  // await db.raw(`set search_path to 'public';`)
  // // I'm not certain this is needed
  // await waitForDbToSettle()

  await seedGroups()

  return true
}

if (require.main === module) {
  resetDb()
}

const applyDump = async (dumpSql, dumpName = '') => {
  const { logger, db } = require('@coko/server')

  if (dumpSql) {
    await db.raw(dumpSql)
    logger.info(`Applied dump ${dumpName}`)
  }

  return true
}

/** Run the provided sql */
const resetDbAndApplyDump = async (dumpSql, dumpName) => {
  const reset = await resetDb()
  const dump = await applyDump(dumpSql, dumpName)

  return reset && dump
}

module.exports = { clearDb, resetDb, applyDump, resetDbAndApplyDump }
