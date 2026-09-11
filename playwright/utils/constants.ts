export const clientUrl = process.env.CLIENT_URL || 'http://localhost:4000'
const serverUrl = process.env.SERVER_URL || 'http://localhost:3000'
export const apiUrl = `${serverUrl}/api/e2e`

// assuming the theme is not changed
export const colorSecondary = '#6b7280'
export const colorSuccess = '#008800'

// must match the identifier given to SHARED_USERS.userWithOrcid in
// packages/server/api/rest/e2e/actions.js
export const testOrcid = '0000-0001-2345-6789'
