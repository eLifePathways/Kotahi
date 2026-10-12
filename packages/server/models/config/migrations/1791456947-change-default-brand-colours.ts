import { useTransaction } from '@coko/server'
import Config from '../config.model.js'

const compareColours = (input: string, hex: string): boolean =>
  input?.toLowerCase() === hex.toLowerCase()

/**
 * We only seek to migrate default configs which are completely non-compliant.
 * If there is a mix between one of the old default values and any other,
 * we skip the config as a user has touched it. The UI will show a warning to
 * admins, where they will be able to change the values of their own colours.
 * @returns {void}
 */
export async function up(): Promise<void> {
  return useTransaction(async trx => {
    const { result: configs } = await Config.find({}, { trx })

    await Promise.all(
      configs.map(async config => {
        const { primaryColor, secondaryColor } = config.formData
          ?.groupIdentity || { primaryColor: '', secondaryColor: '' }

        if (
          compareColours(primaryColor, '#3aae2a') &&
          compareColours(secondaryColor, '#9e9e9e')
        ) {
          const newConfig = config

          newConfig.formData.groupIdentity.primaryColor = '#4a7c59'
          newConfig.formData.groupIdentity.secondaryColor = '#6b7280'

          await Config.patchAndFetchById(config.id, newConfig, { trx })
        }
      }),
    )
  })
}

/**
 * This migration is fixing an accessibility issue, and should not be `down`ed
 * as this would be a regression.
 * */
export async function down(): Promise<void> {
  return useTransaction(async trx => {
    const { result: configs } = await Config.find({}, { trx })

    await Promise.all(
      configs.map(async config => {
        const { primaryColor, secondaryColor } = config.formData
          ?.groupIdentity || { primaryColor: '', secondaryColor: '' }

        if (
          compareColours(primaryColor, '#4a7c59') &&
          compareColours(secondaryColor, '#6b7280')
        ) {
          const newConfig = config

          newConfig.formData.groupIdentity.primaryColor = '#3aae2a'
          newConfig.formData.groupIdentity.secondaryColor = '#9e9e9e'

          await Config.patchAndFetchById(config.id, newConfig, { trx })
        }
      }),
    )
  })
}
