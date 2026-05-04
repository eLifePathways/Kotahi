import ThreadedDiscussion from '../../app/components/component-formbuilder/src/components/builderComponents/ThreadedDiscussion/ThreadedDiscussion'
import { JournalProvider } from '../../app/components/xpub-journal/src'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import { ConfigProvider } from '../../app/components/config/src'
import journal from '../../config/journal'
import config from '../../config/sampleConfigFormData'
import DesignEmbed from '../common/utils'

export const Base = args => (
  <XpubProvider>
    <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
      <ConfigProvider config={config}>
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
          <ThreadedDiscussion {...args} />
        </>
      </ConfigProvider>
    </JournalProvider>
  </XpubProvider>
)

Base.args = {
  threadedDiscussionProps: {
    threadedDiscussion: {
      updated: 1662548479000,
      userCanAddComment: true,
      userCanEditOwnComment: false,
      userCanEditAnyComment: false,
      threads: [
        {
          id: 'bf270109-924a-4ab3-94c0-dc7243fe2812',
          created: 1662548479000,
          updated: 1662548479000,
          comments: [
            {
              id: '9475b97e-8da1-4d80-93a1-52a92fe406bf',
              created: 1662548479000,
              updated: 1662548479000,
              commentVersions: [
                {
                  comment:
                    '<p>lLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
                  author: {
                    __typename: 'User',
                    id: '20ca2a8d-d78e-4260-baed-86369992353f',
                    username: 'Kotahi Author',
                    profilePicture: null,
                    isOnline: null,
                  },
                },
              ],
              pendingComment: null,
            },
            {
              id: '6b92ca7a-c729-4952-8c3e-db9a4351492e',
              created: 1662548479000,
              updated: 1662548479000,
              commentVersions: [
                {
                  comment:
                    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>',
                  author: {
                    __typename: 'User',
                    id: '20ca2a8d-d78e-4260-baed-86369992353f',
                    username: 'Kotahi Author',
                    profilePicture: null,
                    isOnline: null,
                  },
                },
              ],
              pendingComment: null,
            },
            {
              id: 'c43b9ef5-e7f7-49da-91f0-a6de208c7dc5',
              created: 1662548479000,
              updated: 1662548479000,
              commentVersions: [
                {
                  comment:
                    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>',
                  author: {
                    __typename: 'User',
                    id: '20ca2a8d-d78e-4260-baed-86369992353f',
                    username: 'Kotahi Author',
                    profilePicture: null,
                    isOnline: null,
                  },
                },
              ],
              pendingComment: null,
            },
          ],
        },
      ],
    },
    currentUser: {
      __typename: 'User',
      id: '92f99a84-fc8b-4f94-bc9e-10bb3f7c3902',
      username: 'Harriet Handling-Editor',
      groupRoles: ['groupManager'],
      globalRoles: [],
      isOnline: null,
    },
    firstVersionManuscriptId: '8f3ae437-58e9-4946-869f-737da08bc3a2',
    updatePendingComment: () => {},
    completeComment: () => {},
    deletePendingComment: () => {},
    userCanAddThread: true,
    commentsToPublish: [],
    setShouldPublishComment: () => {},
    shouldRenderSubmitButton: true,
  },
  autoFocus: true,
  placeholder: 'Add your feedback here',
  onChange: () => {},
}

export default {
  title: 'Threaded Discussion/ThreadedDiscussion',
  component: ThreadedDiscussion,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A115" />
      ),
    },
  },
}
