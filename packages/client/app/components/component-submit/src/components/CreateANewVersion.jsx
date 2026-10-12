/* eslint-disable react/prop-types */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
// // import styled from 'styled-components'
// // TODO: Sort out the imports, perhaps make DecisionReview a shared component?
// import Review from '../../../component-review/src/components/decision/DecisionReview'
// import { UserAvatar } from '../../../../components/component-avatar/src'

import { Trans, useTranslation } from 'react-i18next'

import { NEW_MANUSCRIPT_VERSION_FRAGMENT } from '../../../../queries'

import {
  SectionHeader,
  SectionRow,
  Title,
  SectionContent,
  HeadingWithAction,
  ActionButton,
} from '../../../shared'

const CreateANewVersion = ({
  manuscript,
  createNewVersion,
  allowAuthorsSubmitNewVersion,
}) => {
  // 'pending' shows a spinner and makes ActionButton ignore further clicks
  const [status, setStatus] = useState(null)
  const { t } = useTranslation()
  const params = useParams()
  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('manuscriptSubmit.Submit a new version')}</Title>
      </SectionHeader>
      <SectionRow>
        <HeadingWithAction>
          {allowAuthorsSubmitNewVersion ? (
            <p>{t('manuscriptSubmit.canModify')}</p>
          ) : (
            <p>
              <Trans i18nKey="manuscriptSubmit.askedToRevise" />
            </p>
          )}
          <ActionButton
            data-testid="create-new-manuscript-version-button"
            onClick={() => {
              // Only one new version per click; a failure allows a retry
              if (status === 'pending' || status === 'success') return
              setStatus('pending')

              createNewVersion({
                variables: { id: manuscript.id },
                // eslint-disable-next-line no-shadow
                update: (cache, { data: { createNewVersion } }) => {
                  const newVersionRef = cache.writeFragment({
                    data: createNewVersion,
                    fragment: NEW_MANUSCRIPT_VERSION_FRAGMENT,
                  })

                  // The page may be built from the parent or from any child version (e.g. when
                  // opened from the dashboard), and each holds its own list of other versions.
                  // Add the new version to all of them so the version switcher picks it up.
                  const manuscriptIds = new Set([
                    manuscript.parentId || manuscript.id,
                    manuscript.id,
                    params.version,
                  ])

                  manuscriptIds.forEach(id =>
                    cache.modify({
                      id: cache.identify({ id, __typename: 'Manuscript' }),
                      fields: {
                        manuscriptVersions(
                          /* eslint-disable-next-line default-param-last */
                          existingVersionRefs = [],
                          { readField },
                        ) {
                          if (
                            existingVersionRefs.some(
                              ref =>
                                readField('id', ref) === createNewVersion.id,
                            )
                          ) {
                            return existingVersionRefs
                          }

                          return [newVersionRef, ...existingVersionRefs]
                        },
                      },
                    }),
                  )
                },
              })
                .then(() => setStatus('success'))
                .catch(error => {
                  console.error(error)
                  setStatus('failure')
                })
            }}
            primary
            status={status}
          >
            {t('manuscriptSubmit.submitVersionButton')}
          </ActionButton>
        </HeadingWithAction>
      </SectionRow>
    </SectionContent>
  )
}

export default CreateANewVersion
