import { useState, type ReactNode } from 'react'
import { Input, Popover } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { grid } from '@coko/client'

import Button from '../../shared/Button'
import ButtonGroup from '../../shared/ButtonGroup'
import { useWax } from '../editor'
import {
  canToggleLink,
  getActiveLink,
  removeLink,
  setLink,
} from '../features/link'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
  width: ${grid(40)};
`

const LinkButton = (): ReactNode => {
  const view = useWax(s => s.view)
  const [open, setOpen] = useState(false)
  const [href, setHref] = useState('')

  const enabled: boolean = useWax(({ state }) =>
    Boolean(state && (getActiveLink(state) || canToggleLink(state))),
  )

  const active: boolean = useWax(({ state }) =>
    Boolean(state && getActiveLink(state)),
  )

  const handleOpenChange = (next: boolean): void => {
    if (next && view) setHref(getActiveLink(view.state)?.href ?? '')
    setOpen(next)
  }

  const close = (): void => {
    setOpen(false)
    view?.focus()
  }

  const apply = (): void => {
    if (view && href) setLink(href)(view.state, view.dispatch)
    close()
  }

  const remove = (): void => {
    if (view) removeLink(view.state, view.dispatch)
    close()
  }

  const content = (
    <Form
      onSubmit={(event): void => {
        event.preventDefault()
        apply()
      }}
    >
      <Input
        aria-label="Link address"
        onChange={(event): void => setHref(event.target.value)}
        placeholder="https://"
        value={href}
      />
      <ButtonGroup justify="right">
        {active ? (
          <Button onClick={remove} size="small">
            Remove
          </Button>
        ) : null}
        <Button htmlType="submit" size="small" type="primary">
          Apply
        </Button>
      </ButtonGroup>
    </Form>
  )

  return (
    <Popover
      content={content}
      onOpenChange={handleOpenChange}
      open={open}
      trigger="click"
    >
      <Button
        aria-label="Link"
        aria-pressed={active}
        disabled={!enabled}
        icon={<LinkOutlined />}
        size="small"
        title="Link"
        type={active ? 'primary' : 'text'}
      />
    </Popover>
  )
}

export default LinkButton
