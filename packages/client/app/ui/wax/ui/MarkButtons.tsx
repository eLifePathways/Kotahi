import type { ReactNode } from 'react'
import {
  BoldOutlined,
  CodeOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from '@ant-design/icons'

import CommandButton from './CommandButton'
import { canToggleCode, isCodeActive, toggleCode } from '../features/code'
import {
  canToggleEmphasis,
  isEmphasisActive,
  toggleEmphasis,
} from '../features/emphasis'
import {
  canToggleSmallCaps,
  isSmallCapsActive,
  toggleSmallCaps,
} from '../features/smallCaps'
import {
  canToggleStrikethrough,
  isStrikethroughActive,
  toggleStrikethrough,
} from '../features/strikethrough'
import {
  canToggleStrong,
  isStrongActive,
  toggleStrong,
} from '../features/strong'
import {
  canToggleSubscript,
  isSubscriptActive,
  toggleSubscript,
} from '../features/subscript'
import {
  canToggleSuperscript,
  isSuperscriptActive,
  toggleSuperscript,
} from '../features/superscript'
import {
  canToggleUnderline,
  isUnderlineActive,
  toggleUnderline,
} from '../features/underline'

export const StrongButton = (): ReactNode => (
  <CommandButton
    command={toggleStrong}
    icon={<BoldOutlined />}
    isActive={isStrongActive}
    isEnabled={canToggleStrong}
    title="Bold"
  />
)

export const EmphasisButton = (): ReactNode => (
  <CommandButton
    command={toggleEmphasis}
    icon={<ItalicOutlined />}
    isActive={isEmphasisActive}
    isEnabled={canToggleEmphasis}
    title="Italic"
  />
)

export const UnderlineButton = (): ReactNode => (
  <CommandButton
    command={toggleUnderline}
    icon={<UnderlineOutlined />}
    isActive={isUnderlineActive}
    isEnabled={canToggleUnderline}
    title="Underline"
  />
)

export const StrikethroughButton = (): ReactNode => (
  <CommandButton
    command={toggleStrikethrough}
    icon={<StrikethroughOutlined />}
    isActive={isStrikethroughActive}
    isEnabled={canToggleStrikethrough}
    title="Strikethrough"
  />
)

export const CodeButton = (): ReactNode => (
  <CommandButton
    command={toggleCode}
    icon={<CodeOutlined />}
    isActive={isCodeActive}
    isEnabled={canToggleCode}
    title="Code"
  />
)

export const SubscriptButton = (): ReactNode => (
  <CommandButton
    command={toggleSubscript}
    isActive={isSubscriptActive}
    isEnabled={canToggleSubscript}
    label="x₂"
    title="Subscript"
  />
)

export const SuperscriptButton = (): ReactNode => (
  <CommandButton
    command={toggleSuperscript}
    isActive={isSuperscriptActive}
    isEnabled={canToggleSuperscript}
    label="x²"
    title="Superscript"
  />
)

export const SmallCapsButton = (): ReactNode => (
  <CommandButton
    command={toggleSmallCaps}
    isActive={isSmallCapsActive}
    isEnabled={canToggleSmallCaps}
    label="Aᴀ"
    title="Small caps"
  />
)
