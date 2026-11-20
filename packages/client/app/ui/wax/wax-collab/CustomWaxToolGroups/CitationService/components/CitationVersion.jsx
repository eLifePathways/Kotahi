/* eslint-disable react/prop-types */

import { sanitize } from 'isomorphic-dompurify'
import { CitationVersionWrapper } from './styles'

const CitationVersion = ({
  text,
  type,
  selected,
  // editThis,
  select,
}) => {
  // If 'text' comes in as '', we're assuming we don't have a way to show the content. But we can still edit.
  return (
    <CitationVersionWrapper
      className={selected ? 'selected' : ''}
      onClick={e => {
        e.preventDefault()
        select()
      }}
    >
      {text ? (
        <input
          checked={selected}
          name="citation-version"
          onChange={e => {
            e.preventDefault()
          }}
          type="checkbox"
        />
      ) : null}
      {text ? (
        <div
          dangerouslySetInnerHTML={{
            __html: sanitize(text),
          }}
        />
      ) : (
        <p>No formatted version available.</p>
      )}
      <p>
        {type === 'original' && (
          <span className="tag">
            <i>unstructured</i>
          </span>
        )}
        <br />
        <span>
          <strong>
            {type === 'original' && 'Original'}
            {type === 'anystyle' && 'AnyStyle'}
            {type === 'crossref' && 'CrossRef'}
            {type === 'datacite' && 'Datacite'}
            {type === 'custom' && 'Custom'}
          </strong>
        </span>
      </p>
    </CitationVersionWrapper>
  )
}

export default CitationVersion
