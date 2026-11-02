import { useTransaction } from '@coko/server'
import Config from '../config.model.js'

export async function up(): Promise<void> {
  return useTransaction(async trx => {
    const { result: configs } = await Config.find({}, { trx })

    await Promise.all(
      configs.map(async config => {
        const manuscript = config.formData?.manuscript

        if (manuscript && 'newSubmission' in manuscript) {
          const { formData } = config

          delete formData.manuscript.newSubmission

          await Config.patchAndFetchById(config.id, { formData }, { trx })
        }
      }),
    )
  })
}

/**
 * The removed values cannot be restored, so the key is brought back for any
 * config with manuscript settings: on for preprint instances, off otherwise.
 * */
export async function down(): Promise<void> {
  return useTransaction(async trx => {
    const { result: configs } = await Config.find({}, { trx })

    await Promise.all(
      configs.map(async config => {
        const manuscript = config.formData?.manuscript

        if (manuscript && !('newSubmission' in manuscript)) {
          const { formData } = config

          formData.manuscript.newSubmission = [
            'preprint1',
            'preprint2',
          ].includes(formData.instanceName)

          await Config.patchAndFetchById(config.id, { formData }, { trx })
        }
      }),
    )
  })
}
