/**
 * This test suite exists to ensure that each editor wires up the same services,
 * tools, tool groups and menus. The schema and round-trip tests only cover what
 * ends up in the schema, so they can't catch problems in how the rest is built.
 *
 * For every editor, each registered name is resolved and the snapshot records:
 * - the class that comes back
 * - the dependencies tools receive (config and pm plugins)
 * - the tools and tool groups each tool group contains, in order
 * - the menus and the area each one is shown in
 * - whether repeated lookups return the same instance or a new one
 *
 * It was recorded with inversify before it was replaced by the registry, and
 * matched exactly after the switch. Any change to services, tool groups or menu
 * config shows up here as a difference to review.
 */

import { describe, expect, it, vi } from 'vitest'

import Application from '../wax-prosemirror-core/src/Application'

import fullWaxEditorConfig from '../wax-collab/config/FullWaxEditorConfig'
import simpleWaxEditorConfig from '../wax-collab/config/SimpleWaxEditorConfig'
import productionWaxEditorConfig from '../wax-collab/config/ProductionWaxEditorConfig'
import authorProofingWaxEditorConfig from '../wax-collab/config/AuthorProofingWaxEditorConfig'
import chatWaxEditorConfig from '../chat-editor/ChatWaxEditorConfig'
import contentEditorConfig from '../cms-editor/config/ContentEditorConfig'
import createHandlebarsState from '../handlebars-autocomplete/config'

vi.mock('@coko/client', async importOriginal => ({
  ...(await importOriginal()),
  uuid: () => '<uuid>',
}))

const noop = () => {}
const noComments = () => []

const editors = {
  full: () => fullWaxEditorConfig(noop, noop, noComments, false, {}),
  simple: () => simpleWaxEditorConfig(),
  'simple-handlebars': () =>
    simpleWaxEditorConfig({
      autocompleteConfig: createHandlebarsState({}).autocompleteConfig,
    }),
  production: () =>
    productionWaxEditorConfig(
      noop,
      noop,
      noop,
      noop,
      noop,
      noComments,
      noop,
      false,
      false,
      {},
    ),
  'author-proofing': () =>
    authorProofingWaxEditorConfig(noop, noop, noop, noop, noop, noComments),
  chat: () => chatWaxEditorConfig({ onEnterPress: noop }),
  cms: () => contentEditorConfig(noop),
}

const bindingCounts = container =>
  container.ids().map(id => [id, container.count(id)])

const className = value => value?.constructor?.name

const describeDependency = value => {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'function') return '[function]'
  return className(value)
}

const describeValue = value => {
  if (typeof value === 'function') return '[function]'
  if (Array.isArray(value)) return value.map(describeValue)
  if (!value || typeof value !== 'object') return value

  const out = { class: className(value) }

  if ('pmplugins' in value && 'config' in value && 'name' in value) {
    out.name = value.name
    out.config = describeDependency(value.config)
    out.pmplugins = describeDependency(value.pmplugins)
  }

  if (Array.isArray(value._tools)) {
    out.tools = value._tools.map(tool => tool?.name ?? describeDependency(tool))
  }

  if (Array.isArray(value._toolGroups) && value._toolGroups.length) {
    out.toolGroups = value._toolGroups.map(group =>
      group?.groups
        ? { name: group.name, groups: group.groups.map(className) }
        : className(group),
    )
  }

  if (Array.isArray(value.menus)) out.menus = value.menus.map(describeValue)
  if (value.config?.templateArea) out.templateArea = value.config.templateArea

  return out
}

const resolve = (container, id, count) => {
  try {
    if (count > 1) return { all: describeValue(container.getAll(id)) }

    const first = container.get(id)
    const second = container.get(id)

    return {
      value: describeValue(first),
      shared:
        (typeof first === 'object' || typeof first === 'function') &&
        first !== null &&
        first === second,
    }
  } catch (e) {
    return { error: e.message }
  }
}

describe('wax editor container resolution', () => {
  Object.entries(editors).forEach(([name, createConfig]) => {
    it(`${name} editor resolves the same things`, async () => {
      const { container } = Application.create({ config: createConfig() })

      const resolved = bindingCounts(container).map(([id, count]) => ({
        id,
        count,
        ...resolve(container, id, count),
      }))

      await expect(
        `${JSON.stringify(resolved, null, 2)}\n`,
      ).toMatchFileSnapshot(`./__snapshots__/resolution-${name}.json`)
    })
  })
})
