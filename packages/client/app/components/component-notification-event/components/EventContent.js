/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useEffect } from 'react'
import { isEmpty, isEqual } from 'lodash'
import { grid } from '@coko/client'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useBool, useObject } from '../../../hooks/dataTypeHooks'
import { objIf, onEntries } from '../../../shared/generalUtils'
import { createFieldsStatusObject } from '../misc/helpers'
import { Col, EventEditForm } from '../misc/styleds'
import EditSection from './EditSection'
import { ActionButton } from '../../shared'
import { T } from '../misc/constants'

const Header = styled.header`
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  padding: ${grid(2)} ${grid(3)};

  > :first-child {
    gap: 4px;
  }
`

const EventContent = ({
  save,
  create,
  selected,
  emailTemplates,
  recipients,
}) => {
  const { t } = useTranslation()

  const modifiedData = useObject({
    onUpdate: state => {
      isSaved.set(isEqual(state, selected))
      fieldsStatus.update(createFieldsStatusObject(state, selected))
    },
    onFieldUpdate: updates => {
      onEntries(updates, (k, v) => {
        fieldsStatus.update({
          hasChanged: { [k]: !isEqual(v, selected[k]) },
          isValid: { [k]: k === 'delay' ? Number.isInteger(v) : !isEmpty(v) },
        })
      })
    },
  })

  const fieldsStatus = useObject({
    start: createFieldsStatusObject(selected),
  })

  const isSaved = useBool({ onTrue: () => fieldsStatus.reset() })
  const { id } = selected
  const isNew = !id
  const { isValid } = fieldsStatus.state
  const allFieldsValid = !!Object.values(isValid).every(f => !!f)
  const disableSave = isSaved.state || !allFieldsValid

  useEffect(() => {
    modifiedData.set(selected)
    isSaved.set(selected.id) // if not id is not on the db
  }, [selected])

  const handleSave = () => {
    const {
      /* eslint-disable-next-line no-unused-vars */
      __typename,
      /* eslint-disable-next-line no-unused-vars */
      groupId,
      /* eslint-disable-next-line no-unused-vars */
      id: notificationId,
      /* eslint-disable-next-line no-unused-vars */
      active,
      /* eslint-disable-next-line no-unused-vars */
      isDefault,
      event,
      ...rest
    } = modifiedData.state

    const input = {
      ...rest,
      ...objIf(isNew, { event }),
    }

    const variables = { id, input }

    if (isNew) {
      create({ variables })
    } else {
      save({ variables })
    }

    isSaved.on()
  }

  return (
    <EventEditForm>
      <Header>
        <Col>
          <h3>{selected?.displayName}</h3>
          <p>Event description: {`"${t(T[selected?.event])}"`}</p>
        </Col>
        {!disableSave && (
          <ActionButton onClick={handleSave} primary>
            {t(T[isNew ? 'save' : 'update'])}
          </ActionButton>
        )}
      </Header>
      <EditSection
        emailTemplates={emailTemplates}
        fieldsStatus={fieldsStatus}
        modifiedData={modifiedData}
        recipients={recipients}
        selected={selected}
      />
    </EventEditForm>
  )
}

export default EventContent
