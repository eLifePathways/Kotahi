import PropTypes from 'prop-types'
import { set } from 'lodash'
import { hasValue } from '../../shared/htmlUtils'
import FormWaxEditor from '../component-formbuilder/src/components/FormWaxEditor'

const RichTextEditor = ({
  validationStatus,
  setTouched,
  onChange,
  ...rest
}) => {
  return (
    <FormWaxEditor
      validationStatus={validationStatus}
      {...rest}
      onBlur={() => {
        setTouched(set({}, rest.name, true))
      }}
      onChange={val => {
        setTouched(set({}, rest.name, true))
        const cleanedVal = hasValue(val) ? val : ''
        onChange(cleanedVal)
      }}
    />
  )
}

RichTextEditor.propTypes = {
  validationStatus: PropTypes.string,
  setTouched: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default RichTextEditor
