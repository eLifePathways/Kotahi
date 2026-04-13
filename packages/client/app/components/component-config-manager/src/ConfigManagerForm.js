/* stylelint-disable declaration-no-important */
/* eslint-disable react/jsx-handler-names */
/* eslint-disable no-underscore-dangle */
import React, { useMemo, useRef, useState } from 'react'
import Form from '@rjsf/core'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { isEqual } from 'lodash'
import { grid } from '@coko/client'
import {
  generateSchemas,
  tabKeyBasedSchema,
  configTabLabels,
} from './ui/schema' // Import the function that generates the schema and uiSchema

import {
  ActionButton,
  Container,
  HeadingWithAction,
  Heading,
  SectionContent,
  HiddenTabs,
} from '../../shared'
import { color, space } from '../../../theme'
import EmailTemplatesPage from '../../component-email-templates/src/EmailTemplatesPage'
import emailTemplatesToSchema from './helpers'
import { EmailTemplatesProvider } from '../../component-email-templates/hooks/EmailTemplatesContext'
import NotificationPage from '../../component-notification-event/NotificationPage'
import { T } from '../../component-notification-event/misc/constants'
import { getFormBadgeBg } from '../../component-email-templates/src/handlebarsAutocomplete/helpers'
import DescriptionField from './ui/DescriptionField'

const StyledContainer = styled(Container)`
  --tabs-border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const StyledSectionContent = styled(SectionContent)`
  margin: 0;
  overflow-y: auto;
  padding: ${space.g} ${space.g} 0 ${space.g};
  width: 100%;
`

const StyledHeading = styled(Heading)`
  padding: 0.5rem 0 1.5rem;
`

const InstanceTypeLegend = styled.legend`
  border: 0;
  border-bottom: 1px solid #e5e5e5;
  color: #333;
  display: block;
  font-size: 21px;
  line-height: inherit;
  margin-bottom: 20px;
  padding: 0;
  width: 100%;
`

const StyledActionButton = styled(ActionButton)`
  margin-right: 20px;
  transition: all 0.2s;
  width: 10%;
`

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

const Footer = styled.div`
  align-items: center;
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
  padding-top: 0.6rem;

  > div {
    color: ${color.brand1.tint10};
    opacity: ${p => (p.$pending ? 1 : 0)};
    padding: 0 0.6rem;
    transition: opacity 0.2s;
  }
`

const EmailsTabWrapper = styled(StyledSectionContent)`
  height: inherit;
  margin-bottom: 0 !important;
  margin-top: 0 !important;
  max-height: 100%;
  overflow-y: visible;
  padding: 0;

  .ProseMirror {
    padding: ${grid(1)} ${grid(2)};

    span.handlebars {
      background-color: ${getFormBadgeBg('common')};
      border-radius: 5px;
      box-shadow: 0 0 6px 0 #0001, inset 0 0 4px 0 #0002;
      margin: 0;
      padding: 2px 4px;
      text-rendering: geometricPrecision;
    }

    span.handlebars.submission-form {
      background-color: ${getFormBadgeBg('submission')};
    }

    span.handlebars.review-form {
      background-color: ${getFormBadgeBg('review')};
    }

    span.handlebars.decision-form {
      background-color: ${getFormBadgeBg('decision')};
    }

    span.handlebars.editors-form {
      background-color: ${getFormBadgeBg('editors')};
    }
  }

  .wax-surface-scroll {
    height: 100%;

    &:focus-within {
      border-color: ${color.gray80};
    }
  }
`

// TODO Improve on this hardcoded hack to hide the "Publishing" heading.
const StyledWrapper = styled.div`
  /* stylelint-disable-next-line selector-id-pattern */
  #form-integrations_publishing > legend:nth-of-type(1) {
    display: ${p => (p.$hideFirstLegend ? 'none' : 'block')};
  }
