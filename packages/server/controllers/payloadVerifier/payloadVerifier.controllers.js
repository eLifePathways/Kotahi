const Config = require('../../models/config/config.model')
const Manuscript = require('../../models/manuscript/manuscript.model')

const {
  verifySubmission,
  checkPayload,
} = require('../../services/publishing/datacite')

const apiChecks = {
  Datacite: {
    submission: verifySubmission,
    payload: checkPayload,
  },
}

const checkApiPayload = async (id, api) => {
  // check only for dev purposes, just in case
  if (!apiChecks[api]) {
    return JSON.stringify({
      payload: null,
      failureReason: `${api} API not suported`,
    })
  }

  const manuscript = await Manuscript.findById(id)
  const { submission, groupId } = manuscript
  const activeConfig = await Config.getCached(groupId)
  const { formData } = activeConfig

  const failureReason = apiChecks[api].submission(formData, submission)

  const { payload } = await apiChecks[api].payload(manuscript, activeConfig)

  return JSON.stringify({ payload, failureReason })
}

module.exports = { checkApiPayload }
