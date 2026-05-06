import styled, { css } from 'styled-components'
import Messages from '../../app/components/component-chat/src/Messages/Messages'
import ChatInput from '../../app/components/component-chat/src/SuperChatInput/SuperChatInput'
import DesignEmbed from '../common/utils'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import { JournalProvider } from '../../app/components/xpub-journal'
import { ConfigProvider } from '../../app/components/config/src'
import journal from '../../config/journal'
import config from '../../config/sampleConfigFormData'

const MessageContainer = styled.section`
  /* stylelint-disable-next-line color-function-notation */
  background: rgb(255, 255, 255);
  display: block;
  min-width: 100%;
  ${props =>
    props.positionProps
      ? css`
          display: block;
          min-width: 100%;
          min-height: 1000px;
          position: relative;
        `
      : css`
          min-height: 650px;
        `};
  position: relative;
`

const ChatInputContainer = styled.div`
  bottom: 0;
  display: block;
  min-width: 100%;
  ${props =>
    props.positionProps
      ? css`
          bottom: 0;
          min-width: 100%;
          position: absolute;
          display: block;
        `
      : css``};
  position: absolute;
`

const MessagesWrapper = styled.div`
  #messages {
    min-height: 400px;
  }

  a {
    justify-content: start;
    left: unset;
    right: 0;
  }
`

export const Base = args => (
  <XpubProvider>
    <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
      <ConfigProvider config={config}>
        <MessageContainer {...args}>
          <>
            {args.figmaEmbedLink && (
              <>
                <h2 style={{ color: '#333333' }}>Design</h2>
                <iframe
                  allowFullScreen
                  height={350}
                  src={args.figmaEmbedLink}
                  style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
                  title="figma embed"
                  width="100%"
                />
                <h2 style={{ color: '#333333' }}>Component</h2>
              </>
            )}

            <MessagesWrapper {...args}>
              <Messages {...args} />
            </MessagesWrapper>

            <ChatInputContainer {...args}>
              <ChatInput {...args} />
            </ChatInputContainer>
          </>
        </MessageContainer>
      </ConfigProvider>
    </JournalProvider>
  </XpubProvider>
)

export const EmptyAuthorChat = Base.bind()
export const AdminEditorChat = Base.bind()
export const EmptyAdminEditorChat = Base.bind()

const authorProps = {
  channelId: '8542101c-fc13-4d3f-881f-67243beaf83a',
  networkOnline: true,
  websocketConnection: 'connected',
  queryData: {
    loading: false,
    data: {
      messages: {
        __typename: 'MessagesRelay',
        edges: [
          {
            __typename: 'Message',
            id: '40a5a27b-7e49-44e4-af52-f5ff303cec0e',
            content: 'Hey there, this is a test message',
            created: '2022-01-06T18:48:26.857Z',
            updated: '2022-01-06T18:48:26.857Z',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Kotahi Author',
              profilePicture: null,
              isOnline: null,
            },
          },
        ],
        pageInfo: {
          __typename: 'PageInfo',
          startCursor: 'b52bfcee-768b-4a6b-9216-bf32fd943757',
          hasPreviousPage: false,
        },
      },
    },
    error: undefined,
    currentUser: {
      __typename: 'User',
      id: '20ca2a8d-d78e-4260-baed-86369992353f',
      profilePicture: null,
      username: 'Kotahi Dev',
      groupRoles: ['groupManager'],
      globalRoles: [],
      email: 'shanthitestemail@maiiinator.com',
      defaultIdentity: {
        __typename: 'Identity',
        identifier: '0000-0002-2473-4784',
        email: null,
        type: 'orcid',
        aff: '',
        id: '661c6b4f-5b5b-4ef0-aa4e-7d7b5bb38628',
      },
      isOnline: null,
      teams: [
        {
          __typename: 'Team',
          id: '0e7766d4-350b-4179-88b4-3eefea1f884e',
          manuscript: {
            __typename: 'Manuscript',
            id: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
            status: 'new',
          },
          members: [
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '20ca2a8d-d78e-4260-baed-86369992353f',
              },
            },
          ],
        },
      ],
    },
  },
}

