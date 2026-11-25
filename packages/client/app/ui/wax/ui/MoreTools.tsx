import type { ReactNode } from 'react'
import { Popover } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { grid } from '@coko/client'

import Button from '../../shared/Button'

const Tools = styled.div`
  display: flex;
  gap: ${grid(0.5)};
`

type MoreToolsProps = {
  children: ReactNode
  title?: string
}

const MoreTools = ({
  children,
  title = 'More tools',
}: MoreToolsProps): ReactNode => (
  <Popover content={<Tools>{children}</Tools>} trigger="click">
    <Button
      aria-label={title}
      icon={<EllipsisOutlined />}
      onMouseDown={(event): void => event.preventDefault()}
      size="small"
      title={title}
      type="text"
    />
  </Popover>
)

export default MoreTools
