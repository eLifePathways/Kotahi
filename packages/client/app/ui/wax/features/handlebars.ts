import type { AutocompleteAction } from 'prosemirror-autocomplete'
import type { Command } from 'prosemirror-state'

import autocomplete from './autocomplete'
import type { WaxFeature } from '../editor'

export type HandlebarsVariable = {
  value: string
  label: string
  form: string
  type: 'text' | 'link'
}

const MARK = 'handlebars_tag'
const CLASS = 'handlebars'
const BRACKETS = { text: 2, link: 3 }
const ACTIONS = ['open', 'close', 'filter', 'ArrowUp', 'ArrowDown', 'enter']

export const bracketsFor = (
  type: HandlebarsVariable['type'],
): [string, string] => {
  const length = BRACKETS[type] ?? 0
  return ['{'.repeat(length), '}'.repeat(length)]
}

export const variableText = (variable: HandlebarsVariable): string => {
  const [open, close] = bracketsFor(variable.type)
  return `${open} ${variable.value} ${close}`
}

export const insertVariable =
  (
    range: { from: number; to: number },
    variable: HandlebarsVariable,
  ): Command =>
  (state, dispatch) => {
    const text = variableText(variable)
    const { from, to } = range

    if (dispatch) {
      const tr = state.tr.deleteRange(from, to).insertText(text)

      dispatch(
        tr.addMark(
          from,
          from + text.length,
          state.schema.marks[MARK].create({
            class: `${CLASS} ${variable.form}-form`,
            id: '',
          }),
        ),
      )
    }

    return true
  }

const handlebars = (
  onAction: (action: AutocompleteAction) => void,
): WaxFeature =>
  autocomplete({
    markName: MARK,
    className: CLASS,
    triggers: [
      {
        name: 'handlebars',
        trigger: /(\{\{)$/,
        decorationAttrs: { class: CLASS },
      },
    ],
    reducer: (action): boolean => {
      onAction(action)
      return ACTIONS.includes(action.kind)
    },
  })

export default handlebars
