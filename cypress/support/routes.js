export const login = '/journal/login'
export const dashboard = '/journal/dashboard'
export const dashboardSubmissions = `${dashboard}/submissions`
export const dashboardReviews = `${dashboard}/reviews`
export const dashboardEdits = `${dashboard}/edits`
export const manuscripts = '/journal/admin/manuscripts'
export const formBuilder = '/journal/admin/form-builder'
export const reports = '/journal/admin/reports'
export const users = '/journal/admin/users'
export const profile = '/journal/profile'
export const submit = '/submit'
export const evaluate = '/evaluation'
export const submissionForm = '/journal/admin/submission-form-builder'
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
