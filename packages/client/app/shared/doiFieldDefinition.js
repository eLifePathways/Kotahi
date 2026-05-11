export const isValidDOI = doi => {
  // Define the regular expression for a DOI
  const doiRegex =
    // eslint-disable-next-line no-useless-escape
    /^(https?:\/\/(dx\.)?doi\.org\/|doi:)?10.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i

  // Test if the DOI matches the regex
  return doiRegex.test(doi)
}

export const fields = [
  {
    name: 'doi',
    label: 'Doi',
    placeholder: 'Enter doi…',
    validate: value => !isValidDOI(value),
  },
]

/** Caution: returns false if valid! This is in keeping with how formik fields are validated. */
export const validateDoiField = value =>
  Array.isArray(value) &&
  value.some(doi => fields.some(f => f.validate && f.validate(doi[f.name]))) &&
  'Some dois are invalid'
