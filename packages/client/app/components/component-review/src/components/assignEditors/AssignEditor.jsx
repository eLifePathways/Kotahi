/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable promise/always-return */

import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import { Select } from '../../../../shared'
import { transformTeamsToLegacy } from '../../../../utils'

const editorOption = user => ({
  label: user.username || user.email,
  value: user.id,
})

const AssignEditor = ({
  teamRole,
  manuscript,
  allUsers,
  updateTeam,
  createTeam,
  teamLabels,
}) => {
  const [team, setTeam] = useState(null)
  const [teams, setTeams] = useState([])
  const [selectedEditor, setSelectedEditor] = useState(undefined)
  const [members, setMembers] = useState([])

  useEffect(() => {
    setTeam((manuscript.teams || []).find(t => t.role === teamRole) ?? null)
    setTeams(manuscript.teams || [])
  }, [manuscript])

  useEffect(() => {
    setTeam(teams.find(t => t.role === teamRole) ?? null)
  }, [teams])

  useEffect(() => {
    setMembers(team?.members || [])
  }, [team])

  const { t } = useTranslation()

  useEffect(() => {
    setSelectedEditor(members.length > 0 ? members[0].user.id : undefined)
  }, [members])

  const teamLabelsTransformed = transformTeamsToLegacy(teamLabels)
  const teamName = teamLabelsTransformed[teamRole].name

  const teamNameLoc = t(`common.teams.${teamName}`)

  const options = (allUsers || []).map(user => editorOption(user))

  const onChangeEditor = async currentSelectedEditor => {
    let updatedMembers = []

    if (currentSelectedEditor) {
      updatedMembers = [{ user: { id: currentSelectedEditor } }]
    }

    if (team) {
      await updateTeam({
        variables: { id: team.id, input: { members: updatedMembers } },
      })
      setSelectedEditor(currentSelectedEditor)
      return
    }

    // if team does not exists let's create a new one.

    const input = {
      // Editors are always linked to the parent manuscript
      objectId: manuscript.id,
      objectType: 'manuscript',
      displayName: teamName,
      role: teamRole,
      members: updatedMembers,
    }

    await createTeam({ variables: { input } }).then(({ data }) => {
      setTeams([
        ...teams,
        {
          id: data.createTeam.id,
          role: teamRole,
          members: updatedMembers,
        },
      ])
    })

    setSelectedEditor(currentSelectedEditor)
  }

  return (
    <Select
      aria-label={`Assign ${teamRole}`}
      data-testid={`assign${teamRole}`}
      isClearable
      label={teamName}
      onChange={selected => onChangeEditor(selected?.value)}
      options={options}
      placeholder={t('common.teams.assign', { teamLabel: teamNameLoc })}
      value={selectedEditor}
    />
  )
}

AssignEditor.propTypes = {
  teamRole: PropTypes.string.isRequired,
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
}

export default AssignEditor
