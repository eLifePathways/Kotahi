import i18next from 'i18next'
import moment from 'moment'
import {
  PlainOrRichText,
  VersionLabelWrapper,
  VersionTitle,
  VersionIndicator,
} from '../components/shared'

const getDescendingOrderOfCreation = (mA, mB) =>
  mA.created < mB.created ? 1 : -1

// TODO: memoize
/** Given a parent manuscript, get all versions (including the parent/base manuscript) in descending order of creation (most recent first) */
const manuscriptVersions = manuscript => {
  let versions = []

  if (manuscript.manuscriptVersions?.[0]) {
    versions.push(...manuscript.manuscriptVersions)
  }

  versions.push(manuscript)
  versions = versions.sort(getDescendingOrderOfCreation)

  /* eslint-disable-next-line no-shadow */
  return versions.map((manuscript, index) => {
    const submission = JSON.parse(manuscript.submission)

    return {
      label: (
        <VersionLabelWrapper>
          <VersionTitle>
            <PlainOrRichText value={submission.$title} />
          </VersionTitle>
          <VersionIndicator>
            {' — '}
            {index === 0
              ? `${i18next.t('manuscriptSubmit.Current version')} (${
                  versions.length
                })`
              : `${moment(manuscript.created).format('YYYY-MM-DD')} (${
                  versions.length - index
                })`}
          </VersionIndicator>
        </VersionLabelWrapper>
      ),
      manuscript: {
        ...manuscript,
        submission,
      },
    }
  })
}

export default manuscriptVersions
