import { useState, type ComponentProps, type ReactNode } from 'react'

import preview from '../../.storybook/preview'
import Radio from '../../app/ui/shared/Radio'

const options = [
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under review', value: 'underReview' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
]

type DemoProps = Omit<ComponentProps<typeof Radio>, 'value' | 'onChange'>

const Demo = (props: DemoProps): ReactNode => {
  const [value, setValue] = useState<string | null>(null)

  return <Radio {...props} onChange={setValue} value={value} />
}

const meta = preview.meta({
  component: Radio,
})

export const Base = meta.story({
  render: () => <Demo name="radio" options={options} />,
})

export const Vertical = meta.story({
  render: () => <Demo options={options} vertical />,
})

export const ButtonStyle = meta.story({
  render: () => <Demo options={options} optionType="button" />,
})

export const SolidButtonStyle = meta.story({
  render: () => (
    <Demo buttonStyle="solid" options={options} optionType="button" />
  ),
})
