import preview from '../../.storybook/preview'
import CardGrid from '../../app/ui/shared/CardGrid'

const meta = preview.meta({
  component: CardGrid,
})

/** Supposed to be used with `Card` components as children. */
export const Base = meta.story({
  args: {
    items: [
      {
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a consectetur felis. Vestibulum hendrerit eleifend nulla, ac facilisis urna faucibus ac. Nunc at leo eget felis eleifend scelerisque.',
        title: 'Test One',
        key: 'one',
        url: '/admin/one',
      },
      {
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a consectetur felis. Vestibulum hendrerit eleifend nulla, ac facilisis urna faucibus ac. Nunc at leo eget felis eleifend scelerisque.',
        title: 'Test Two',
        key: 'two',
        url: '/admin/two',
      },
      {
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a consectetur felis. Vestibulum hendrerit eleifend nulla, ac facilisis urna faucibus ac. Nunc at leo eget felis eleifend scelerisque.',
        title: 'Test Three',
        key: 'three',
        url: '/admin/three',
      },
    ],
  },
})
