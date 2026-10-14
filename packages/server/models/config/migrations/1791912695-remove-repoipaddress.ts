import { useTransaction } from '@coko/server'
import Config from '../config.model.js'

/**
 * COAR Notify requests are now authenticated by auth token only, so the
 * deprecated IP allow list is no longer read and is removed from all configs.
 * @returns {void}
 */
export async function up(): Promise<void> {
  return useTransaction(async trx => {
    const { result: configs } = await Config.find({}, { trx })

    await Promise.all(
      configs.map(async config => {
        const coarNotify = config.formData?.integrations?.coarNotify

        if (coarNotify && 'repoIpAddress' in coarNotify) {
          const { formData } = config

          delete formData.integrations.coarNotify.repoIpAddress

          await Config.patchAndFetchById(config.id, { formData }, { trx })
        }
      }),
    )
  })
}

/**
 * The removed IP addresses cannot be restored, so the key is brought back
 * empty for any config with COAR Notify settings.
 * */
export async function down(): Promise<void> {
  return useTransaction(async trx => {
    const { result: configs } = await Config.find({}, { trx })

    await Promise.all(
      configs.map(async config => {
        const coarNotify = config.formData?.integrations?.coarNotify

        if (coarNotify && !('repoIpAddress' in coarNotify)) {
          const { formData } = config

          formData.integrations.coarNotify.repoIpAddress = null

          await Config.patchAndFetchById(config.id, { formData }, { trx })
        }
      }),
    )
  })
}
