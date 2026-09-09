import { type ReactNode } from 'react'
import styled from 'styled-components'
import { Tabs as AntTabs, type TabsProps } from 'antd'
import { grid } from '@coko/client'

const StyledTabs = styled(AntTabs)`
  padding-left: ${grid(4)};
  padding-right: ${grid(4)};

  .ant-tabs-nav {
    user-select: none;
  }
`

type Props = Omit<TabsProps, 'type'>

const Tabs = (props: Props): ReactNode => {
  return <StyledTabs {...props} type="line" />
}

export default Tabs