const adminEditorProps = {
  positionProps: 'absolute',
  chatRoomId: '8542101c-fc13-4d3f-881f-67243beaf83a',
  channelId: '0b3147d5-5b71-4b9b-aeef-b8e8af86b4ce',
  networkOnline: true,
  websocketConnection: 'connected',
  queryData: {
    loading: false,
    data: {
      messages: {
        __typename: 'MessagesRelay',
        edges: [
          {
            __typename: 'Message',
            id: '40a5a27b-7e49-44e4-af52-f5ff303cec0e',
            content: 'Hey there, this is a test message',
            created: '2022-01-06T18:48:26.857Z',
            updated: '2022-01-06T18:48:26.857Z',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Kotahi Admin/Editor',
              profilePicture: null,
              isOnline: null,
            },
          },
        ],
        pageInfo: {
          __typename: 'PageInfo',
          startCursor: 'b52bfcee-768b-4a6b-9216-bf32fd943757',
          hasPreviousPage: false,
        },
      },
    },
    error: undefined,
    currentUser: {
      __typename: 'User',
      id: '20ca2a8d-d78e-4260-baed-86369992353f',
      profilePicture: null,
      username: 'Kotahi Dev',
      groupRoles: ['groupManager'],
      globalRoles: [],
      email: 'shanthitestemail@maiiinator.com',
      defaultIdentity: {
        __typename: 'Identity',
        identifier: '0000-0002-2473-4784',
        email: null,
        type: 'orcid',
        aff: '',
        id: '661c6b4f-5b5b-4ef0-aa4e-7d7b5bb38628',
      },
      isOnline: null,
      teams: [
        {
          __typename: 'Team',
          id: '0e7766d4-350b-4179-88b4-3eefea1f884e',
          manuscript: {
            __typename: 'Manuscript',
            id: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
            status: 'new',
          },
          members: [
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '20ca2a8d-d78e-4260-baed-86369992353f',
              },
            },
          ],
        },
      ],
    },
  },
}

const emptyAuthorProps = {
  positionProps: 'absolute',
  chatRoomId: '8542101c-fc13-4d3f-881f-67243beaf83a',
  channelId: '8542101c-fc13-4d3f-881f-67243beaf83a',
  networkOnline: true,
  websocketConnection: 'connected',
  queryData: {
    loading: false,
    data: {
      messages: {
        __typename: 'MessagesRelay',
        edges: [],
        pageInfo: {
          __typename: 'PageInfo',
          startCursor: 'b52bfcee-768b-4a6b-9216-bf32fd943757',
          hasPreviousPage: false,
        },
      },
    },
    error: undefined,
    currentUser: {
      __typename: 'User',
      id: '20ca2a8d-d78e-4260-baed-86369992353f',
      profilePicture: null,
      username: 'Kotahi Dev',
      groupRoles: ['groupManager'],
      globalRoles: [],
      email: 'shanthitestemail@maiiinator.com',
      defaultIdentity: {
        __typename: 'Identity',
        identifier: '0000-0002-2473-4784',
        email: null,
        type: 'orcid',
        aff: '',
        id: '661c6b4f-5b5b-4ef0-aa4e-7d7b5bb38628',
      },
      isOnline: null,
      teams: [
        {
          __typename: 'Team',
          id: '0e7766d4-350b-4179-88b4-3eefea1f884e',
          manuscript: {
            __typename: 'Manuscript',
            id: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
            status: 'new',
          },
          members: [
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '20ca2a8d-d78e-4260-baed-86369992353f',
              },
            },
          ],
        },
      ],
    },
  },
}

const emptyAdminEditorProps = {
  positionProps: 'absolute',
  chatRoomId: '8542101c-fc13-4d3f-881f-67243beaf83a',
  channelId: '8542101c-fc13-4d3f-881f-67243beaf83a',
  networkOnline: true,
  websocketConnection: 'connected',
  queryData: {
    loading: false,
    data: {
      messages: {
        __typename: 'MessagesRelay',
        edges: [],
        pageInfo: {
          __typename: 'PageInfo',
          startCursor: 'b52bfcee-768b-4a6b-9216-bf32fd943757',
          hasPreviousPage: false,
        },
      },
    },
    error: undefined,
    currentUser: {
      __typename: 'User',
      id: '20ca2a8d-d78e-4260-baed-86369992353f',
      profilePicture: null,
      username: 'Kotahi Dev',
      groupRoles: ['groupManager'],
      globalRoles: [],
      email: 'shanthitestemail@maiiinator.com',
      defaultIdentity: {
        __typename: 'Identity',
        identifier: '0000-0002-2473-4784',
        email: null,
        type: 'orcid',
        aff: '',
        id: '661c6b4f-5b5b-4ef0-aa4e-7d7b5bb38628',
      },
      isOnline: null,
      teams: [
        {
          __typename: 'Team',
          id: '0e7766d4-350b-4179-88b4-3eefea1f884e',
          manuscript: {
            __typename: 'Manuscript',
            id: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
            status: 'new',
          },
          members: [
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '20ca2a8d-d78e-4260-baed-86369992353f',
              },
            },
          ],
        },
      ],
    },
  },
}

Base.args = authorProps

EmptyAdminEditorChat.args = {
  ...emptyAdminEditorProps,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1502%253A12',
}

EmptyAuthorChat.args = {
  ...emptyAuthorProps,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1502%253A21',
}

AdminEditorChat.args = {
  ...adminEditorProps,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1502%253A6',
}

export default {
  title: 'Chat/Chat',
  component: MessageContainer,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1502%253A18" />
      ),
    },
  },
  argTypes: {},
}
