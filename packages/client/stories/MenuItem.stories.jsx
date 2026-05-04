import DesignEmbed from './common/utils'
import { NavItem } from '../app/components/component-menu'

export const Base = args => (
  <>
    {args.figmaEmbedLink && (
      <>
        <h2 style={{ color: '#ffffff' }}>Design</h2>
        <iframe
          allowFullScreen
          height={350}
          src={args.figmaEmbedLink}
          style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
          title="figma embed"
          width="100%"
        />
        <h2 style={{ color: '#ffffff' }}>Component</h2>
      </>
    )}
    <NavItem {...args} />
  </>
)
export const Active = Base.bind()
export const User = Base.bind()
export const Users = Base.bind()
export const CheckSquare = Base.bind()

Base.args = {
  active: false,
  link: '#',
  name: 'Menu item',
  icon: 'home',
}
Active.args = {
  ...Base.args,
  active: true,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A10',
}
User.args = {
  ...Base.args,
  icon: 'user',
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A13',
}
Users.args = {
  ...Base.args,
  icon: 'users',
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A16',
}
CheckSquare.args = {
  ...Base.args,
  icon: 'check-square',
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A19',
}

export default {
  title: 'Menu/Item',
  component: NavItem,
  argTypes: {
    active: { control: { type: 'boolean' } },
    link: { control: { type: 'text' } },
    name: { control: { type: 'text' } },
    icon: { control: { type: 'text' } },
  },
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A3" />
      ),
    },
    backgrounds: {
      default: 'dark',
    },
  },
}
