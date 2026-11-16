const { config: appConfig } = require('@coko/server')

const Config = require('../models/config/config.model')
const { stripSensitiveInformation } = require('./config/configUtils')
const { getConfigJsonString } = require('./config/configObject')

const groupConfigs = async group => {
  const configs =
    group.configs || (await Config.find({ groupId: group.id })).result

  return configs.map(async config => {
    const strippedConfig = await stripSensitiveInformation(config)
    strippedConfig.formData = JSON.stringify(strippedConfig.formData)

    strippedConfig.flaxSiteUrl =
      appConfig.has('flax-site.clientFlaxSiteUrl') &&
      appConfig.get('flax-site.clientFlaxSiteUrl')

    return strippedConfig
  })
}

const oldConfig = () => getConfigJsonString()

module.exports = { groupConfigs, oldConfig }
