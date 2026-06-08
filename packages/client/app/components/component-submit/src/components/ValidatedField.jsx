/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import React from 'react'
import { Field, FastField, useFormikContext } from 'formik'
import { get } from 'lodash'

// Based on https://github.com/jaredpalmer/formik/issues/146#issuecomment-474775723
const useFocusOnError = ({ fieldRef, name }) => {
  const formik = useFormikContext()
  const prevSubmitCountRef = React.useRef(formik.submitCount)
  let firstErrorKey = Object.keys(formik.errors)[0]
  // If the error is in a nested object, we need to look deeper
  // e.g. errors = { submission: { name: 'error' } }
  const nestedError = formik.errors[firstErrorKey]

  if (nestedError !== null && typeof nestedError === 'object') {
    firstErrorKey = `${firstErrorKey}.${Object.keys(nestedError)[0]}` // e.g. submission.name
  }

  React.useEffect(() => {
    if (prevSubmitCountRef.current !== formik.submitCount && !formik.isValid) {
      if (fieldRef.current && firstErrorKey === name) {
        fieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
        fieldRef.current.focus({ preventScroll: false })
      }
    }

    prevSubmitCountRef.current = formik.submitCount
  }, [formik.submitCount, formik.isValid, firstErrorKey])
}

/** Creates a field within a Formik form, that can perform validation.
 * If you want to be able to change the field props on the fly, set
 * shouldAllowFieldSpecChanges to true.
 */
const ValidatedField = ({
  component: Component,
  shouldAllowFieldSpecChanges,
  ...props
}) => {
  const fieldRef = React.useRef()
  const { name } = props
  useFocusOnError({ fieldRef, name })

  const FormikComponent = shouldAllowFieldSpecChanges ? Field : FastField

  return (
    <FormikComponent {...props}>
      {({ form: { errors, touched }, field }) => {
        let validationStatus
        if (get(touched, name)) validationStatus = 'success'
        if (get(touched, name) && get(errors, name)) validationStatus = 'error'

        return (
          <div ref={fieldRef}>
            <Component
              {...field}
              {...props}
              validationStatus={validationStatus}
            />
          </div>
        )
      }}
    </FormikComponent>
  )
}

export default ValidatedField
