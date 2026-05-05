/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import ReadonlyFieldData from './ReadonlyFieldData'
import { color } from '../../../../../theme'
import {
  Title,
  SectionHeader,
  SectionRowGrid,
  Heading,
  Cell,
  Info,
} from '../style'
import { SectionContent, Action, Icon } from '../../../../shared'

const StyledSectionContent = styled(SectionContent)`
  margin-top: 0;
`

const ReadonlyFormTemplate = ({
  form,
  formData,
  manuscript,
  showEditorOnlyFields = false,
  title,
  displayShortIdAsIdentifier,
  threadedDiscussionProps,
  allowAuthorsSubmitNewVersion,
  copyHandleBarsCode = false,
  isCollaborativeForm = false,
}) => {
  const { t } = useTranslation()

  const isChildrenEmpty = form.children.length === 0

  const renderHeader = () => {
    const headerContent = isChildrenEmpty ? (
      <Info>{t('reviewDecisionSection.noDecisionUpdated')}</Info>
    ) : (
      title && (
        <SectionHeader>
          <Title>{title}</Title>
        </SectionHeader>
      )
    )

    return headerContent || null
  }

  const onCopyHandleBarsCode = name => {
    return () =>
      navigator.clipboard.writeText(
        `<span>{{ article.${name.replace(
          'submission.',
          'articleMetadata.submission.',
        )} | safe }}</span>`,
      )
  }

  return (
    <StyledSectionContent>
      {renderHeader()}

      {displayShortIdAsIdentifier &&
        manuscript && ( // TODO The shortId shouldn't be rendered as part of this component. Split out!
          <SectionRowGrid>
            <Heading>Manuscript Number</Heading>
            <Cell>{manuscript.shortId}</Cell>
          </SectionRowGrid>
        )}

      {form.children
        .filter(element => {
          return (
            (showEditorOnlyFields || element.hideFromAuthors !== 'true') &&
            element.hideFromReviewers !== 'true'
          )
        })
        .map(element => (
          <SectionRowGrid
            expandedWidthDetails={[
              'ThreadedDiscussion',
              'LocalContext',
            ].includes(element.component)}
            key={element.id}
          >
            <Heading>{element.shortDescription || element.title}</Heading>
            <Cell>
              <ReadonlyFieldData
                allowAuthorsSubmitNewVersion={allowAuthorsSubmitNewVersion}
                fieldName={element.name}
                form={form}
                formData={formData}
                isCollaborativeForm={isCollaborativeForm}
                threadedDiscussionProps={threadedDiscussionProps}
              />
            </Cell>
            {copyHandleBarsCode && (
              <Cell>
                {element.name}
                <Action onClick={onCopyHandleBarsCode(element.name)} primary>
                  {' '}
                  <Icon color={color.brand1.base()} inline>
                    file-plus
                  </Icon>
                </Action>
              </Cell>
            )}
          </SectionRowGrid>
        ))}
    </StyledSectionContent>
  )
}

ReadonlyFormTemplate.propTypes = {
  form: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        component: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  manuscript: PropTypes.shape({
    meta: PropTypes.shape({ source: PropTypes.string }).isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        storedObjects: PropTypes.arrayOf(PropTypes.object),
        tags: PropTypes.arrayOf(PropTypes.string.isRequired),
      }).isRequired,
    ),
  }),
  showEditorOnlyFields: PropTypes.bool,
  copyHandleBarsCode: PropTypes.bool,
  isCollaborativeForm: PropTypes.bool,
}

export default ReadonlyFormTemplate
