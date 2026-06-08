const { useTransaction } = require('@coko/server')

const ArticleImportHistory = require('../articleImportHistory.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const articleImportHistory = await ArticleImportHistory.query(trx)
      const groups = await Group.query(trx)

      // logger.info(
      //   `Existing ArticleImportHistory count: ${articleImportHistory.length}`,
      // )
      // logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (
        groups.length >= 1 &&
        articleImportHistory.length >= 1 &&
        !articleImportHistory[0].group_id
      ) {
        /* eslint no-param-reassign: "error" */
        await ArticleImportHistory.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)

        // logger.info(
        //   'groupId patched successfully in article import history table',
        // )
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
