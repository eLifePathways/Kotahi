import React, { useContext, useMemo } from 'react'
import styled, { css } from 'styled-components'
import { wrapIn } from 'prosemirror-commands'
import { uuid } from '@coko/client'
import { liftTarget } from 'prosemirror-transform'
import MenuButton from '../ui/MenuButton'
import { WaxContext } from '../../WaxContext'
import { ApplicationContext } from '../../ApplicationContext'

const activeStyles = css`
  pointer-events: none;
`

const GroupName = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
  text-transform: uppercase;
`

const OENToolWrapper = styled.div`
  display: flex;
  margin-bottom: 4px;
`

const Box = styled.div`
  background: #bfc4cd;
  border-radius: 4px;
  height: 22px;
  position: relative;
  right: 3px;
  top: 3px;
  width: 22px;
  z-index: 999;
`

const StyledButton = styled(MenuButton)`
  border-radius: 4px;
  left: -33px;
  margin-left: 4px;
  padding-left: 25px;
  position: relative;

  ${props => props.active && activeStyles}
`

const OENToolGroup = ({ item }) => {
  const { app } = useContext(ApplicationContext)
  const {
    pmViews: { main },
    activeView,
    activeViewId,
  } = useContext(WaxContext)

  const { state } = main
  const isEditable = main.props.editable(editable => {
    return editable
  })
  let isDisabled = !item.select(state, activeViewId, activeView)
  if (!isEditable) isDisabled = true

  const OENToolsConfig = app.config.get('config.OENContainersService')

  const containersActive = item.active(main.state, OENToolsConfig)

  return useMemo(
    () => (
      <>
        {OENToolsConfig.map(groupTool => {
          return (
            <div key={uuid()}>
              <GroupName key={uuid()}>{groupTool.groupHeader} </GroupName>
              {groupTool.items.map(tool => (
                <OENToolWrapper key={uuid()}>
                  <Box key={uuid()} />
                  <StyledButton
                    active={containersActive[tool.className] || false}
                    disabled={isDisabled}
                    key={uuid()}
                    label={tool.displayName}
                    /* eslint-disable-next-line consistent-return */
                    onMouseDown={() => {
                      const { from, to } = main.state.selection
                      let isInOenContainer = false

                      main.state.doc.nodesBetween(from, to, node => {
                        if (
                          node.type.name === 'oen_container' ||
                          node.type.name === 'oen_aside'
                        ) {
                          isInOenContainer = true
                        }
                      })

                      if (isInOenContainer) {
                        const range = main.state.selection.$from.blockRange(
                          main.state.selection.$to,
                        )
                        const target = range && liftTarget(range)
                        if (target == null) return false
                        main.dispatch(main.state.tr.lift(range, target))
                      }
                      const node = tool.isSection
                        ? 'oen_section'
                        : 'oen_container'

                      wrapIn(main.state.config.schema.nodes[node], {
                        class: tool.className,
                        id: uuid(),
                      })(main.state, main.dispatch)

                      setTimeout(() => {
                        main.focus()
                      })
                    }}
                    title={tool.displayName}
                  />
                </OENToolWrapper>
              ))}
            </div>
          )
        })}
      </>
    ),
    [isDisabled, containersActive],
  )
}

export default OENToolGroup
