export const login = '/prc/login'
export const dashboard = '/prc/dashboard'
export const manuscripts = '/prc/admin/manuscripts'
export const reports = '/prc/admin/reports'
export const users = '/prc/admin/users'
export const profile = '/prc/profile'
export const submit = '/submit'
export const evaluate = '/evaluation'
export const submissionForm = '/prc/admin/submission-form-builder'
export const manuscriptStatus = `${manuscripts}?status=`
export const unsubmitted = 'new'
export const submitted = 'submitted'
export const evaluated = 'evaluated'
export const published = 'published'

export function evaluationResultUrl(id, int) {
  return `/versions/${id}/evaluation/${int}`
}

export function evaluationSummaryUrl(id) {
  return `/versions/${id}/article-evaluation-summary`
}
