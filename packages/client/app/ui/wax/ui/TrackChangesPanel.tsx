import type { ReactNode } from 'react'

import Button from '../../shared/Button'
import ButtonGroup from '../../shared/ButtonGroup'
import { useWax } from '../editor'
import {
  acceptChange,
  findTrackedChanges,
  rejectChange,
  type TrackedChange,
  type TrackPermissions,
} from '../features/trackChanges'
import {
  PanelEmpty,
  PanelHeading,
  PanelItem,
  PanelList,
  PanelMeta,
} from './Panel'
import selectRange from './selectRange'

const labels: Record<TrackedChange['type'], string> = {
  insertion: 'Inserted',
  deletion: 'Deleted',
  format_change: 'Formatted',
}

type TrackChangesPanelProps = {
  user: { username: string }
  permissions: TrackPermissions
  className?: string
}

const TrackChangesPanel = ({
  user,
  permissions,
  className,
}: TrackChangesPanelProps): ReactNode => {
  const view = useWax(s => s.view)
  const changes: TrackedChange[] = useWax(
    ({ state }) => (state ? findTrackedChanges(state) : []),
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  )
  const cursor: number = useWax(({ state }) => state?.selection.from ?? 0)

  const run = (change: TrackedChange, action: typeof acceptChange): void => {
    if (!view) return
    action(change, user, permissions)(view.state, view.dispatch)
    view.focus()
  }

  return (
    <PanelList aria-label="Changes" className={className} role="region">
      <PanelHeading>Changes</PanelHeading>
      {changes.length === 0 ? <PanelEmpty>No changes</PanelEmpty> : null}
      {changes.map(change => (
        <PanelItem
          active={cursor >= change.from && cursor <= change.to}
          key={`${change.type}-${change.id}-${change.from}`}
          label={`${labels[change.type]} by ${change.username}`}
          onSelect={(): void => selectRange(view, change.from, change.to)}
        >
          <PanelMeta>
            {labels[change.type]} by {change.username || 'Unknown'}
            {change.date ? ` · ${new Date(change.date).toLocaleString()}` : ''}
          </PanelMeta>
          <div>{change.text}</div>
          <ButtonGroup justify="right">
            <Button
              onClick={(event): void => {
                event.stopPropagation()
                run(change, rejectChange)
              }}
              size="small"
            >
              Reject
            </Button>
            <Button
              onClick={(event): void => {
                event.stopPropagation()
                run(change, acceptChange)
              }}
              size="small"
              type="primary"
            >
              Accept
            </Button>
          </ButtonGroup>
        </PanelItem>
      ))}
    </PanelList>
  )
}

export default TrackChangesPanel
