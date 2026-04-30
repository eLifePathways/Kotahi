const { config: appConfig } = require('@coko/server')

const Group = require('../models/group/group.model')
const { stripSensitiveInformation } = require('./config/configUtils')
const { getConfigJsonString } = require('./config/configObject')

const groupByName = async (_, { name }) => {
  const group = await Group.findOne({
    name,
  })

  if (!group) {
    throw new Error(`Group not found!`)
  } else if (group && group.isArchived) {
    throw new Error(`Group has been archived!`)
  }

  return group
}

const groupConfigs = async group => {
  const configs =
    group.configs || (await Group.relatedQuery('configs').for(group.id))

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

module.exports = { groupByName, groupConfigs, oldConfig }
