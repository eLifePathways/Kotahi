import { useState, type ComponentProps, type ReactNode } from 'react'

import preview from '../../.storybook/preview'
import Switch from '../../app/ui/shared/Switch'

type DemoProps = Omit<ComponentProps<typeof Switch>, 'checked' | 'onChange'>

const Demo = (props: DemoProps): ReactNode => {
  const [checked, setChecked] = useState(false)

  return <Switch {...props} checked={checked} onChange={setChecked} />
}

const meta = preview.meta({
  component: Switch,
})

export const Base = meta.story({
  render: () => <Demo />,
})

export const WithLabel = meta.story({
  render: () => <Demo label="View archived manuscripts" />,
})

export const WithLabelLeft = meta.story({
  render: () => <Demo label="View archived manuscripts" labelPosition="left" />,
})
