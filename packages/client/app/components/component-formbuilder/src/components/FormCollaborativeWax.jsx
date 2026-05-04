/* eslint-disable react/prop-types, react/display-name */

import CollaborativeWax from '../../../wax-collab/src/CollaborativeWax'

const FormCollaborateComponent =
  component =>
  /* eslint-disable-next-line no-unused-vars */
  ({ onChange, collaborativeObject, ...rest }) => {
    const { identifier } = collaborativeObject

    return (
      <CollaborativeWax
        component={component}
        editorMode={null}
        identifier={identifier}
        {...rest}
        collaborativeObject={collaborativeObject}
        onChange={() => {}}
      />
    )
  }

export default FormCollaborateComponent
