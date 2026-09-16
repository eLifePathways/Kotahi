import preview from '../../.storybook/preview'
import Tabs from '../../app/ui/shared/Tabs'

const meta = preview.meta({
  component: Tabs,
})

export const Base = meta.story({
  args: {
    items: [
      {
        key: '1',
        label: 'Tab One',
        children: 'Content of Tab One',
      },
      {
        key: '2',
        label: 'Tab Two',
        children: 'Content of Tab Two',
      },
      {
        key: '3',
        label: 'Tab Three',
        children: 'Content of Tab Three',
      },
    ],
  },
})

export const DisabledTab = meta.story({
  args: {
    items: [
      {
        key: '1',
        label: 'Tab One',
        children: 'Content of Tab One',
      },
      {
        key: '2',
        label: 'Tab Two',
        children: 'Content of Tab Two',
        disabled: true,
      },
      {
        key: '3',
        label: 'Tab Three',
        children: 'Content of Tab Three',
      },
    ],
  },
})

export const WithExtraContent = meta.story({
  args: {
    items: [
      {
        key: '1',
        label: 'Tab One',
        children: 'Content of Tab One',
      },
      {
        key: '2',
        label: 'Tab Two',
        children: 'Content of Tab Two',
      },
      {
        key: '3',
        label: 'Tab Three',
        children: 'Content of Tab Three',
      },
    ],
    tabBarExtraContent: <button type="button">Action</button>,
  },
})
