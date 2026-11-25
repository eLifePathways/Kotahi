import type { ReactNode } from 'react'
import {
  ArrowUpOutlined,
  MenuFoldOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'

import CommandButton from './CommandButton'
import {
  canWrapInBlockQuote,
  isBlockQuoteActive,
  wrapInBlockQuote,
} from '../features/blockQuote'
import {
  canWrapInList,
  isBulletListActive,
  isOrderedListActive,
  joinUp,
  lift,
  wrapInBulletList,
  wrapInOrderedList,
} from '../features/lists'

export const BulletListButton = (): ReactNode => (
  <CommandButton
    command={wrapInBulletList}
    icon={<UnorderedListOutlined />}
    isActive={isBulletListActive}
    isEnabled={canWrapInList}
    title="Bullet list"
  />
)

export const OrderedListButton = (): ReactNode => (
  <CommandButton
    command={wrapInOrderedList}
    icon={<OrderedListOutlined />}
    isActive={isOrderedListActive}
    isEnabled={canWrapInList}
    title="Numbered list"
  />
)

export const LiftButton = (): ReactNode => (
  <CommandButton
    command={lift}
    icon={<MenuFoldOutlined />}
    title="Lift out of enclosing block"
  />
)

export const JoinUpButton = (): ReactNode => (
  <CommandButton
    command={joinUp}
    icon={<ArrowUpOutlined />}
    title="Join with above block"
  />
)

export const BlockQuoteButton = (): ReactNode => (
  <CommandButton
    command={wrapInBlockQuote}
    isActive={isBlockQuoteActive}
    isEnabled={canWrapInBlockQuote}
    label="❝"
    title="Block quote"
  />
)
