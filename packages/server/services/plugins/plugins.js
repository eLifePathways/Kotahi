/* eslint-disable no-console */
const { getBroker } = require('./broker')

const Group = require('../../models/group/group.model')

/** Read the plugin manifest and do some basic validation; throw an error if there's a problem */
const readPluginGroupsFromManifestFile = async () => {
  let pluginGroups

  try {
    // eslint-disable-next-line import/no-unresolved
    pluginGroups = require('../../config/plugins/plugins_manifest.json')
    /* eslint-disable-next-line */
  } catch (error) {
    console.info('No plugins manifest found; skipping plugins.')
    return []
  }

  if (
    !Array.isArray(pluginGroups) ||
    pluginGroups.some(
      g =>
        !g.groupName ||
        typeof g.groupName !== 'string' ||
        !Array.isArray(g.plugins) ||
        g.plugins.some(
          p =>
            !p.name ||
            typeof p.name !== 'string' ||
            !p.folderName ||
            typeof p.folderName !== 'string',
        ),
    )
  )
    throw new Error(
      'Malformed config/plugins/plugins_manifest.json file. See example_plugins_manifest.json for correct structure.',
    )

  return pluginGroups
}

/** To be called at server startup, this finds and registers plugins as configured for each group in plugins_manifest.json.
 * This will call the startPlugin function on each plugin, passing a pluginBroker to each.
 */
const registerPlugins = async () => {
  try {
    const pluginGroups = await readPluginGroupsFromManifestFile()

    await Promise.all(
      pluginGroups.map(async pluginGroup => {
        const { groupName, plugins } = pluginGroup

        try {
          const group = await Group.query().findOne({ name: groupName })
          if (!group) throw new Error('No such group found.')

          plugins.forEach(plugin => {
            const { name, folderName } = plugin

            try {
              if (folderName.includes('/'))
                throw new Error(
                  `Illegal plugin folder name '${folderName}'. Plugins must reside directly beneath the config/plugins/ folder and cannot contain a slash.`,
                )

              const startPlugin = require(`../../config/plugins/${folderName}`)
              console.info(`Starting plugin ${name} in ${groupName} group...`)
              startPlugin(getBroker(group.id, name))
            } catch (error) {
              console.error(
                `Failed to register plugin ${name} for group ${groupName} (will skip this plugin):`,
              )
              console.error(error)
            }
          })
        } catch (error) {
          error.message = `Failed to register plugins for group ${groupName}: ${error.message}`
          throw error
        }
      }),
    )
  } catch (error) {
    console.error('Failed to register plugins:')
    console.error(error)
  }
}

module.exports = { registerPlugins }
