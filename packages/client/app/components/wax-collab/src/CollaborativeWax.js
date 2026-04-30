/* eslint-disable react/prop-types */

import { useContext } from 'react'
import YjsContext from '../../provider-yjs/YjsProvider'

import Editor from '.'

import { Spinner } from '../../shared'

const CollaborativeWax = ({
  editorMode,
  component,
  // user,
  collaborativeObject,
  // identifier,
  setComments,
  ...rest
}) => {
  const { currentUser } = collaborativeObject

  const { wsProvider, ydoc } = useContext(YjsContext)

  const Component = editorMode ? Editor[editorMode] : component

  if (!wsProvider || !ydoc) return <Spinner />

  return Component ? (
    <Component
      {...rest}
      setComments={setComments}
      user={currentUser}
      wsProvider={wsProvider}
      ydoc={ydoc}
    />
  ) : null
}

export default CollaborativeWax
