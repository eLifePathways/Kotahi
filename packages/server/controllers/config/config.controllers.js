const { File } = require('@coko/server')

const { Config, Group } = require('../../models')
const { getConfigJsonString } = require('./configObject')

const {
  hideSensitiveInformation,
  revertHiddenSensitiveInformation,
  rescheduleJobsOnChange,
} = require('./configUtils')

const { setFileUrls } = require('../../utils/fileStorageUtils')

const getFile = async (config, fieldName) => {
  try {
    const { groupIdentity } = JSON.parse(config.formData)
    const file = await File.findById(groupIdentity[fieldName])

    const updatedStoredObjects = await setFileUrls(file.storedObjects)

    file.storedObjects = updatedStoredObjects
    return file
    /* eslint-disable-next-line */
  } catch (error) {
    return null
  }
}

const getConfig = async id => {
  let config = await Config.query().findById(id)
  config = await hideSensitiveInformation(config)
  config.formData = JSON.stringify(config.formData)
  return config
}

const getOldConfig = () => getConfigJsonString()

const updateConfig = async (id, formData, isActive) => {
  const existingConfig = await Config.query().findById(id)
  const inputFormData = JSON.parse(formData)

  const reverted = await revertHiddenSensitiveInformation(
    existingConfig,
    inputFormData,
  )

  const configInput = {
    formData: reverted,
    active: isActive,
  }

  let config = await Config.query().updateAndFetchById(id, configInput)
  await rescheduleJobsOnChange(existingConfig, config)
  config = await hideSensitiveInformation(config)
  config.formData = JSON.stringify(config.formData)
  return config
}

const getIcon = async config => getFile(config, 'favicon')
const getLogo = async config => getFile(config, 'logoId')

const translationOverrides = async groupId => {
  const { name: groupName } = await Group.query().findById(groupId)

  let groupOverrides
  let globalOverrides

  try {
    groupOverrides = require(
      `../../config/translation/${groupName}/translationOverrides`,
    )
  } catch {
    groupOverrides = {}
  }

  try {
    // eslint-disable-next-line import/no-unresolved, import/extensions, n/no-missing-require
    globalOverrides = require('../../config/translation/translationOverrides')
  } catch {
    globalOverrides = {}
  }

  return JSON.stringify({ groupOverrides, globalOverrides })
}

module.exports = {
  getConfig,
  getIcon,
  getLogo,
  getOldConfig,
  translationOverrides,
  updateConfig,
}
