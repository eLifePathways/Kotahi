import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Command, EditorState } from 'prosemirror-state'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import { insertCallout } from '../features/callout'
import { isReferenceActive, setReference } from '../features/citation'
import { jatsCommands } from '../features/jatsTags'
import { isTitleActive, setTitle } from '../features/title'
import CommandButton from './CommandButton'

type Tool = {
  key: string
  label: string
  command: Command
  isActive?: (state: EditorState) => boolean
}

type Group = { key: string; title: string; tools: Tool[] }

const jats = (key: keyof typeof jatsCommands, label: string): Tool => ({
  key,
  label,
  command: jatsCommands[key].run,
  isActive: jatsCommands[key].isActive,
})

const frontMatter: Group[] = [
  {
    key: 'frontMatter',
    title: 'waxEditor.Front matter',
    tools: [
      jats('frontMatter', 'waxEditor.Front matter'),
      {
        key: 'title',
        label: 'Title',
        command: setTitle,
        isActive: isTitleActive,
      },
      jats('abstract', 'waxEditor.Abstract'),
    ],
  },
  {
    key: 'funding',
    title: 'waxEditor.Funding Group',
    tools: [
      jats('fundingSource', 'waxEditor.Funding source'),
      jats('awardId', 'waxEditor.Award ID'),
      jats('fundingStatement', 'waxEditor.Funding statement'),
    ],
  },
  {
    key: 'keywords',
    title: 'waxEditor.Keywords',
    tools: [
      jats('keywordList', 'waxEditor.Keyword list'),
      jats('keyword', 'waxEditor.Keyword'),
    ],
  },
]

const backMatter: Group[] = [
  {
    key: 'appendices',
    title: 'waxEditor.Appendices',
    tools: [jats('appendix', 'waxEditor.Appendix')],
  },
  {
    key: 'acknowledgements',
    title: 'waxEditor.Acknowledgements',
    tools: [jats('acknowledgements', 'waxEditor.Acknowledgements')],
  },
  {
    key: 'glossary',
    title: 'waxEditor.Glossary',
    tools: [
      jats('glossarySection', 'waxEditor.Glossary section'),
      jats('glossaryTerm', 'waxEditor.Glossary term'),
    ],
  },
  {
    key: 'citations',
    title: 'waxEditor.Citations',
    tools: [
      jats('refList', 'waxEditor.Reference list'),
      {
        key: 'reference',
        label: 'waxEditor.Reference',
        command: setReference,
        isActive: isReferenceActive,
      },
      { key: 'callout', label: 'Reference callout', command: insertCallout },
    ],
  },
]

const tabs = [
  { key: 'front', title: 'waxEditor.Front matter tools', groups: frontMatter },
  { key: 'back', title: 'waxEditor.Back matter tools', groups: backMatter },
]

const Wrapper = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${grid(2)};
  padding: ${grid(1)};
`

const Tabs = styled.div`
  display: flex;
  gap: ${grid(0.5)};
`

const Tab = styled.button<{ $active: boolean }>`
  background: ${(props): string =>
    props.$active ? props.theme.colorBackgroundHue : 'transparent'};
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  cursor: pointer;
  flex: 1;
  font-size: ${th('fontSizeBaseSmall')};
  padding: ${grid(1)};
`

const GroupTitle = styled.h4`
  font-size: ${th('fontSizeBaseSmall')};
  margin: 0 0 ${grid(0.5)};
`

const Tools = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

type JatsSideMenuProps = {
  className?: string
}

const JatsSideMenu = ({ className }: JatsSideMenuProps): ReactNode => {
  const { t } = useTranslation()
  const [active, setActive] = useState(tabs[0].key)
  const tab = tabs.find(each => each.key === active) ?? tabs[0]

  return (
    <Wrapper aria-label="JATS tools" className={className}>
      <Tabs role="tablist">
        {tabs.map(each => (
          <Tab
            $active={each.key === active}
            aria-selected={each.key === active}
            key={each.key}
            onClick={(): void => setActive(each.key)}
            role="tab"
            type="button"
          >
            {t(each.title)}
          </Tab>
        ))}
      </Tabs>
      {tab.groups.map(group => (
        <section key={group.key}>
          <GroupTitle>{t(group.title)}</GroupTitle>
          <Tools>
            {group.tools.map(tool => (
              <CommandButton
                command={tool.command}
                isActive={tool.isActive}
                key={tool.key}
                label={t(tool.label)}
                title={t(tool.label)}
              />
            ))}
          </Tools>
        </section>
      ))}
    </Wrapper>
  )
}

export default JatsSideMenu
