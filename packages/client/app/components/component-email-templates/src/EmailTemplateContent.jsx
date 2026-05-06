import { Formik } from 'formik'
import { CmsWidthAndHeightContainer } from '../../component-cms-manager/src/style'
import EmailTemplateEditForm from './EmailTemplateEditForm'

import { getEmailContentFrom } from '../misc/utils'
import { useEmailTemplatesContext } from '../hooks/EmailTemplatesContext'
import { EditSection } from '../misc/styleds'

const EmailTemplateContent = () => {
  const { handleSubmit, handleValidate, activeTemplate } =
    useEmailTemplatesContext()

  const { id, emailContent } = activeTemplate.state
  const initialValues = getEmailContentFrom(emailContent)

  return (
    <EditSection key={id}>
      <CmsWidthAndHeightContainer>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validate={handleValidate}
        >
          {formikProps => {
            return (
              <EmailTemplateEditForm
                currentValues={formikProps.values}
                onSubmit={formikProps.handleSubmit}
                setFieldValue={formikProps.setFieldValue}
                setTouched={formikProps.setTouched}
              />
            )
          }}
        </Formik>
      </CmsWidthAndHeightContainer>
    </EditSection>
  )
}

export default EmailTemplateContent
