const { useTransaction } = require('@coko/server')
const { chunk } = require('lodash')

const Docmap = require('../docmap.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const docmaps = await Docmap.query(trx)
    const groups = await Group.query(trx)

    // Existing instances migrating to multi-tenancy groups
    if (groups.length >= 1 && docmaps.length >= 1 && !docmaps[0].group_id) {
      for (const someDocmaps of chunk(docmaps, 10)) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          someDocmaps.map(async docmap => {
            let { content } = docmap

            content = content.replace(
              '/versions/',
              `/${groups[0].name}/versions/`,
            )

            /* eslint no-param-reassign: "error" */
            await Docmap.query(trx).patchAndFetchById(docmap.id, {
              content,
              groupId: groups[0].id,
            })
          }),
        )
      }
    }
  })
}
