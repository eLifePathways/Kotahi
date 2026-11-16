/** Find the named GET param in the URI, decode any plus-encoding and percent-encoding, and return the decoded value */
function getQueryStringByName(name, url = window.location.href) {
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`)
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

/** Matches GET params like '?param=val' or '&param=val', with capture groups for the key and the value */

export { getQueryStringByName }
