import ConfigManagerForm from '../../app/components/component-config-manager/src/ConfigManagerForm'
import DesignEmbed from '../common/utils'
import config from '../../config/sampleConfigFormData'

// To edit the config manager form UI schema visit - app/components/component-config-manager/src/ui/schema.js
export const Base = args => (
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

    <ConfigManagerForm {...args} />
  </>
)

export const Disabled = Base.bind()

// To edit the example config formData visit - config/sampleConfigFormData.js
Base.args = {
  configId: 'f9571fca-8acc-4308-8f03-3c2eda32ba2f',
  formData: config,
  updateConfig: () => null,
}

Disabled.args = {
  ...Base.args,
  disabled: true,
  figmaEmbedLink: '',
}
export default {
  title: 'ConfigManager/ConfigManagerForm',
  component: ConfigManagerForm,
  parameters: {
    docs: {
      page: () => <DesignEmbed figmaEmbedLink="" />,
    },
  },
}
