/* eslint-disable react/prop-types */

import { Attachment } from '../../../shared'
import { Section, Legend } from '../style'

const SupplementaryFiles = ({ manuscript }) => (
  <Section id="files.supplementary">
    {(manuscript.files || []).filter(file =>
      file.tags.includes('supplementary'),
    ).length > 0
      ? [
          <Legend htmlFor="supplementary" key={1}>
            Supplementary materials uploaded
          </Legend>,
          <div key={2}>
            {manuscript.files
              .filter(file => file.tags.includes('supplementary'))
              .map(attachment => (
                <Attachment
                  file={attachment}
                  key={attachment.storedObject[0].url}
                  uploaded
                />
              ))}
          </div>,
        ]
      : null}
  </Section>
)

export default SupplementaryFiles
