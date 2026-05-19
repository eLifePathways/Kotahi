/* eslint-disable react/prop-types */

import { MentionsInput, Mention } from 'react-mentions'
import { th } from '@coko/client'
import { MentionsInputStyle } from './style'
import MentionSuggestion from './mentionSuggestion'
import { theme, hexa } from '../SuperChatInput/style'
import { color } from '../../../../theme'

const CustomMentionsInput = props => {
  const { searchUsersCallBack } = props

  const searchUsers = async () => {
    searchUsersCallBack()
  }

  const extraStyle = {
    dataCy: props.dataCy || 'chat-input',
    spellCheck: true,
    autoCapitalize: 'sentences',
    autoComplete: 'on',
    autoCorrect: 'on',
    background: `${props.networkDisabled ? 'none' : color.backgroundA}`,
    fontSize: '16px' /* has to be 16px to avoid zoom on iOS */,
    fontWeight: 400,
    lineHeight: 1.4,

    div: {
      lineHeight: '1.4 !important',
      wordBreak: 'break-word',
    },
    textarea: {
      lineHeight: '1.4 !important',
      wordBreak: 'break-word',
    },

    '&::placeholder': {
      color: `${
        props.networkDisabled
          ? hexa(th('colorWarning'), 0.8)
          : color.brand2.base()
      }`,
    },

    '&::-webkit-input-placeholder': {
      color: `${
        props.networkDisabled
          ? hexa(th('colorWarning'), 0.8)
          : color.brand2.base()
      }`,
    },

    '&:-moz-placeholder': {
      color: `${
        props.networkDisabled
          ? hexa(th('colorWarning'), 0.8)
          : color.brand2.base()
      }`,
    },

    '&:-ms-input-placeholder': {
      color: `${
        props.networkDisabled
          ? hexa(th('colorWarning'), 0.8)
          : color.brand2.base()
      }`,
    },

    pre: {
      // `${monoStack}`,

      backgroundColor: `${theme.bg.wash}`,
      border: `1px solid ${color.gray60}`,
      borderRadius: `2px`,
      fontSize: `15px`,
      fontWeight: 500,
      marginRight: `16px`,
      padding: `4px`,
    },

    blockquote: {
      borderLeft: `4px solid ${color.gray60}`,
      color: `${theme.text.alt}`,
      lineHeight: 1.5,
      padding: `4px 12px 4px 16px`,
    },
  }

  /* eslint-disable-next-line no-unused-vars */
  const { dataCy, networkDisabled, staticSuggestions, hasAttachment, ...rest } =
    props

  return (
    <MentionsInput
      data-cy={props.dataCy}
      {...rest}
      style={{ ...extraStyle, ...MentionsInputStyle }}
    >
      <Mention
        appendSpaceOnAdd
        data={searchUsers}
        displayTransform={username => `@${username}`}
        markup="@[__id__]"
        renderSuggestion={(
          entry,
          search,
          highlightedDisplay,
          index,
          focused,
        ) => (
          <MentionSuggestion
            entry={entry}
            focused={focused}
            highlightedDisplay={highlightedDisplay}
            index={index}
            search={search}
          />
        )}
        trigger="@"
      />
    </MentionsInput>
  )
}

export default CustomMentionsInput
