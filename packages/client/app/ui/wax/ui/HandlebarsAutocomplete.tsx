import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AutocompleteAction } from 'prosemirror-autocomplete'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import Badge from '../../shared/Badge'
import { useWax } from '../editor'
import {
  insertVariable,
  variableText,
  type HandlebarsVariable,
} from '../features/handlebars'
import SelectionOverlay from './SelectionOverlay'

type Listener = (action: AutocompleteAction) => void

export type HandlebarsListener = {
  onAction: Listener
  subscribe: (listener: Listener) => () => void
}

export const createHandlebarsListener = (): HandlebarsListener => {
  const listeners = new Set<Listener>()

  return {
    onAction: (action): void => listeners.forEach(listener => listener(action)),
    subscribe: (listener): (() => void) => {
      listeners.add(listener)
      return (): void => {
        listeners.delete(listener)
      }
    },
  }
}

const Heading = styled.div`
  background-color: ${th('color.brand1.shade25')};
  color: #fff;
  display: flex;
  font-size: ${th('fontSizeBaseSmall')};
  justify-content: space-between;
  padding: ${grid(1)} ${grid(2.4)};
`

const Options = styled.ul`
  list-style: none;
  margin: 0;
  max-height: 202px;
  min-width: 260px;
  overflow-y: auto;
  padding: 0;
`

const Option = styled.button`
  align-items: center;
  background-color: white;
  border: none;
  border-bottom: 1px solid ${th('color.brand1.tint70')};
  cursor: pointer;
  display: flex;
  font-size: ${th('fontSizeBaseSmall')};
  gap: ${grid(10)};
  justify-content: space-between;
  padding: ${grid(3)} ${grid(4)};
  text-align: left;
  width: 100%;

  &:hover,
  &[aria-selected='true'] {
    background-color: ${th('color.brand1.tint90')};
  }
`

const OptionLabel = styled.span`
  display: flex;
  flex-direction: column;
  white-space: nowrap;

  small {
    color: ${th('color.gray20')};
  }
`

const normalize = (value?: string): string => value?.trim().toLowerCase() ?? ''

const labelFor = (variable: HandlebarsVariable): string => {
  if (variable.label.trim()) return variable.label.trim()
  const spaced = variable.value.split(/(?=[A-Z])/).join(' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const matches = (variable: HandlebarsVariable, search: string): boolean => {
  const term = normalize(search)
  const values = [variable.value, variable.label, variable.form].map(normalize)
  return values.some(v => v.startsWith(term)) && values[0] !== term
}

type Range = { from: number; to: number }

type HandlebarsAutocompleteProps = {
  listener: HandlebarsListener
  variables: HandlebarsVariable[]
}

const HandlebarsAutocomplete = ({
  listener,
  variables,
}: HandlebarsAutocompleteProps): ReactNode => {
  const view = useWax(s => s.view)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [index, setIndex] = useState(0)
  const range = useRef<Range | null>(null)
  const list = useRef<HTMLUListElement>(null)

  const options = variables.filter(variable => matches(variable, search))

  const choose = (variable?: HandlebarsVariable): void => {
    if (!view || !variable || !range.current) return
    insertVariable(range.current, variable)(view.state, view.dispatch)
    view.focus()
    setOpen(false)
    setSearch('')
    setIndex(0)
  }

  const latest = useRef({ options, index, choose })

  useLayoutEffect(() => {
    latest.current = { options, index, choose }
  })

  useEffect(
    () =>
      listener.subscribe(action => {
        range.current = action.range
        const {
          options: current,
          index: selected,
          choose: pick,
        } = latest.current

        if (action.kind === 'open') {
          setOpen(true)
          setSearch('')
        } else if (action.kind === 'close') {
          setOpen(false)
          setIndex(0)
        } else if (action.kind === 'filter') {
          setSearch(action.filter ?? '')
          setIndex(0)
        } else if (action.kind === 'ArrowDown' && current.length) {
          setIndex(selected < current.length - 1 ? selected + 1 : 0)
        } else if (action.kind === 'ArrowUp' && current.length) {
          setIndex(selected > 0 ? selected - 1 : current.length - 1)
        } else if (action.kind === 'enter') {
          pick(current[selected])
        }
      }),
    [listener],
  )

  useEffect(() => {
    list.current?.children[index]?.scrollIntoView({ block: 'nearest' })
  }, [index])

  if (!open || !options.length) return null

  return (
    <SelectionOverlay label="Form variables">
      <Heading>
        <small>FORMS VARIABLES</small>
        <small>RESULTS: {options.length}</small>
      </Heading>
      <Options aria-label="Form Variables List" ref={list} role="listbox">
        {options.map((variable, i) => (
          <li key={variable.value}>
            <Option
              aria-label={`${labelFor(variable)} (${variable.form})`}
              aria-selected={index === i}
              onMouseDown={(event): void => {
                event.preventDefault()
                choose(variable)
              }}
              role="option"
              type="button"
            >
              <OptionLabel>
                <span>{labelFor(variable)}</span>
                <small>{variableText(variable)}</small>
              </OptionLabel>
              <Badge small>{variable.form}</Badge>
            </Option>
          </li>
        ))}
      </Options>
    </SelectionOverlay>
  )
}

export default HandlebarsAutocomplete
