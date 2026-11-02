const { get, set } = require('lodash')
const schedule = require('node-schedule')
const { initiateJobSchedules } = require('../../utils/jobUtils')

const MASK = '**********'

const SECRET_PATHS = [
  'publishing.crossref.password',
  'publishing.datacite.password',
  'publishing.doaj.password',
  'publishing.hypothesis.apiKey',
  'publishing.webhook.token',
  'integrations.aiDesignStudio.apiKey',
  'integrations.localContextApiKey.apiKey',
  'emailNotification.pass',
  'notification.gmailAuthPassword',
]

const hideSensitiveInformation = async configData => {
  const config = configData

  SECRET_PATHS.forEach(path => {
    const value = get(config.formData, path)
    if (value) set(config.formData, path, MASK)
  })

  return config
}

const revertHiddenSensitiveInformation = async (
  existingConfig,
  inputFormData,
) => {
  const formData = inputFormData

  SECRET_PATHS.forEach(path => {
    const value = get(formData, path)
    const existingValue = get(existingConfig.formData, path)

    if (existingValue && value === MASK) {
      set(formData, path, existingValue)
    }
  })

  return formData
}

const stripSensitiveInformation = async configData => {
  const config = configData
  delete config.formData.groupIdentity?.licenseUrl
  // kotahiApis - tokens
  delete config.formData.integrations?.kotahiApis
  // publishing - credentials
  delete config.formData.publishing?.crossref.login
  delete config.formData.publishing?.crossref.password
  delete config.formData.publishing?.crossref.depositorName
  delete config.formData.publishing?.crossref.depositorEmail
  delete config.formData.publishing?.crossref.doiPrefix
  delete config.formData.publishing?.crossref.registrant
  delete config.formData.publishing?.crossref.publicationType
  delete config.formData.publishing?.crossref.publishedArticleLocationPrefix
  delete config.formData.publishing.datacite?.login
  delete config.formData.publishing.datacite?.password
  delete config.formData.publishing?.hypothesis.group
  delete config.formData.publishing?.hypothesis.apiKey
  delete config.formData.publishing?.webhook

  if (config?.formData?.integrations?.aiDesignStudio?.apiKey) {
    delete config.formData.integrations.aiDesignStudio.apiKey
  }

  // notification - credentials
  delete config.formData.notification

  return config
}

const rescheduleJobsOnChange = async (previousConfig, currentConfig) => {
  if (
    previousConfig.formData.manuscript.autoImportHourUtc !==
      currentConfig.formData.manuscript.autoImportHourUtc ||
    previousConfig.formData.taskManager.teamTimezone !==
      currentConfig.formData.taskManager.teamTimezone
  ) {
    await schedule.gracefulShutdown() // Gracefullly cancels all scheduled jobs
    await initiateJobSchedules() // Reinitiate all job schedules
  }
}

module.exports = {
  hideSensitiveInformation,
  revertHiddenSensitiveInformation,
  stripSensitiveInformation,
  rescheduleJobsOnChange,
}
