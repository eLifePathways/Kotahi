import type { ReactNode } from 'react'
import { redo, undo } from 'prosemirror-history'
import { RedoOutlined, UndoOutlined } from '@ant-design/icons'

import CommandButton from './CommandButton'

export const UndoButton = (): ReactNode => (
  <CommandButton command={undo} icon={<UndoOutlined />} title="Undo" />
)

export const RedoButton = (): ReactNode => (
  <CommandButton command={redo} icon={<RedoOutlined />} title="Redo" />
)
