import styled from 'styled-components'

import preview from '../../.storybook/preview'
import Layout from '../../app/ui/base/Layout'

const Left = styled.div`
  color: white;
  background-color: forestgreen;
  width: 300px;

  display: flex;
  align-items: center;
  justify-content: center;
`

const Right = styled.div`
  background-color: silver;

  display: flex;
  align-items: center;
  justify-content: center;
`

const meta = preview.meta({
  component: Layout,
})

export const Base = meta.story({
  // drop storybook's default padding for this story
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    return (
      <Layout converting={false}>
        <Left>Sidebar</Left>
        <Right>Main</Right>
      </Layout>
    )
  },
})
