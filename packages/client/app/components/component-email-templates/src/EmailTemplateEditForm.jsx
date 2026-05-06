/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useEffect } from 'react'
import { emailTemplateInputFields } from '../../component-cms-manager/src/FormSettings'
import { Section } from '../../component-cms-manager/src/style'
import { useEmailTemplatesContext } from '../hooks/EmailTemplatesContext'
import { templateHasChanged } from '../misc/utils'
import { ActionButton } from '../../shared'
import { Footer, StyledEditorForm, StyledPage } from '../misc/styleds'
import EmailTemplateField from './EmailTemplateField'

const EmailTemplateEditForm = ({
  onSubmit,
  setFieldValue,
  setTouched,
  currentValues,
}) => {
  const { activeTemplate, autoSave, t, savedState, isDraft } =
    useEmailTemplatesContext()

  useEffect(() => {
    savedState.set('')
    return autoSave.flush
  }, [])

  const allowSave = templateHasChanged(activeTemplate.state, currentValues)

  const onDataChanged = (itemKey, value) => {
    /* eslint-disable-next-line no-unused-vars */
    const { created, updated, emailContent, id, ...rest } = activeTemplate.state

    const data = {
      ...rest,
      emailContent: {
        ...emailContent,
        [itemKey]: value,
      },
    }

    autoSave(id, data)
  }

  return (
    <StyledPage>
      <StyledEditorForm onSubmit={onSubmit}>
        {emailTemplateInputFields.map(item => {
          return (
            <Section
              flexGrow={item.flexGrow}
              key={item.name}
              style={item?.containerStyle || {}}
            >
              <EmailTemplateField
                currentValues={currentValues}
                item={item}
                onDataChanged={onDataChanged}
                setFieldValue={setFieldValue}
                setTouched={setTouched}
              />
            </Section>
          )
        })}
      </StyledEditorForm>
      <Footer>
        <ActionButton
          disabled={!allowSave}
          onClick={onSubmit}
          primary
          status={savedState.state}
          title={isDraft ? t('common.Save') : t('common.Update')}
          type="button"
        >
          {isDraft ? t('common.Save') : t('common.Update')}
        </ActionButton>
      </Footer>
    </StyledPage>
  )
}

export default EmailTemplateEditForm
