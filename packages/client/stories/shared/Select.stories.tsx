import { useState, type ReactNode } from 'react'

import preview from '../../.storybook/preview'
import Select from '../../app/ui/shared/Select'

type Option = {
  label: string
  value: string
}

const names = [
  'Aroha Ngata',
  'Bilal Haddad',
  'Chiara Rossi',
  'Daniel Okafor',
  'Elena Petrova',
  'Fumiko Tanaka',
  'Gustavo Lima',
  'Hannah Schmidt',
  'Ines Moreau',
  'Jonas Berg',
]

const toOptions = (labels: string[]): Option[] =>
  labels.map(label => ({ label, value: label }))

const options = toOptions(names)

const groupedOptions = [
  {
    label: 'Editors',
    options: toOptions(names.slice(0, 4)),
  },
  {
    label: 'Reviewers',
    options: toOptions(names.slice(4, 8)),
  },
]

const longOptions = names.map(name => ({
  label: `${name} has been invited to review this manuscript and has not yet responded to the invitation, which was sent over two weeks ago.`,
  value: name,
}))

const AsyncDemo = (): ReactNode => {
  const [loading, setLoading] = useState(false)
  const [optionsData, setOptionsData] = useState<Option[]>([])

  const handleSearch = (searchValue: string): void => {
    setLoading(true)

    setTimeout(() => {
      setOptionsData(
        toOptions(
          names.filter(name =>
            name.toLowerCase().includes(searchValue.toLowerCase()),
          ),
        ),
      )
      setLoading(false)
    }, 500)
  }

  return (
    <Select
      async
      loading={loading}
      mode="multiple"
      onSearch={handleSearch}
      options={optionsData}
      placeholder="Search for a user"
    />
  )
}

const meta = preview.meta({
  component: Select,
})

export const Base = meta.story({
  args: {
    options,
    placeholder: 'Select a user',
  },
})

export const WithGroups = meta.story({
  args: {
    options: groupedOptions,
    placeholder: 'Select a user',
  },
})

export const Multi = meta.story({
  args: {
    mode: 'multiple',
    options,
    placeholder: 'Select users',
  },
})

/** Options are fetched as you type, with the search debounced. */
export const Async = meta.story({
  render: () => <AsyncDemo />,
})

export const WrapOptionText = meta.story({
  args: {
    options: longOptions,
    placeholder:
      'Very long text options, sentence will be wrapped and option element will increase in height',
    wrapOptionText: true,
  },
})
