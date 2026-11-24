import { useEffect, useState, type ReactNode } from 'react'
import { Checkbox, Input, Popover } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import Button from '../../shared/Button'
import ButtonGroup from '../../shared/ButtonGroup'
import { useWax } from '../editor'
import {
  getMatches,
  replaceAll,
  replaceMatch,
  selectMatch,
  setSearchMatchCase,
  setSearchText,
} from '../features/findAndReplace'

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
  width: ${grid(60)};
`

const Count = styled.span`
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
`

const FindAndReplace = (): ReactNode => {
  const view = useWax(s => s.view)
  const count: number = useWax(({ state }) =>
    state ? getMatches(state).length : 0,
  )
  const [open, setOpen] = useState(false)
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!view) return
    setSearchText(open ? find : '')
    setSearchMatchCase(matchCase)
    view.dispatch(view.state.tr)
  }, [view, open, find, matchCase])

  const go = (next: number): void => {
    if (!view || !count) return
    const target = (next + count) % count
    selectMatch(target)(view.state, view.dispatch)
    setIndex(target)
  }

  const replaceCurrent = (): void => {
    if (view) replaceMatch(index, replace)(view.state, view.dispatch)
  }

  const replaceEvery = (): void => {
    if (view) replaceAll(replace)(view.state, view.dispatch)
  }

  const content = (
    <Panel>
      <Input
        aria-label="Find"
        onChange={(event): void => {
          setFind(event.target.value)
          setIndex(0)
        }}
        onPressEnter={(): void => go(index + 1)}
        placeholder="Find"
        suffix={
          <Count>{find ? `${count ? index + 1 : 0} / ${count}` : null}</Count>
        }
        value={find}
      />
      <Input
        aria-label="Replace with"
        onChange={(event): void => setReplace(event.target.value)}
        placeholder="Replace with"
        value={replace}
      />
      <Checkbox
        checked={matchCase}
        onChange={(event): void => {
          setMatchCase(event.target.checked)
          setIndex(0)
        }}
      >
        Match case
      </Checkbox>
      <ButtonGroup justify="right">
        <Button
          disabled={!count}
          onClick={(): void => go(index - 1)}
          size="small"
        >
          Previous
        </Button>
        <Button
          disabled={!count}
          onClick={(): void => go(index + 1)}
          size="small"
        >
          Next
        </Button>
        <Button disabled={!count} onClick={replaceCurrent} size="small">
          Replace
        </Button>
        <Button
          disabled={!count}
          onClick={replaceEvery}
          size="small"
          type="primary"
        >
          Replace all
        </Button>
      </ButtonGroup>
    </Panel>
  )

  return (
    <Popover
      content={content}
      onOpenChange={setOpen}
      open={open}
      trigger="click"
    >
      <Button
        aria-label="Find and replace"
        icon={<SearchOutlined />}
        size="small"
        title="Find and replace"
        type="text"
      />
    </Popover>
  )
}

export default FindAndReplace
