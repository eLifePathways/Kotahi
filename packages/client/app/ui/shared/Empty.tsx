import styled from 'styled-components'
import { Empty as AntEmpty } from 'antd'
import { th } from '@coko/client'

const Empty = styled(AntEmpty)`
  color: ${th('colorText')};

  svg * {
    stroke: ${th('colorTextPlaceholder')};
  }

  svg ellipse {
    fill: ${th('colorBackgroundHue')};
    stroke: ${th('colorBackgroundHue')};
  }

  .ant-empty-description {
    color: ${th('colorText')};
  }
`

export default Empty
