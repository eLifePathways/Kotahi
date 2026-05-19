const schedule = require('node-schedule')
const { initiateJobSchedules } = require('../../utils/jobUtils')

const redact = str => {
  return str && str.replace(/./g, '*')
}

const hideSensitiveInformation = async configData => {
  const config = configData

  // Publishing - Crossref password
  if (config.formData.publishing.crossref.password)
    config.formData.publishing.crossref.password = redact(
      config.formData.publishing.crossref.password,
    )

  // Publishing - Datacite password
  if (config.formData.publishing.datacite?.password)
    config.formData.publishing.datacite.password = redact(
      config.formData.publishing.datacite.password,
    )

  return config
}

const revertHiddenSensitiveInformation = async (
  existingConfig,
  inputFormData,
) => {
  const formData = inputFormData

  // Publishing - Crossref password
  if (formData.publishing.crossref?.password) {
    const passwordIsHidden =
      redact(existingConfig.formData.publishing.crossref.password) ===
      formData.publishing.crossref.password

    if (passwordIsHidden)
      formData.publishing.crossref.password =
        existingConfig.formData.publishing.crossref.password
  }

  // Publishing - Datacite password
  if (formData.publishing.datacite?.password) {
    const passwordIsHidden =
      redact(existingConfig.formData.publishing.datacite?.password) ===
      formData.publishing.datacite.password

    if (passwordIsHidden)
      formData.publishing.datacite.password =
        existingConfig.formData.publishing.datacite?.password
  }

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
