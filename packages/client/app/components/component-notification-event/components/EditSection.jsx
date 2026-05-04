/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { createDefaultOptions, createOptions } from '../misc/helpers'
import {
  Col,
  EditSection as Root,
  InputWrapper,
  Row,
  TextInput,
} from '../misc/styleds'
import { color } from '../../../theme'
import SimpleWaxEditor from '../../wax-collab/src/SimpleWaxEditor'
import { objIf } from '../../../shared/generalUtils'
import { T } from '../misc/constants'
import {
  CounterInput,
  CreatableSelect,
  RegularInput,
  Select,
} from './CustomInputs'

export const SelectInput = styled(Select)`
  width: 100%;

  .react-select__control {
    background: #fff;
    border: 1px solid ${p => p.$color || '#ddd'};
  }
`
export const CreatableInput = styled(CreatableSelect)`
  width: 100%;

  .react-select__control {
    background: #fff;
    border: ${p => p.$border || `1px solid ${p.$color || '#ddd'}`};
  }
`

const WaxEditorWrapper = styled(Col)`
  background: #f8f8f8;
  border: 1px solid #ddd;
  height: 100%;
  overflow-y: auto;
  padding: 12px 20px;
  user-select: none;
`

const TwoColumnRow = styled(Row)`
  display: grid;
  gap: 8px 16px;
  grid-template-columns: repeat(2, 1fr);
  padding-inline: ${grid(3)};
`

const EventSettings = styled(TwoColumnRow)`
  border-bottom: 1px solid #ddd;
  gap: ${grid(2)} ${grid(2)};
  padding: 0 ${grid(3)} ${grid(5)};
`

const EmailSettings = styled(Col)`
  gap: ${grid(2)};
  justify-content: flex-start;
  max-height: 330px;
  min-height: 300px;
  padding-inline: 24px;
`

const EditSection = ({
  selected,
  recipients,
  modifiedData,
  fieldsStatus,
  emailTemplates,
}) => {
  const { t } = useTranslation()
  const { hasChanged, isValid } = fieldsStatus.state
  const options = createOptions(recipients, emailTemplates, selected?.ccEmails)
  const defaultOptions = createDefaultOptions(selected, options)

  const handleReactSelectChange = key => option => {
    const isMulti = Array.isArray(option)
    const val = isMulti ? option.map(opt => opt.value) : option.value

    const updatedFields = {
      [key]: val,
      ...objIf(key === 'emailTemplateId', {
        subject: emailTemplates.find(et => et.id === val)?.emailContent.subject,
      }),
    }

    modifiedData.update(updatedFields)
  }

  const handleTextInputChange = key => e => {
    modifiedData.update({ [key]: e.target.value })
  }

  const renderLabel = (label, renderStatus = true) => (
    <small data-error={!isValid[label]} data-modified={hasChanged[label]}>
      {t(T[label])}{' '}
      {renderStatus && hasChanged[label] ? `(${t(T.modified)})` : ''}
    </small>
  )

  const getFieldStatusColor = field => {
    if (!isValid[field]) return color.error.base
    if (hasChanged[field]) return color.warning.base
    return ''
  }

  return (
    <Root>
      <h4>{t(T.eventSettings)}</h4>
      <EventSettings>
        <Col>
          {renderLabel('displayName')}
          <TextInput
            $color={getFieldStatusColor('displayName')}
            onChange={handleTextInputChange('displayName')}
            style={{ background: 'white', padding: '9px' }}
            value={modifiedData.state.displayName || ''}
          />
        </Col>
        <Col>
          {renderLabel('notificationType')}
          <SelectInput
            $color={getFieldStatusColor('notificationType')}
            defaultValue={defaultOptions.notificationType}
            onChange={handleReactSelectChange('notificationType')}
            options={options.notificationType}
          />
        </Col>
        <Col>
          {renderLabel('emailTemplateId')}
          <SelectInput
            $color={getFieldStatusColor('emailTemplateId')}
            defaultValue={defaultOptions.emailTemplateId}
            onChange={handleReactSelectChange('emailTemplateId')}
            options={options.emailTemplateId}
          />
        </Col>
        <Col>
          {renderLabel('delay')}
          <CounterInput
            $changed={hasChanged.delay}
            options={{
              onUpdate: state => modifiedData.update({ delay: state }),
              start: selected.delay,
              positiveOnly: true,
              end: 30,
            }}
          />
        </Col>
      </EventSettings>
      <h4>{t(T.emailSettings)}</h4>
      <EmailSettings>
        <TwoColumnRow style={{ paddingInline: '0' }}>
          <InputWrapper $color={getFieldStatusColor('recipient', false)}>
            {renderLabel('recipient', false)}
            <CreatableInput
              $border="none"
              createOptionPosition="first"
              defaultValue={defaultOptions.recipient}
              hasGroupedOptions
              isDisabled={selected.recipient && selected.isDefault}
              onChange={handleReactSelectChange('recipient')}
              options={options.recipient}
            />
          </InputWrapper>
          <InputWrapper $color={getFieldStatusColor('ccEmails')}>
            {renderLabel('ccEmails', false)}
            <CreatableInput
              $border="none"
              createOptionPosition="first"
              defaultValue={defaultOptions.ccEmails}
              hasGroupedOptions
              isMulti
              key={selected.ccEmails}
              onChange={handleReactSelectChange('ccEmails')}
              options={options.recipient}
            />
          </InputWrapper>
        </TwoColumnRow>
        <RegularInput
          $color={getFieldStatusColor('subject')}
          key={modifiedData.state.emailTemplateId}
          label={renderLabel('subject', false)}
          onChange={handleTextInputChange('subject')}
          style={{ background: 'white', padding: '9px' }}
          value={modifiedData.state.subject}
        />
        <WaxEditorWrapper>
          <SimpleWaxEditor
            key={modifiedData.state.emailTemplateId}
            readonly
            value={
              emailTemplates.find(
                template => template.id === modifiedData.state.emailTemplateId,
              )?.emailContent.body
            }
          />
        </WaxEditorWrapper>
      </EmailSettings>
    </Root>
  )
}

export default EditSection
