/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import { Attachment } from '../../../../shared'
import { SectionRowGrid, Heading, Cell } from '../style'

const FilesList = ({ files, tag, name }) => {
  const filesWithTag = (files || []).filter(file => file.tags.includes(tag))
  if (!filesWithTag.length) return null

  return (
    <SectionRowGrid>
      <Heading>
        {filesWithTag.length} {name}{' '}
        {filesWithTag.length === 1 ? 'file' : 'files'}:
      </Heading>
      <Cell>
        {filesWithTag.map(file => (
          <Attachment file={file} key={file.storedObjects[0].url} uploaded />
        ))}
      </Cell>
    </SectionRowGrid>
  )
}

const ManuscriptFilesList = ({ files }) => (
  <>
    <FilesList files={files} name="supplementary" tag="supplementary" />
    <FilesList files={files} name="visual abstract" tag="visualAbstract" />
    <FilesList files={files} name="manuscript" tag="manuscript" />
    <FilesList files={files} name="manuscript image" tag="manuscriptImage" />
  </>
)

ManuscriptFilesList.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      storedObjects: PropTypes.arrayOf(PropTypes.object),
      tags: PropTypes.arrayOf(PropTypes.string.isRequired),
    }).isRequired,
  ),
}

ManuscriptFilesList.defaultProps = {
  files: [],
}

export default ManuscriptFilesList
