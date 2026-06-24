/* eslint-disable react/prop-types, react/display-name */
/* eslint-disable new-cap */

import { useContext } from 'react'
import Form from '@rjsf/core'
import styled from 'styled-components'
import { th } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { ConfigContext } from '../../config/src'
import journalSchema from './collection/ui/journalSchema' // Import the function that generates the schema and uiSchema

import {
  ActionButton,
  Container,
  HeadingWithAction,
  Heading,
  PaddedContent,
  SectionContent,
  WidthLimiter,
} from '../../shared'

const FieldWrapper = styled.div`
  display: flex;

  fieldset {
    width: 100%;
  }
`

const ActionButtonStyled = styled(ActionButton)`
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  font-size: ${th('fontSizeBaseSmall')};
  left: -2px;
  min-height: 5px;
  min-width: 60px;
  position: relative;
`

const FieldTemplate = t =>
  function (props) {
    const { classNames, description, children, label, id } = props

    const onCopy = () =>
      navigator.clipboard.writeText(`{{cmsLayout.publishConfig.${label}}}`)

    return (
      <div className={classNames}>
        <b>{description}</b>
        <FieldWrapper>
          {children}
          {id !== 'journalMetadata' && (
            <ActionButtonStyled onClick={onCopy} primary type="button">
              {t('cmsPage.metadata.copy')}
            </ActionButtonStyled>
          )}
        </FieldWrapper>
      </div>
    )
  }

const CmsMetadataPage = () => {
  const { t } = useTranslation()
  const config = useContext(ConfigContext)

  const { schema: journalSch, uiSchema: uiJournalSch } = journalSchema(t)

  return (
    <>
      <link
        crossOrigin="anonymous"
        href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css"
        integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu"
        rel="stylesheet"
      />
      <Container>
        <HeadingWithAction>
          <Heading>{t('leftMenu.Metadata')}</Heading>
        </HeadingWithAction>
        <WidthLimiter>
          <SectionContent>
            <PaddedContent>
              <Form
                disabled
                FieldTemplate={FieldTemplate(t)}
                formData={config.groupIdentity}
                schema={journalSch}
                uiSchema={uiJournalSch}
              />
            </PaddedContent>
          </SectionContent>
        </WidthLimiter>
      </Container>
    </>
  )
}

export default CmsMetadataPage