`
// #endregion Styleds

const FieldTemplate = props => {
  const {
    children,
    classNames,
    description,
    id,
    label,
    showInstanceType,
    showLabel,
    t,
  } = props

  const suppressedLabels = [
    'root_emailNotification',
    'form-emailNotifications_emailNotification__description',
    'form-emailNotifications_emailNotification',
    'form-emailNotifications_emailNotification_advancedSettings',
  ]

  const supressedDescriptions = [
    'form-emailNotifications_emailNotification_advancedSettings_secure',
    'form-emailNotifications_emailNotification_advancedSettings_requireTLS',
  ]

  const hideLabel = suppressedLabels.includes(id)
  const hideDescription = supressedDescriptions.includes(id)

  const getFieldName = key => description._owner.key === key
  // eslint-disable-next-line no-nested-ternary
  return !showInstanceType ? (
    !getFieldName('instanceName') ? (
      <StyledWrapper $hideFirstLegend={getFieldName('publishing')}>
        <div className={classNames}>
          {label && showLabel && !hideLabel && !hideDescription && (
            <label htmlFor={id}>{label}</label>
          )}
          {!hideLabel && !hideDescription && description}
          {children}
        </div>
      </StyledWrapper>
    ) : (
      ''
    )
  ) : (
    <div className={classNames}>
      {!getFieldName('instanceName') ? (
        description
      ) : (
        <InstanceTypeLegend>{t('configPage.Instance Type')}</InstanceTypeLegend>
      )}
      {children}
    </div>
  )
}

const ConfigManagerForm = ({
  configId,
  disabled,
  formData: passedFormData,
  submissionForm,
  deleteFile,
  createFile,
  config,
  liveValidate = true,
  omitExtraData = true,
  onRefreshCoarAuthToken,
  updateConfig,
  updateConfigStatus,
  emailTemplates,
}) => {
  const { t } = useTranslation()
  const logoAndFavicon = useRef({})
  const initialFormData = useRef(passedFormData)
  const storedFormData = useRef(initialFormData.current)
  const [pendingChanges, setPendingChanges] = useState({})
  const [activeTab, setActiveTab] = useState('general')

  const emailOptions = emailTemplatesToSchema(emailTemplates)

  const seekForPendingChanges = (formData, properties, key) =>
    setPendingChanges(prev => {
      const isChanged = properties
        .flat()
        .some(
          p =>
            initialFormData.current[p] &&
            !isEqual(formData[p], initialFormData.current[p]),
        )

      return { ...prev, [key]: isChanged }
    })

  const noPendingChanges =
    updateConfigStatus !== 'pending' &&
    Object.values(pendingChanges).every(change => !change)

  const submissionOptions = submissionForm.children.map(item => ({
    value: item.name,
    label: item.title,
  }))

  const schemas = useMemo(() => {
    return generateSchemas({
      deleteFile,
      createFile,
      config,
      t,
      logoAndFavicon,
      onRefreshCoarAuthToken,
      submissionOptions,
      ...emailOptions,
    })
  }, [])

  const handlers = {
    form: {
      onChange: ({ formData }, properties, key) => {
        const updatedData = {
          ...storedFormData.current,
          ...formData,
        }

        seekForPendingChanges(formData, properties, key)
        storedFormData.current = updatedData
      },
      onSubmit: () => {
        const toSubmit = storedFormData.current
        const logoid = logoAndFavicon.current?.logo?.id || null
        const faviconid = logoAndFavicon.current?.icon?.id || null

        logoid && (toSubmit.groupIdentity.logoId = logoid)
        faviconid && (toSubmit.groupIdentity.favicon = faviconid)

        initialFormData.current = toSubmit
        storedFormData.current = toSubmit

        Object.keys(configTabLabels).forEach(key =>
          seekForPendingChanges(toSubmit, tabKeyBasedSchema[key], key),
        )

        return updateConfig(configId, toSubmit)
      },
    },
  }

  const tabSections = useMemo(
    () =>
      Object.entries(configTabLabels).map(([key, v]) => ({
        label: t(`configPage.${key}Tab`),
        key,
        content: (
          <StyledSectionContent>
            <StyledForm
              disabled={disabled}
              fields={{ DescriptionField }}
              /* eslint-disable-next-line react/no-unstable-nested-components */
              FieldTemplate={props => (
                <FieldTemplate
                  showInstanceType={key === 'general'}
                  showLabel={key === 'emailNotifications'}
                  t={t}
                  {...props}
                />
              )}
              formData={storedFormData.current}
              liveValidate={liveValidate}
              noHtml5Validate
              omitExtraData={omitExtraData}
              onChange={data =>
                handlers.form.onChange(data, tabKeyBasedSchema[key], key)
              }
              onSubmit={handlers.form.onSubmit}
              schema={schemas.data[key]}
              uiSchema={schemas.ui[key]}
            >
              {/* The blank fragment that follows is to suppress the submit button.
              See https://github.com/rjsf-team/react-jsonschema-form/issues/1602 */}
              {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
              <></>
            </StyledForm>
          </StyledSectionContent>
        ),
      })),
    [],
  )

  const emailTab = {
    label: t('emailTemplate.pageTitle'),
    tabStyles: { display: 'flex', height: '100%', flexDirection: 'row' },
    key: 'emails',
    content: (
      <EmailTemplatesProvider>
        <EmailTemplatesPage wrapper={EmailsTabWrapper} />,
      </EmailTemplatesProvider>
    ),
  }

  const eventTab = {
    label: t(T.title),
    tabStyles: { display: 'flex', height: '100%', flexDirection: 'row' },
    key: 'events',
    content: (
      <NotificationPage
        emailTemplates={emailTemplates}
        key={activeTab}
        wrapper={EmailsTabWrapper}
      />
    ),
  }

  return (
    <>
      <link
        crossOrigin="anonymous"
        href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css"
        integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu"
        rel="stylesheet"
      />
      <StyledContainer>
        <HeadingWithAction>
          <StyledHeading>{t('configPage.Configuration')}</StyledHeading>
        </HeadingWithAction>
        <HiddenTabs
          defaultActiveKey="general"
          onChange={setActiveTab}
          sections={[...tabSections, emailTab, eventTab]}
          shouldFillFlex
        />
        {!['emails', 'events'].includes(activeTab) && (
          <Footer $pending={!noPendingChanges}>
            <div>You have unsaved changes.</div>
            <StyledActionButton
              disabled={disabled}
              onClick={handlers.form.onSubmit}
              primary
              status={updateConfigStatus}
              type="submit"
            >
              {t('common.Save')}
            </StyledActionButton>
          </Footer>
        )}
      </StyledContainer>
    </>
  )
}

export default ConfigManagerForm
