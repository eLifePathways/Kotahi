/* eslint-disable react/prop-types */

import { UserAvatar } from '../../../component-avatar/src'

import {
  StyledMentionSuggestion,
  MentionContent,
  MentionName,
  MentionUsername,
} from './style'

// import type { UserInfoType } from 'shared/graphql/fragments/user/userInfo';

// type Props = {
//   focused: boolean,
//   search: string,
//   entry: UserInfoType,
// };

/* eslint-disable-next-line no-unused-vars */
const MentionSuggestion = ({ entry, search, focused }) => (
  <StyledMentionSuggestion focused={focused}>
    <UserAvatar size={32} user={entry} />
    <MentionContent>
      <MentionName focused={focused}>{entry.name}</MentionName>
      <MentionUsername focused={focused}>@{entry.username}</MentionUsername>
    </MentionContent>
  </StyledMentionSuggestion>
)

export default MentionSuggestion
