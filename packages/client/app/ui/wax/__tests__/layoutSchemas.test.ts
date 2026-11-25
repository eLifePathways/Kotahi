import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import buildSchema from '../editor/schema'
import { parse, serialize } from '../editor/htmlFormat'
import {
  chatFeatures,
  contentFeatures,
  fullFeatures,
  productionFeatures,
  simpleFeatures,
} from '../layouts/featureSets'
import type { WaxFeature } from '../features/types'
import describeSchema from './describeSchema'

vi.mock(
  '@coko/client',
  async (importOriginal): Promise<Record<string, unknown>> => ({
    ...(await importOriginal<Record<string, unknown>>()),
    uuid: (): string => '<uuid>',
  }),
)

/**
 * Each new layout must build exactly the schema its old editor built. The
 * expected schemas are the snapshots recorded from the old editors, and the
 * expected saved HTML is the round-trip fixtures generated from staging.
 */

const FIXTURES = path.join(import.meta.dirname, '__fixtures__', 'roundtrip')

const read = (file: string): string =>
  fs.readFileSync(path.join(FIXTURES, file), 'utf8').replace(/\n$/, '')

const withoutApprovedChanges = (html: string): string =>
  html.replace(/<ul\b[^>]*>/g, tag =>
    tag.replace(/ data-(id|group|viewid)="[^"]*"/g, ''),
  )

const fixtureModes = (name: string): string[] =>
  fs.existsSync(path.join(FIXTURES, `${name}.tables.input.html`))
    ? ['defaults', 'samples', 'tables']
    : ['defaults', 'samples']

const withApprovedStagingChanges = (html: string): string =>
  html.replace(
    /<span class="strikethrough"[^>]*>/g,
    '<span class="strikethrough">',
  )

const noop = (): void => {}

const layouts: Record<string, () => WaxFeature[]> = {
  simple: () => simpleFeatures(),
  'simple-handlebars': () =>
    simpleFeatures({
      handlebarsActions: noop,
    }),
  full: () => fullFeatures(),
  production: () => productionFeatures(),
  'author-proofing': () => productionFeatures(),
  chat: () =>
    chatFeatures({ onEnterPress: noop, autoCompleteReducer: () => false }),
  cms: () => contentFeatures(),
}

describe('layout schemas', () => {
  Object.entries(layouts).forEach(([name, features]) => {
    it(`${name} layout builds the ${name} editor schema`, () => {
      const snapshot = fs.readFileSync(
        path.join(import.meta.dirname, '__snapshots__', `schema-${name}.json`),
        'utf8',
      )

      expect(
        `${JSON.stringify(describeSchema(buildSchema(features())), null, 2)}\n`,
      ).toBe(snapshot)
    })
    fixtureModes(name).forEach(mode => {
      it(`${name} layout saves the ${mode} fixture like staging`, () => {
        const schema = buildSchema(features())
        const input = read(`${name}.${mode}.input.html`)
        const saved = serialize(schema, parse(schema, input).content)

        expect(withoutApprovedChanges(saved)).toBe(
          withApprovedStagingChanges(read(`${name}.${mode}.expected.html`)),
        )
      })
    })
  })
})
