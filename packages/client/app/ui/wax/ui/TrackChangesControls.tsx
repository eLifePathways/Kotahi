import { useState, type ReactNode } from 'react'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { grid } from '@coko/client'

import Button from '../../shared/Button'
import Select from '../../shared/Select'
import { useWax } from '../editor'
import { setChangesVisible } from '../features/trackChanges'

const StyledSelect = styled(Select)`
  min-width: ${grid(28)};
  width: auto;
`

type TrackingModeProps = {
  suggesting: boolean
  onChange: (suggesting: boolean) => void
  disabled?: boolean
}

export const TrackingMode = ({
  suggesting,
  onChange,
  disabled = false,
}: TrackingModeProps): ReactNode => (
  <StyledSelect
    aria-label="Editing mode"
    disabled={disabled}
    onChange={(value): void => onChange(value === 'suggesting')}
    options={[
      { value: 'editing', label: 'Editing' },
      { value: 'suggesting', label: 'Suggesting' },
    ]}
    size="small"
    value={suggesting ? 'suggesting' : 'editing'}
  />
)

export const ShowChangesButton = (): ReactNode => {
  const { view } = useWax()
  const [hidden, setHidden] = useState(false)

  const toggle = (): void => {
    if (!view) return
    setChangesVisible(!hidden)(view.state, view.dispatch)
    setHidden(!hidden)
  }

  return (
    <Button
      aria-label={hidden ? 'Show suggestions' : 'Hide suggestions'}
      aria-pressed={hidden}
      icon={hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      onClick={toggle}
      onMouseDown={(event): void => event.preventDefault()}
      size="small"
      title={hidden ? 'Show suggestions' : 'Hide suggestions'}
      type="text"
    />
  )
}
