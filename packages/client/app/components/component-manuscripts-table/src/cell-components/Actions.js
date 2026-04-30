/* eslint-disable react/prop-types */

import { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { values } from 'lodash'
import { Action, LinkAction } from '../../../shared'
import { articleStatuses } from '../../../../globals'
import Modal from '../../../component-modal/src/Modal'
import PublishingResponse from '../../../component-review/src/components/publishing/PublishingResponse'

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const Actions = ({
  config,
  manuscript,
  archived,
  tryPublishManuscript,
  urlFrag,
}) => {
  const [publishErrorsModalIsOpen, setPublishErrorsModalIsOpen] =
    useState(false)

  const [publishingResponse, setPublishingResponse] = useState([])
  const { t } = useTranslation()
  return (
    <Container>
      {!archived && (
        <>
          {['preprint1', 'preprint2'].includes(config.instanceName) &&
            values(articleStatuses).includes(manuscript.status) && (
              <LinkAction
                to={`${urlFrag}/versions/${manuscript.id}/evaluation`}
              >
                {t('manuscriptsTable.actions.Evaluation')}
              </LinkAction>
            )}
          {['journal', 'prc'].includes(config.instanceName) && (
            <LinkAction to={`${urlFrag}/versions/${manuscript.id}/decision`}>
              {t('manuscriptsTable.actions.Control')}
            </LinkAction>
          )}
        </>
      )}
      <LinkAction to={`${urlFrag}/versions/${manuscript.id}/manuscript`}>
        {t('manuscriptsTable.actions.View')}
      </LinkAction>
      {!archived && (
        <>
          <LinkAction to={`${urlFrag}/versions/${manuscript.id}/production`}>
            {t('manuscriptsTable.actions.Production')}
          </LinkAction>
          {['preprint1', 'preprint2'].includes(config.instanceName) &&
            manuscript.status === articleStatuses.evaluated && (
              <Action
                onActionCompleted={result => {
                  if (result.steps.some(step => !step.succeeded)) {
                    setPublishingResponse(result)
                    setPublishErrorsModalIsOpen(true)
                    return 'failure'
                  }

                  return 'success'
                }}
                onClick={async () => tryPublishManuscript(manuscript)}
              >
                {t('manuscriptsTable.actions.Publish')}
              </Action>
            )}
        </>
      )}
      <Modal
        isOpen={publishErrorsModalIsOpen}
        onClose={() => setPublishErrorsModalIsOpen(false)}
        subtitle={t('manuscriptsTable.actions.Some targets failed to publish')}
        title={t('manuscriptsTable.actions.Publishing error')}
      >
        <PublishingResponse response={publishingResponse} />
      </Modal>
    </Container>
  )
}

export default Actions
