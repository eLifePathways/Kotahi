/* eslint-disable react/prop-types */

import { sanitize } from 'isomorphic-dompurify'

const richTextRegex = /^\s*<p(?: class="paragraph")?>/

/** If the text starts with '<p>' or '<p class="paragraph">', assume this is
 * rich text and display it as such. Otherwise display as plain text. */
const PlainOrRichText = ({ value, className }) => {
  if (!value || !richTextRegex.test(value)) return value || null
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={(() => ({ __html: sanitize(value) }))()}
    />
  )
}

export default PlainOrRichText
