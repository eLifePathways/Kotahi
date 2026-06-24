/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import { SectionHeader, SectionRowGrid, Title } from '../style'
import { SectionContent } from '../../../../shared'

const AssignEditorsReviewers = ({
  manuscript,
  AssignEditor,
  allUsers,
  updateTeam,
  createTeam,
  teamLabels,
}) => {
  const { t } = useTranslation()

  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('decisionPage.Assign Editors')}</Title>
      </SectionHeader>
      <SectionRowGrid>
        <AssignEditor
          allUsers={allUsers}
          createTeam={createTeam}
          manuscript={manuscript}
          teamLabels={teamLabels}
          teamRole="seniorEditor"
          updateTeam={updateTeam}
        />
        <AssignEditor
          allUsers={allUsers}
          createTeam={createTeam}
          manuscript={manuscript}
          teamLabels={teamLabels}
          teamRole="handlingEditor"
          updateTeam={updateTeam}
        />
        <AssignEditor
          allUsers={allUsers}
          createTeam={createTeam}
          manuscript={manuscript}
          teamLabels={teamLabels}
          teamRole="editor"
          updateTeam={updateTeam}
        />
      </SectionRowGrid>
    </SectionContent>
  )
}

export default AssignEditorsReviewers
