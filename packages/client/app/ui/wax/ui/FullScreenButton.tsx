import type { ReactNode } from 'react'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'

import Button from '../../shared/Button'

type FullScreenButtonProps = {
  fullScreen: boolean
  onChange: (fullScreen: boolean) => void
}

const FullScreenButton = ({
  fullScreen,
  onChange,
}: FullScreenButtonProps): ReactNode => (
  <Button
    aria-label={fullScreen ? 'Exit full screen' : 'Full screen'}
    aria-pressed={fullScreen}
    icon={fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
    onClick={(): void => onChange(!fullScreen)}
    onMouseDown={(event): void => event.preventDefault()}
    size="small"
    title={fullScreen ? 'Exit full screen' : 'Full screen'}
    type="text"
  />
)

export default FullScreenButton
