/**
 * This test suite exists to ensure that saved content has not changed compared
 * to the editors on the staging branch (before the wax rework). The fixtures
 * were generated with staging's editors: each input is staging's saved HTML,
 * each expected file is what staging saves after loading that input again.
 *
 * Each editor has two fixtures with the same elements and structure:
 * - defaults: every attribute keeps its schema default (empty ids, empty track
 *   changes, etc.), except href and src. This covers plain content.
 * - samples: attributes are filled in with realistic values (ids, alt texts,
 *   titles, track change entries, column widths, styles). Most attributes are
 *   only written to the HTML when they have a value, so this covers the code
 *   that reads and writes them.
 */

import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import Application from '../wax-prosemirror-core/src/Application'
import helpers from '../wax-prosemirror-core/src/helpers/helpers'
import {
  parser,
  serializer,
} from '../wax-prosemirror-core/src/helpers/htmlFormat'

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

const FIXTURES = path.join(import.meta.dirname, '__fixtures__', 'roundtrip')
const MODES = ['defaults', 'samples']

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

const read = file => fs.readFileSync(path.join(FIXTURES, file), 'utf8').trim()

const roundTrip = (schema, html) => {
  let saved
  const doc = parser(schema)(html)
  helpers.saveContent(
    doc.content,
    value => {
      saved = value
    },
    schema,
    serializer,
  )
  return saved
}

// Approved difference from staging: bullet lists now also write their
// track-change data-id, data-group and data-viewid (staging dropped them).
const withoutApprovedChanges = html =>
  html.replace(/<ul\b[^>]*>/g, tag =>
    tag.replace(/ data-(id|group|viewid)="[^"]*"/g, ''),
  )

describe('saved content matches the staging editors', () => {
  Object.entries(editors).forEach(([name, createConfig]) => {
    MODES.forEach(mode => {
      it(`${name} (${mode})`, () => {
        const schema = Application.create({
          config: createConfig(),
        }).getSchema()
        const input = read(`${name}.${mode}.input.html`)
        const expected = read(`${name}.${mode}.expected.html`)

        expect(withoutApprovedChanges(roundTrip(schema, input))).toBe(expected)
      })
    })
  })
})
