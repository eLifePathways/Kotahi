/* eslint-disable react/prop-types */

import { useState } from 'react'
// // import styled from 'styled-components'
// // TODO: Sort out the imports, perhaps make DecisionReview a shared component?
// import Review from '../../../component-review/src/components/decision/DecisionReview'
// import { UserAvatar } from '../../../../components/component-avatar/src'

import { Trans, useTranslation } from 'react-i18next'
import { Button } from '../../../pubsweet'

import { NEW_MANUSCRIPT_VERSION_FRAGMENT } from '../../../../queries'

import {
  SectionHeader,
  SectionRow,
  Title,
  SectionContent,
  HeadingWithAction,
} from '../../../shared'

const CreateANewVersion = ({
  manuscript,
  createNewVersion,
  allowAuthorsSubmitNewVersion,
}) => {
  const [newVerButtonIsEnabled, setNewVerButtonIsEnabled] = useState(true)
  const { t } = useTranslation()
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
          <Button
            $primary
            data-testid="create-new-manuscript-version-button"
            disabled={!newVerButtonIsEnabled}
            onClick={() => {
              setNewVerButtonIsEnabled(false) // Prevents double-clicking

              createNewVersion({
                variables: { id: manuscript.id },
                // eslint-disable-next-line no-shadow
                update: (cache, { data: { createNewVersion } }) => {
                  // Always modify the main/original/parent manuscript
                  const parentId = manuscript.parentId || manuscript.id
                  cache.modify({
                    id: cache.identify({
                      id: parentId,
                      __typename: 'Manuscript',
                    }),
                    fields: {
                      manuscriptVersions(
                        /* eslint-disable-next-line default-param-last */
                        existingVersionRefs = [],
                        { readField },
                      ) {
                        const newVersionRef = cache.writeFragment({
                          data: createNewVersion,
                          fragment: NEW_MANUSCRIPT_VERSION_FRAGMENT,
                        })

                        if (
                          existingVersionRefs.some(
                            ref => readField('id', ref) === createNewVersion.id,
                          )
                        ) {
                          return existingVersionRefs
                        }

                        return [newVersionRef, ...existingVersionRefs]
                      },
                    },
                  })
                },
              })
            }}
          >
            {t('manuscriptSubmit.submitVersionButton')}
          </Button>
        </HeadingWithAction>
      </SectionRow>
    </SectionContent>
  )
}

export default CreateANewVersion
