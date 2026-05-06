import { required } from '../components/xpub-validators/src'

const isMalformedEmail = val =>
  val !== '' &&
  val &&
  !/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(
    val,
  ) &&
  'Not a valid email address'

/**
 * This function produces a dynamic list of author fields, based on the needs of the workflow.
 * @param {object} options customises the fields returned, and their properties. This can be used to add additional fields needed by a certain use case, while not interfering with other uses of `AuthorsInput`
 * @returns array of custom author fields
 */
export const getAuthorFields = (options = {}) => {
  const {
    requireEmail, // makes the email value required
    showMiddleName, // shows the `middleName` field, otherwise hidden by default
    showOrcidId, // shows the `orcid` field, otherwise hidden by default
  } = options

  return [
    {
      name: 'firstName',
      label: 'First name',
      placeholder: 'Enter first name…',
      validate: required,
    },
    ...(showMiddleName
      ? [
          {
            name: 'middleName',
            label: 'Middle name',
            placeholder: 'Enter middle name…',
          },
        ]
      : []),
    {
      name: 'lastName',
      label: 'Last name',
      placeholder: 'Enter last name…',
      validate: required,
    },
    {
      name: 'email',
      label: 'Email address',
      placeholder: 'Enter email address…',
      validate: requireEmail
        ? val => required(val) || isMalformedEmail(val)
        : isMalformedEmail,
    },
    {
      name: 'ror',
      label: 'ROR',
      placeholder: 'Enter ROR...',
    },
    ...(showOrcidId
      ? [
          {
            name: 'orcid',
            label: 'ORCID',
            placeholder: 'Enter ORCID...',
          },
        ]
      : []),
  ]
}

/** Caution: returns false if valid! This is in keeping with how formik fields are validated. */
export const validateAuthors = (authors, options = {}) =>
  Array.isArray(authors) &&
  authors.some(author =>
    getAuthorFields(options).some(
      f => f.validate && f.validate(author[f.name]),
    ),
  ) &&
  'Some authors are invalid'

export const validateAuthor = async (
  author,
  { validationOrcid, requireEmail },
) => {
  const fields = getAuthorFields({ requireEmail })
  return Promise.all(
    fields.map(async f => {
      if (f.name === 'orcid') {
        if (author[f.name]) {
          try {
            const { data } = await validationOrcid(author[f.name])
            return {
              [f.name]: data?.orcidValidate ? undefined : 'ORCID is invalid',
            }
          } catch (error) {
            console.error('Error validating ORCID:', error)
            return { [f.name]: 'ORCID validation failed' }
          }
        }

        return { [f.name]: undefined }
      }

      return { [f.name]: f.validate && f.validate(author[f.name]) }
    }),
  )
}
