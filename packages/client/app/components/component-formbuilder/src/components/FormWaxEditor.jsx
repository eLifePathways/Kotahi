/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* eslint-disable new-cap */
/* eslint-disable jsx-a11y/no-autofocus */

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import yjsConfig from '../../../wax-collab/src/config/yjsConfig'
import SimpleWaxEditorLayout from '../../../wax-collab/src/layout/SimpleWaxEditorLayout'
import simpleWaxEditorConfig from '../../../wax-collab/src/config/SimpleWaxEditorConfig'

const FormWaxEditor = ({
  value = '',
  validationStatus,
  readonly = false,
  autoFocus = false,
  // onBlur,
  onChange = () => {},
  placeholder = '',
  spellCheck = false,
  'data-testid': dataTestid,
  wsProvider,
  ydoc,
  name,
  ...rest
}) => {
  const [config, setConfig] = useState(simpleWaxEditorConfig())

  useEffect(() => {
    setConfig(
      yjsConfig(config, {
        wsProvider,
        ydoc,
        yjsType: name,
      }),
    )
  }, [name, wsProvider?.roomname, ydoc?.guid])

  return (
    <div className={validationStatus}>
      <Wax
        autoFocus={autoFocus}
        browserSpellCheck={spellCheck}
        config={config}
        layout={SimpleWaxEditorLayout(readonly, dataTestid)}
        onChange={!ydoc && onChange}
        placeholder={placeholder}
        readonly={readonly}
        value={!ydoc && value}
        {...rest}
      />
    </div>
  )
}

FormWaxEditor.propTypes = {
  /** editor content HTML */
  value: PropTypes.string,
  /** either undefined or 'error' to highlight with error color */
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  /** Should this element be given focus on initial rendering? */
  autoFocus: PropTypes.bool,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  /** Should enable browser's native spellcheck? */
  spellCheck: PropTypes.bool,
}

export default FormWaxEditor
