import { StyledAuthor } from '../style'

const Editors = ({ manuscript }) => {
  return manuscript.teams.map(team => (
    <StyledAuthor key={team.id}>
      {team.role !== 'author' &&
        team.role !== 'reviewer' &&
        team.members &&
        team.members[0] &&
        team.members[0].user.username}
    </StyledAuthor>
  ))
}

export default Editors
