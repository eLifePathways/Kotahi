/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { Fragment, useEffect } from 'react'
import { Trash } from 'react-feather'
import { useBool } from '../../../hooks/dataTypeHooks'
import { isCustomTemplate, isSystemTemplate } from '../misc/utils'
import { FlexRow } from '../../component-cms-manager/src/style'
import { DRAFT_TEMPLATE_OBJECT, LABELS } from '../misc/constants'
import { useEmailTemplatesContext } from '../hooks/EmailTemplatesContext'
import { getBy } from '../../../shared/generalUtils'
import Each from '../../shared/Each'
import {
  CleanButton,
  CollapseIcon,
  EmptyContainer,
  EmptyListFallback,
  ListHeader,
  NavRoot,
  OptionListItem,
  OptionListItemButton,
  OptionsList,
} from '../misc/styleds'

const TemplateItem = ({ template, listTitle }) => {
  const { emailContent, id } = template
  const { activeTemplate, deleteModalState, t } = useEmailTemplatesContext()
  const { DRAFT_TEMPLATE } = LABELS

  const isCommonList = listTitle === LABELS.CUSTOM

  const isSelected = [activeTemplate.state?.id, DRAFT_TEMPLATE].includes(id)
  const isDraftTemplate = id === DRAFT_TEMPLATE
  const select = () => !isDraftTemplate && activeTemplate.update(template)

  return (
    <OptionListItem
      $selected={isSelected}
      onClick={select}
      title={emailContent.description}
    >
      <OptionListItemButton>
        <p>{emailContent.description}</p>
      </OptionListItemButton>
      {isCommonList && !isDraftTemplate && (
        <CleanButton
          onClick={deleteModalState.on}
          style={{ width: 'fit-content' }}
          title={t('emailTemplate.delete')}
        >
          <Trash
            style={{
              fill: 'none',
              stroke: '#555',
              height: '15px',
              width: '15px',
            }}
          />
        </CleanButton>
      )}
    </OptionListItem>
  )
}

const TemplatesList = ({
  templates,
  listTitle,
  wrapper: Wrapper = Fragment,
}) => {
  const collapsedState = useBool()
  const { activeTemplate, isDraft } = useEmailTemplatesContext()
  // expand the list if activeTemplate.state belongs to this templates list
  // covers the case of DRAFT_TEMPLATE_OBJECT wich is never setted as activeTemplate
  useEffect(() => {
    const isCustomList = listTitle === LABELS.CUSTOM
    const [foundTemplate] = getBy({ id: activeTemplate.state?.id }, templates)
    if (foundTemplate || (isDraft && isCustomList)) collapsedState.off()
  }, [activeTemplate.state])

  return (
    <Wrapper>
      <ListHeader onClick={collapsedState.toggle}>
        <FlexRow>{listTitle}</FlexRow>
        <CollapseIcon $collapsed={collapsedState.state} />
      </ListHeader>
      <OptionsList $collapsed={collapsedState.state}>
        <Each
          condition={!!templates?.length}
          fallback={<EmptyListFallback>--- NO TEMPLATES ---</EmptyListFallback>}
          of={templates}
          render={template => (
            <TemplateItem listTitle={listTitle} template={template} />
          )}
        />
      </OptionsList>
    </Wrapper>
  )
}

const EmailTemplatesNav = () => {
  const { isDraft, emailTemplates } = useEmailTemplatesContext()

  const nonRequiredTemplates = emailTemplates.filter(isCustomTemplate)
  const emptyTemplatePlaceholder = isDraft ? [DRAFT_TEMPLATE_OBJECT] : []

  const systemTemplates = emailTemplates.filter(isSystemTemplate)
  const customTemplates = [...emptyTemplatePlaceholder, ...nonRequiredTemplates]

  const templatesLists = [
    { listTitle: LABELS.CUSTOM, templates: customTemplates },
    { listTitle: LABELS.SYSTEM, templates: systemTemplates },
  ]

  return (
    <NavRoot>
      <EmptyContainer />
      <Each of={templatesLists} render={TemplatesList} />
    </NavRoot>
  )
}

export default EmailTemplatesNav
