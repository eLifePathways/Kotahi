export const login = '/preprint2/login'
export const dashboard = '/preprint2/dashboard'
export const manuscripts = '/preprint2/admin/manuscripts'
export const formBuilder = '/preprint2/admin/form-builder'
export const reports = '/preprint2/admin/reports'
export const users = '/preprint2/admin/users'
export const profile = '/preprint2/profile'
export const submit = '/submit'
export const evaluate = '/evaluation'
export const submissionForm = '/preprint2/admin/submission-form-builder'
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
