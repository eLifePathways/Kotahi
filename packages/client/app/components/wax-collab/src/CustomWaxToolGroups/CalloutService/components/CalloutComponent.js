/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-hooks/static-components */
/* eslint-disable react/prop-types */

import { useContext, useState, useEffect } from 'react'
import { WaxContext, ApplicationContext } from 'wax-prosemirror-core'
import { sanitize } from 'isomorphic-dompurify'
import Modal from '../../../../../component-modal/src/Modal'
import {
  findCalloutNodes,
  findReferenceNodes,
  findReferenceNodeOptions,
} from '../helpers'
import {
  Wrapper,
  CalloutOptionWrapper,
  PopUpWrapper,
  PopUpContent,
  Button,
  StatusBar,
  CloseButton,
  CloseButtonIcon,
} from './styles'

/* eslint-disable-next-line no-unused-vars */
const CalloutComponent = ({ node, view, getPos }) => {
  const context = useContext(WaxContext)

  const { activeView, pmViews, activeViewId } = context
  const { app } = useContext(ApplicationContext)

  const { state } = activeView
  const posFrom = pmViews[activeViewId].state.selection.from

  const calloutConfig = app.config._config.config.CalloutService

  const { updateCallout, readOnly } = calloutConfig
  const { id, citationItems, citationCalloutText } = node.attrs
  // console.log('callout node id', id)
  // console.log('citationItems', citationItems)
  // console.log('citationCalloutText', citationCalloutText)

  const referenceOptions = findReferenceNodeOptions(state)

  const [calloutText, setCalloutText] = useState(citationCalloutText || '[?]')
  const [items, setItems] = useState(citationItems)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Trigger popup based on selection pos
  useEffect(() => {
    setIsOpen(false)

    if (getPos() === posFrom) {
      setIsOpen(true)
    }
  }, [posFrom])

  const removeItem = itemToRemove => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemToRemove))
  }

  const sendToCiteProc = async () => {
    const references = findReferenceNodes(activeView.state)
    const callouts = findCalloutNodes(activeView.state)
    const response = await updateCallout(references, callouts)
    // console.log('response: ', response)
    return response
  }

  const getNodeWithId = calloutId => {
    // This returns a "reference" node with the refID from activeView
    let nodeFound

    activeView.state.doc.nodesBetween(getPos(), getPos() + 1, possibleNode => {
      if (
        possibleNode.type.name === 'callout' &&
        possibleNode.attrs.id === calloutId
      ) {
        nodeFound = possibleNode
      }
    })

    return nodeFound
  }

  const updateAttrs = filteredItems => {
    const { tr } = activeView.state
    const startPosition = getPos()
    // console.log('startPosition', startPosition)

    // Ensure node and startPosition are valid
    if (node && startPosition !== undefined) {
      tr.setNodeMarkup(
        startPosition,
        node.type,
        {
          ...node.attrs,
          citationItems: filteredItems,
          citationCalloutText: calloutText,
        },
        node.marks,
      )

      // Log transaction details
      // console.log('Transaction:', tr)

      // Dispatch transaction
      activeView.dispatch(tr.scrollIntoView())

      // Log node attributes after update to ensure changes
      // console.log(
      //   'Node attributes after update:',
      //   tr.doc.nodeAt(startPosition).attrs,
      // )
    } else {
      console.error('Invalid node or position:', node, startPosition)
    }

    activeView.focus()
  }

  const updateContent = (calloutId, text, reorderedItems) => {
    const { tr } = activeView.state
    const startPosition = getPos()
    // console.log('startPosition', startPosition)

    // console.log('Node content before update:', node.content)

    const thisNode = getNodeWithId(calloutId)

    if (thisNode) {
      const endPosition = startPosition + thisNode.content.size + 1

      // New content node
      const newNode = activeView.state.schema.nodes.callout.create(
        {
          ...node.attrs,
          citationItems: reorderedItems,
          citationCalloutText: text,
        },
        activeView.state.schema.text(text),
      )

      // Replace existing node with new node
      tr.replaceWith(startPosition, endPosition, newNode)

      // Dispatch transaction
      activeView.dispatch(tr.scrollIntoView())

      // console.log('Node content after update:', newNode.content)
      // console.log(
      //   'Node attributes after update:',
      //   tr.doc.nodeAt(startPosition).attrs,
      // )

      // Optionally focus the view to ensure it's active
      activeView.focus()
    }
  }

  const CalloutPopUp = () => {
    return (
      <PopUpWrapper>
        <div>
          <h4>
            Add/Edit Reference Callouts
            <p>Only structured and valid references are listed below</p>
          </h4>
          <PopUpContent>
            {referenceOptions.map(reference => {
              const itemExist = items.some(item => item.id === reference.id)
              const { formattedCitation } = reference
              return (
                <CalloutOptionWrapper
                  key={reference.id}
                  onClick={e => {
                    e.preventDefault()
                    if (itemExist) {
                      removeItem(reference.id)
                    } else {
                      setItems(items.concat({ id: reference.id }))
                    }
                  }}
                >
                  <input
                    checked={itemExist}
                    name={`reference-${reference.id}`}
                    onChange={e => {
                      e.preventDefault()
                    }}
                    type="checkbox"
                  />
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitize(formattedCitation),
                    }}
                  />
                </CalloutOptionWrapper>
              )
            })}
          </PopUpContent>
          <StatusBar>
            <Button
              disabled={items.length === 0 || loading} // This is now set to disabled if there are still versions to come in
              onClick={async e => {
                e.preventDefault()
                setLoading(true)

                const referenceOptionIds = referenceOptions.map(r => r.id)

                // Hacky fix for now incase some references are deleted from the reference list or changed to unstructured data
                const filteredItems = items.filter(item =>
                  referenceOptionIds.includes(item.id),
                )

                // console.log('referenceOptionIds', referenceOptionIds)
                // console.log('filteredItems', filteredItems)

                setItems(filteredItems)

                updateAttrs(filteredItems) // Updates only the attributes

                const { calloutTexts, orderedReferenceIds } =
                  await sendToCiteProc()

                const reorderedItems = filteredItems.sort((a, b) => {
                  return (
                    orderedReferenceIds.indexOf(a.id) -
                    orderedReferenceIds.indexOf(b.id)
                  )
                })

                // console.log('orderedReferenceIds', orderedReferenceIds)
                // console.log('reorderedItems', reorderedItems)
                // console.log(calloutTexts, id)
                const callout = calloutTexts.find(c => c.id === id)

                if (!callout) console.error('callout text not available!')

                if (callout && callout.text !== calloutText) {
                  setCalloutText(callout.text)
                  updateContent(callout.id, callout.text, reorderedItems) // TODO: update all callout nodes elegantly in future iterations based on config
                }

                setIsOpen(false)
                setLoading(false)
              }}
              primary
              type="primary"
            >
              {loading ? 'Applying...' : 'Apply'}
            </Button>
            <Button
              onClick={e => {
                e.preventDefault()
                setIsOpen(false)
              }}
              type="button"
            >
              Cancel
            </Button>
          </StatusBar>
        </div>
      </PopUpWrapper>
    )
  }

  return (
    <>
      <Wrapper
        onClick={() => {
          if (!readOnly) {
            // We get readOnly from the config –-if it is true, we're in the full wax editor.
            // Right now, we don't want the possibility of opening the modal in full wax editor
            // (though this may change going forward.)
            setIsOpen(true)
          }
        }}
      >
        <span>{calloutText}</span>
      </Wrapper>
      <Modal
        contentStyles={{
          margin: 'auto',
          width: '800px',
          minHeight: '480px',
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
        isOpen={isOpen}
      >
        <CalloutPopUp />
        <CloseButton
          onClick={e => {
            e.preventDefault()
            setIsOpen(false)
          }}
        >
          <CloseButtonIcon />
        </CloseButton>
      </Modal>
    </>
  )
}

export default CalloutComponent
