import type { ReactNode } from 'react'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

import CommandButton from './CommandButton'
import {
  acceptTrackChanges,
  rejectTrackChanges,
  type TrackPermissions,
} from '../features/trackChanges'

type TrackChangesButtonsProps = {
  user: { username: string }
  permissions: TrackPermissions
}

const hasSelection = (state: { selection: { empty: boolean } }): boolean =>
  !state.selection.empty

export const AcceptChangesButton = ({
  user,
  permissions,
}: TrackChangesButtonsProps): ReactNode => (
  <CommandButton
    command={acceptTrackChanges(user, permissions)}
    icon={<CheckOutlined />}
    isEnabled={hasSelection}
    title="Accept changes in selection"
  />
)

export const RejectChangesButton = ({
  user,
  permissions,
}: TrackChangesButtonsProps): ReactNode => (
  <CommandButton
    command={rejectTrackChanges(user, permissions)}
    icon={<CloseOutlined />}
    isEnabled={hasSelection}
    title="Reject changes in selection"
  />
)
