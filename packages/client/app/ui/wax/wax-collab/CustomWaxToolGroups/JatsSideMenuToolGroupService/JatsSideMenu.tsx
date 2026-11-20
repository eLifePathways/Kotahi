// @ts-nocheck

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

import { useMemo } from 'react'

import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { ToolGroup } from '../../../wax-prosemirror-core'
import { VerticalTabs, BlockLevelTools } from './VerticalTabs'

class JatsSideMenu extends ToolGroup {
  static inject = [
    'FrontMatterGroup',
    'FundingGroup',
    'AppendixGroup',
    'CitationGroup',
    'AcknowledgementsGroup',
    'KeywordGroup',
    'GlossaryGroup',
  ]

  constructor(
    frontmattergroup,
    fundinggroup,
    appendixgroup,
    citationgroup,
    acknowledgementsgroup,
    keywordgroup,
    glossarygroup,
  ) {
    super()
    this._toolGroups = [
      {
        name: 'FrontMatterTab',
        groups: [frontmattergroup, fundinggroup, keywordgroup],
      },
      {
        name: 'BackMatterTab',
        groups: [
          appendixgroup,
          acknowledgementsgroup,
          glossarygroup,
          citationgroup,
        ],
      },
      { name: 'CitationTab', groups: [citationgroup] },
    ]
  }

  renderTools(view) {
    const { t } = useTranslation()
    if (isEmpty(view)) return null

    const frontMatterList = {
      id: 'frontmatterlist',
      title: t('waxEditor.Front matter tools'),
      icon: 'frontMatter',
      disabled: false,
      component: (
        <BlockLevelTools
          groups={this._toolGroups[0].groups.map(group => ({
            groupName: group.title.props.title,
            items: group._tools,
          }))}
          view={view}
        />
      ),
    }

    const backMatterList = {
      id: 'backmatterlist',
      title: t('waxEditor.Back matter tools'),
      icon: 'backMatter',
      disabled: false,
      component: (
        <BlockLevelTools
          groups={this._toolGroups[1].groups.map(group => ({
            groupName: group.title.props.title,
            items: group._tools,
          }))}
          view={view}
        />
      ),
    }

    // const citationList = {
    //   id: 'citationlist',
    //   title: 'Citation tools',
    //   icon: 'citationList',
    //   disabled: false,
    //   component: (
    //     <BlockLevelTools
    //       groups={this._toolGroups[2].groups.map(group => ({
    //         groupName: group.title.props.title,
    //         items: group._tools,
    //       }))}
    //       view={view}
    //     />
    //   ),
    // }

    const tabList = [frontMatterList, backMatterList /* citationList */]

    const TabsComponent = useMemo(
      () => <VerticalTabs key={uuid()} tabList={tabList} />,
      [],
    )

    return TabsComponent
  }
}

export default JatsSideMenu
