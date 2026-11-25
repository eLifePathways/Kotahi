import type { ReactNode } from 'react'
import { RedoOutlined, UndoOutlined } from '@ant-design/icons'

import CommandButton from './CommandButton'
import { canRedo, canUndo, redo, undo } from '../features/history'

export const UndoButton = (): ReactNode => (
  <CommandButton
    command={undo}
    icon={<UndoOutlined />}
    isEnabled={canUndo}
    title="Undo"
  />
)

export const RedoButton = (): ReactNode => (
  <CommandButton
    command={redo}
    icon={<RedoOutlined />}
    isEnabled={canRedo}
    title="Redo"
  />
)
