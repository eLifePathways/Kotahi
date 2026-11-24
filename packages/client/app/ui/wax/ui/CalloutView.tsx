import { useState, type ReactNode } from 'react'
import { Checkbox } from 'antd'
import { sanitize } from 'isomorphic-dompurify'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import Button from '../../shared/Button'
import ButtonGroup from '../../shared/ButtonGroup'
import Modal from '../../shared/Modal'
import {
  findCalloutNodes,
  findReferenceNodeOptions,
  findReferenceNodes,
  updateCallout,
  type CalloutItem,
} from '../features/callout'
import type { NodeViewProps } from '../editor'
import { useReferenceServices } from './ReferenceServices'

const Callout = styled.span`
  color: ${th('colorPrimary')};
  cursor: pointer;
`

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
  max-height: ${grid(80)};
  overflow-y: auto;
`

const Hint = styled.p`
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
`

type ReferenceOption = { id: string; formattedCitation?: string }

const CalloutView = ({
  node,
  view,
  getPos,
  selected,
}: NodeViewProps): ReactNode => {
  const services = useReferenceServices()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CalloutItem[]>(
    node.attrs.citationItems ?? [],
  )
  const [loading, setLoading] = useState(false)
  const text: string = node.attrs.citationCalloutText || '[?]'
  const [wasSelected, setWasSelected] = useState(false)

  if (selected !== wasSelected) {
    setWasSelected(selected)
    if (selected) setOpen(true)
  }

  const isOpen = !services.readOnly && open

  const options = isOpen
    ? (findReferenceNodeOptions(view.state) as ReferenceOption[])
    : []

  const toggle = (id: string): void =>
    setItems(prev =>
      prev.some(i => i.id === id)
        ? prev.filter(i => i.id !== id)
        : [...prev, { id }],
    )

  const close = (): void => {
    setOpen(false)
    view.focus()
  }

  const apply = async (): Promise<void> => {
    const pos = getPos()
    if (pos === undefined) return
    setLoading(true)

    const valid = items.filter(i => options.some(o => o.id === i.id))
    updateCallout(pos, valid)(view.state, view.dispatch)

    if (services.updateCallout) {
      const { calloutTexts, orderedReferenceIds } =
        await services.updateCallout(
          findReferenceNodes(view.state),
          findCalloutNodes(view.state),
        )

      const ordered = [...valid].sort(
        (a, b) =>
          orderedReferenceIds.indexOf(a.id) - orderedReferenceIds.indexOf(b.id),
      )

      const next = calloutTexts.find(c => c.id === node.attrs.id)
      const current = getPos()

      if (next && next.text !== text && current !== undefined)
        updateCallout(current, ordered, next.text)(view.state, view.dispatch)
    }

    setLoading(false)
    close()
  }

  return (
    <>
      <Callout onClick={(): void => setOpen(true)} role="button" tabIndex={-1}>
        {text}
      </Callout>
      <Modal
        footer={null}
        onCancel={close}
        open={isOpen}
        title="Add or edit reference callouts"
        width={800}
      >
        <Hint>Only structured and valid references are listed.</Hint>
        <Options>
          {options.map(option => (
            <Checkbox
              checked={items.some(i => i.id === option.id)}
              key={option.id}
              onChange={(): void => toggle(option.id)}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: sanitize(option.formattedCitation ?? ''),
                }}
              />
            </Checkbox>
          ))}
        </Options>
        <Modal.footer>
          <ButtonGroup justify="right">
            <Button onClick={close} size="small">
              Cancel
            </Button>
            <Button
              disabled={items.length === 0 || loading}
              loading={loading}
              onClick={apply}
              size="small"
              type="primary"
            >
              Apply
            </Button>
          </ButtonGroup>
        </Modal.footer>
      </Modal>
    </>
  )
}

export default CalloutView
