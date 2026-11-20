/* eslint-disable react/prop-types */

import { useContext } from 'react'
import YjsContext from '../../../provider-yjs/YjsProvider'

import Spinner from '../../../../ui/shared/Spinner'

const FormCollaborateComponent = Component => {
  const FormCollaborativeField = ({
    // eslint-disable-next-line no-unused-vars
    onChange,
    collaborativeObject,
    setComments,
    ...rest
  }) => {
    const { identifier, currentUser } = collaborativeObject
    const { wsProvider, ydoc } = useContext(YjsContext)

    if (!wsProvider || !ydoc) return <Spinner fullpage />

    return (
      <Component
        identifier={identifier}
        {...rest}
        onChange={() => {}}
        setComments={setComments}
        user={currentUser}
        wsProvider={wsProvider}
        ydoc={ydoc}
      />
    )
  }

  return FormCollaborativeField
}

export default FormCollaborateComponent
