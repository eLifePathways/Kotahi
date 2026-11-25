import { useMemo, useState, type ReactNode } from 'react'
import { Input, Popover } from 'antd'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import Button from '../../shared/Button'
import { useWax } from '../editor'

export type SpecialCharacter = {
  unicode: string
  name: string
  group: string
}

type SpecialCharactersProps = {
  characters: SpecialCharacter[]
}

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
  max-height: ${grid(60)};
  overflow-y: auto;
  width: ${grid(60)};
`

const GroupName = styled.h4`
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
  margin: 0;
`

const Grid = styled.div`
  display: grid;
  gap: ${grid(0.5)};
  grid-template-columns: repeat(auto-fill, minmax(${grid(7)}, 1fr));
`

const SpecialCharacters = ({
  characters,
}: SpecialCharactersProps): ReactNode => {
  const { view } = useWax()
  const [search, setSearch] = useState('')

  const groups = useMemo(() => {
    const term = search.toLowerCase()
    const result = new Map<string, SpecialCharacter[]>()

    characters
      .filter(c => !term || c.name.toLowerCase().includes(term))
      .forEach(c => result.set(c.group, [...(result.get(c.group) ?? []), c]))

    return [...result.entries()]
  }, [characters, search])

  const insert = (character: SpecialCharacter): void => {
    if (!view) return
    const { from, to } = view.state.selection
    view.dispatch(view.state.tr.insertText(character.unicode, from, to))
    view.focus()
  }

  const content = (
    <Panel>
      <Input
        aria-label="Search characters"
        onChange={(event): void => setSearch(event.target.value)}
        placeholder="Search"
        value={search}
      />
      {groups.map(([group, items]) => (
        <section key={group}>
          <GroupName>{group}</GroupName>
          <Grid>
            {items.map(character => (
              <Button
                aria-label={character.name}
                key={character.unicode}
                onClick={(): void => insert(character)}
                onMouseDown={(event): void => event.preventDefault()}
                size="small"
                title={character.name}
              >
                {character.unicode}
              </Button>
            ))}
          </Grid>
        </section>
      ))}
    </Panel>
  )

  return (
    <Popover content={content} trigger="click">
      <Button
        aria-label="Special characters"
        size="small"
        title="Special characters"
        type="text"
      >
        Ω
      </Button>
    </Popover>
  )
}

export default SpecialCharacters
