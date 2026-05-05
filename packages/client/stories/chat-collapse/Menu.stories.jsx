import styled from 'styled-components'
import Menu from '../../app/components/Menu'
import DesignEmbed from '../common/utils'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import { JournalProvider } from '../../app/components/xpub-journal'
import { ConfigProvider } from '../../app/components/config/src'
import journal from '../../config/journal'
import config from '../../config/sampleConfigFormData'

const Root = styled.div`
  display: grid;
  /* stylelint-disable-next-line string-quotes */
  grid-template-areas: 'menu main';
  grid-template-columns: 200px auto;
  height: 100vh;
  max-height: 100vh;
  ${({ converting }) =>
    converting &&
    `
     button,
     a {
       pointer-events: none;
     }
  `};
  overflow: hidden;
  position: relative;
  z-index: 0;
`

export const Base = args => (
  <XpubProvider>
    <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
      <ConfigProvider config={config}>
        <Root>
          <Menu {...args} />
        </Root>
      </ConfigProvider>
    </JournalProvider>
  </XpubProvider>
)

Base.args = {
  brand: 'Kotahi',
  brandLink: '/kotahi/dashboard',
  className: '',
  loginLink: '/login?next=/kotahi/dashboard',
  navLinkComponents: [
    {
      link: '/kotahi/dashboard',
      name: 'Dashboard',
      icon: 'home',
    },
    {
      link: '/kotahi/admin/form-builder',
      name: 'Forms',
      icon: 'check-square',
    },
    {
      link: '/kotahi/admin/users',
      name: 'Users',
      icon: 'users',
    },
    {
      link: '/kotahi/admin/manuscripts',
      name: 'Manuscripts',
      icon: 'file-text',
    },
    {
      link: '/kotahi/admin/reports',
      name: 'Reports',
      icon: 'activity',
    },
    {
      link: '/kotahi/profile',
      name: 'My profile',
      icon: 'user',
    },
  ],
  notice: ' ',
  profileLink: '/kotahi/profile',
  user: {
    __typename: 'User',
    id: 'ed0d6990-b32a-4b32-8bf6-39bd20078643',
    profilePicture: null,
    username: 'Shanthi',
    groupRoles: ['groupManager'],
    globalRoles: [],
    email: 'shanthitestemail@mailinator.com',
    defaultIdentity: {
      __typename: 'Identity',
      identifier: '0000-0002-2473-4784',
      email: null,
      type: 'orcid',
      aff: '',
      id: '7b03f794-ed3c-4dac-933d-a6616b3d70c2',
    },
    isOnline: true,
    teams: [],
  },
}

export default {
  title: 'Menu/MenuBar',
  component: Menu,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A34" />
      ),
    },
  },
}
