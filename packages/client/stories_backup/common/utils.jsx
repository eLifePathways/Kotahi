import {
  Title,
  Primary,
  ArgsTable,
  Stories,
  /* eslint-disable-next-line import/no-unresolved */
} from '@coko/storybook/node_modules/@storybook/addon-docs/blocks'
import PropTypes from 'prop-types'

const DesignEmbed = ({ figmaEmbedLink }) => (
  <>
    <Title />
    <h2>Design</h2>
    <iframe
      allowFullScreen
      height={450}
      src={figmaEmbedLink}
      style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
      title="figma embed"
      width={800}
    />
    <h2>Component</h2>
    <Primary />
    <ArgsTable story="^" />
    <Stories />
  </>
)

DesignEmbed.propTypes = {
  figmaEmbedLink: PropTypes.string.isRequired,
}

export default DesignEmbed
