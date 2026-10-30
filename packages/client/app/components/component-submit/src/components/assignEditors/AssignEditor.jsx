/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/set-state-in-effect */

import { useContext, useEffect, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import PropTypes from 'prop-types'
import { Select } from '../../../../shared'
import { UPDATE_TEAM, GET_ALL_USERS } from '../../../../../queries'
import { ConfigContext } from '../../../../config/src'

const editorOption = user => ({
  label: user.username || user.email || user.defaultIdentity?.name,
  value: user.id,
})

// TODO Instead use ../../../../component-review/src/components/assignEditors/AssignEditor.js and delete this file
const AssignEditor = ({ teamRole, manuscript }) => {
  const config = useContext(ConfigContext)
  const [team, setTeam] = useState([])
  const [teams, setTeams] = useState([])
  const [selectedEditor, setSelectedEditor] = useState(undefined)
  const [members, setMembers] = useState([])

  useEffect(() => {
    setTeam((manuscript.teams || []).find(t => t.role === teamRole) || {})
    setTeams(manuscript.teams || [])
  }, [manuscript])

  useEffect(() => {
    setTeam(teams.find(t => t.role === teamRole) || {})
  }, [teams])

  useEffect(() => {
    setMembers(team.members || [])
  }, [team])

  useEffect(() => {
    setSelectedEditor(members.length > 0 ? members[0].user.id : undefined)
  }, [members])

  useEffect(() => {
    if (selectedEditor) {
      // TODO most of this logic should be in the server. We should call an 'assignEditor' mutation rather than 'updateTeam'
      updateTeam({
        variables: {
          id: team.id,
          input: {
            members: [{ user: { id: selectedEditor } }],
          },
        },
      })
    }
  }, [selectedEditor])

  const teamName = config?.teams.nonGlobal.find(
    t => t.role === teamRole,
  )?.displayName

  const { data, loading, error } = useQuery(GET_ALL_USERS)

  const [updateTeam] = useMutation(UPDATE_TEAM)

  if (loading || error) {
    return null
  }

  const options = (data.users || []).map(user => editorOption(user))

  return (
    <Select
      aria-label={`Assign ${teamRole}`}
      data-testid={`assign${teamRole}`}
      label={teamName}
      onChange={selected => setSelectedEditor(selected.value)}
      options={options}
      placeholder={`Assign ${teamName}…`}
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
