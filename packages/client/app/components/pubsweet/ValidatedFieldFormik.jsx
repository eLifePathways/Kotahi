/* eslint-disable react/prop-types, react/display-name */

import { compose, withHandlers } from 'recompose'
import { FastField } from 'formik'
import { get } from 'lodash'
import styled from 'styled-components'
import { th } from '@coko/client'

// TODO: pass ...props.input to children automatically?

const MessageWrapper = styled.div`
  display: flex;
  font-family: ${th('fontInterface')};
`

const Message = styled.div`
  &:not(:last-child) {
    margin-bottom: ${th('gridUnit')};
  }
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const ErrorMessage = styled(Message)`
  color: ${th('colorError')};
`

const ValidatedFieldComponent =
  ({ component: Component }) =>
  ({ form: { errors, touched }, input, ...extraProps }) => {
    let validationStatus
    if (get(touched, extraProps.name)) validationStatus = 'success'
    if (get(touched, extraProps.name) && get(errors, extraProps.name))
      validationStatus = 'error'

    return (
      <div>
        <Component
          {...extraProps}
          {...input}
          validationStatus={validationStatus}
        />

        {/* live region DOM node must be initially present for changes to be announced */}
        <MessageWrapper role="alert">
          {get(touched, extraProps.name) && get(errors, extraProps.name) && (
            <ErrorMessage>{get(errors, extraProps.name)}</ErrorMessage>
          )}
        </MessageWrapper>
      </div>
    )
  }

const FieldParseComponent = ({ FieldComponent, field, ...props }) => (
  <FieldComponent {...field} {...props} />
)

const ValidatedFieldFormik = ({ FieldComponent, ...rest }) => (
  <FastField
    {...rest}
    component={FieldParseComponent}
    FieldComponent={FieldComponent}
  />
)

export default compose(
  withHandlers({
    FieldComponent: ValidatedFieldComponent,
  }),
)(ValidatedFieldFormik)
