import DashboardLayout from '../../app/components/component-dashboard/src/components/DashboardLayout'
import { JournalProvider } from '../../app/components/xpub-journal/src'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import { ConfigProvider } from '../../app/components/config/src'
import journal from '../../config/journal'
import config from '../../config/sampleConfigFormData'
import DesignEmbed from '../common/utils'

const urlFrag = '/kotahi'

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
          <DashboardLayout
            createNewTaskAlerts={null}
            urlFrag={urlFrag}
            {...args}
          />
        </>
      </ConfigProvider>
    </JournalProvider>
  </XpubProvider>
)

export default {
  title: 'Dashboard/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A2" />
      ),
    },
  },
  argTypes: {},
}
