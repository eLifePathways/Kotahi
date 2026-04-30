const { logger, db, createTables } = require('@coko/server')

const clearDb = async () => {
  const { rows } = await db.raw(`
    SELECT tablename, schemaname
    FROM pg_tables
    WHERE schemaname = 'public'
  `)

  if (rows.length) {
    logger.info('Overwriting existing database')

    // TODO this is dangerous, change it
    const dropQuery = rows
      .map(row => `DROP TABLE ${row.schemaname}.${row.tablename} CASCADE; `)
      .join('')

    await db.raw(dropQuery)
  }
}

const seed = async (dumpSql, opts) => {
  const { clear = true } = opts

  let ready

  if (dumpSql) {
    if (clear) await clearDb()
    await db.raw(dumpSql)

    if (clear) logger.info('Cleared the database.')
    logger.info('Restored from dump')
  } else {
    await createTables(true)
  }

  // TODO: This wait is necessary for the database to "settle".
  while (!ready) {
    // eslint-disable-next-line
    const result = await db.raw(`set search_path to 'public';`)

    const User = require('../models/user/user.model')

    try {
      // eslint-disable-next-line
      const users = await User.query()
      ready = !!users
    } catch (e) {
      // eslint-disable-next-line
      console.log(e)
    }
  }

  return true
}

if (require.main === module) {
  seed()
}

module.exports = seed
