/* eslint-disable react/prop-types */

/* eslint-disable jsx-a11y/no-autofocus */

import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import chatWaxEditorConfig from './ChatWaxEditorConfig'
import chatWaxEditorLayout from './ChatWaxEditorLayout'

const ChatWaxEditor = ({
  value,
  validationStatus,
  readonly,
  autoFocus,
  // onBlur,
  // onChange,
  placeholder,
  spellCheck,
  onEnterPress,
  editorRef,
  autoCompleteReducer,
  editorType,
  // ...rest
}) => {
  return (
    <div className={validationStatus}>
      <Wax
        autoFocus={autoFocus}
        browserSpellCheck={spellCheck}
        className={editorType}
        config={chatWaxEditorConfig({ onEnterPress, autoCompleteReducer })}
        debug={false}
        layout={chatWaxEditorLayout(readonly)}
        placeholder={placeholder}
        readonly={readonly}
        ref={editorRef}
        value={value}
      />
    </div>
  )
}

ChatWaxEditor.propTypes = {
  /** editor content HTML */
  value: PropTypes.string,
  /** either undefined or 'error' to highlight with error color */
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  /** Should this element be given focus on initial rendering? */
  autoFocus: PropTypes.bool,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  /** Should enable browser's native spellcheck? */
  spellCheck: PropTypes.bool,
}

ChatWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  onBlur: () => {},
  onChange: () => {},
  placeholder: '',
  spellCheck: false,
}

export default ChatWaxEditor
