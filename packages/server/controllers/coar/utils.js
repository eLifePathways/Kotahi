const { default: axios } = require('axios')

const apiUrl = 'https://api.ror.org/v2/organizations'

const getRorOrganisation = async value => {
  const id = value.split('/').pop()

  try {
    const { data } = await axios.get(`${apiUrl}/${id}`, {})

    const rorDisplay =
      data.names?.find(n => n.types.includes('ror_display'))?.value ?? ''

    return rorDisplay
  } catch (error) {
    console.error('Failed to get organisation for ROR', id)
    return ''
  }
}

module.exports = {
  getRorOrganisation,
}
