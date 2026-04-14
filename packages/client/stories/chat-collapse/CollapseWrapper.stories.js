import React from 'react'
import ChatCollapse from '../../app/components/shared/ChatCollapse'
import DesignEmbed from '../common/utils'

export const Base = args => (
  <ChatCollapse defaultWidth={300}>
    <p>hello</p>
  </ChatCollapse>
)

export default {
  title: 'Shared/CollapseWrapper',
  component: ChatCollapse,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A28" />
      ),
    },
  },
}
