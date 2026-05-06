/* eslint-disable promise/always-return */

const fs = require('fs-extra')
const fsPromised = require('fs').promises
const crypto = require('crypto')
const { promisify } = require('util')
const FormData = require('form-data')
const axios = require('axios')
const striptags = require('striptags')
const { config } = require('@coko/server')

const { logger } = require('@coko/server')

const anystyleXmlToHtml = require('./anyStyleToHtml')
const { formatCitation } = require('../../utils/reference')

const randomBytes = promisify(crypto.randomBytes)

const { clientId, clientSecret, port, protocol, host } = config.get('anystyle')

const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

let anystyleAccessToken = '' // maybe this should be saved somewhere?

const serviceHandshake = async () => {
  const buff = Buffer.from(`${clientId}:${clientSecret}`, 'utf8')
  const base64data = buff.toString('base64')

  const serviceHealthCheck = await axios({
    method: 'get',
    url: `${serverUrl}/healthcheck`,
  })

  const { data: healthCheckData } = serviceHealthCheck
  const { message } = healthCheckData

  if (message !== 'Coolio') {
    throw new Error(`Anystyle service is down`)
  }

  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `${serverUrl}/api/auth`,
      headers: { authorization: `Basic ${base64data}` },
    })
      .then(async ({ data }) => {
        resolve(data.accessToken)
      })
      .catch(err => {
        const { response } = err
        logger.error(err)

        if (!response) {
          return reject(new Error(`Request failed with message: ${err.code}`))
        }

        const { status, data } = response
        const { msg } = data

        return reject(
          new Error(`Request failed with status ${status} and message: ${msg}`),
        )
      })
  })
}

const convertHtmlToText = text => {
  let returnText = text

  // -- remove BR tags and replace them with line break
  returnText = returnText.replace(/<br>/gi, '\n')
  returnText = returnText.replace(/<br\s\/>/gi, '\n')
  returnText = returnText.replace(/<br\/>/gi, '\n')

  // -- remove P and A tags but preserve what's inside of them
  returnText = returnText.replace(
    /<a\s+href=["']([^'"]*)["'][^>]*>(.*?)<\/a>/gi,
    ' $2 ($1)',
  )
  returnText = striptags(returnText, ['br', 'p'], '') // Strip all but <br> and <p> tags, and replace them with ''
  returnText = striptags(returnText, [], '\n') // Replace remaining tags (i.e., <br> and <p>) with '\n'

  // -- remove all inside SCRIPT and STYLE tags
  returnText = returnText.replace(
    /<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi,
    '',
  )
  returnText = returnText.replace(
    /<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi,
    '',
  )
  // -- remove all else
  returnText = returnText.replace(/<(?:.|\s)*?>/g, '')

  // -- get rid of more than 2 multiple line breaks:
  returnText = returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, '\n\n')

  // -- get rid of more than 2 spaces:
  returnText = returnText.replace(/ +(?= )/g, '')

  // -- get rid of html-encoded characters:
  returnText = returnText.replace(/&nbsp;/gi, ' ')
  returnText = returnText.replace(/&amp;/gi, '&')
  returnText = returnText.replace(/&quot;/gi, '"')
  returnText = returnText.replace(/&lt;/gi, '<')
  returnText = returnText.replace(/&gt;/gi, '>')

  // -- return
  return returnText
}

const parseCitations = async (references, startNumber = 0) => {
  // check to see if we have an access token. If not, wait for one.

  if (!anystyleAccessToken) {
    anystyleAccessToken = await serviceHandshake()
  }

  const raw = await randomBytes(16)
  const dirName = `tmp/${raw.toString('hex')}`

  await fsPromised.mkdir(dirName, { recursive: true })

  const txt = await convertHtmlToText(references)

  const txtPath = `${dirName}/references.txt`

  await fsPromised.appendFile(txtPath, txt)

  // 1 pass references to anystyle
  const form = new FormData()
  // clean any HTML out of what's coming in to Anystyle so it isn't confused
  form.append('txt', fs.createReadStream(`${txtPath}`))

  // console.log('Text path: ', txtPath)
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `${serverUrl}/api/referencesToXml`,
      headers: {
        authorization: `Bearer ${anystyleAccessToken}`,
        ...form.getHeaders(),
      },
      // responseType: 'stream',
      data: form,
      // timeout: 1000, // adding this because it's failing
    })
      .then(async res => {
        // 2 pass citations to HTML wrapper
        // res.data is Anystyle XML as a string
        // TODO: take an initial index for the reference IDs so we don't make duplicate IDs

        // console.log('Result from Anystyle:', res.data)

        const htmledResult =
          anystyleXmlToHtml(res.data, startNumber) || references

        resolve(htmledResult)
      })
      .catch(async err => {
        const { response } = err

        if (!response) {
          return reject(
            new Error(
              `Anystyle request failed with message: ${err.code}, ${err}`,
            ),
          )
        }

        const { status, data } = response
        const { msg } = data

        if (status === 401 && msg === 'expired token') {
          await serviceHandshake()
          return parseCitations(references, startNumber)
        }

        return reject(
          new Error(
            `Anystyle request failed with status ${status} and message: ${msg}`,
          ),
        )
      })
  })
}

/* eslint-disable-next-line default-param-last */
const parseCitationsCSL = async (references, startNumber = 0, groupId) => {
  // check to see if we have an access token. If not, wait for one.

  if (!anystyleAccessToken) {
    anystyleAccessToken = await serviceHandshake()
  }

  const raw = await randomBytes(16)
  const dirName = `tmp/${raw.toString('hex')}`

  await fsPromised.mkdir(dirName, { recursive: true })

  const txt = await convertHtmlToText(references)

  const txtPath = `${dirName}/references.txt`

  await fsPromised.appendFile(txtPath, txt)

  // 1 pass references to anystyle
  const form = new FormData()
  // clean any HTML out of what's coming in to Anystyle so it isn't confused
  form.append('txt', fs.createReadStream(`${txtPath}`))

  // console.log('Text path: ', txtPath)
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `${serverUrl}/api/referencesToCsl`,
      headers: {
        authorization: `Bearer ${anystyleAccessToken}`,
        ...form.getHeaders(),
      },
      // responseType: 'stream',
      data: form,
      // timeout: 1000, // adding this because it's failing
    })
      .then(async res => {
        // 2 pass citations to HTML wrapper
        // res.data is Anystyle XML as a string
        // TODO: take an initial index for the reference IDs so we don't make duplicate IDs
        // eslint-disable-next-line
        console.log('Result from Anystyle:', res.data)

        const formattedCitations = await Promise.all(
          res.data.map(async citation => {
            // reshaping Anystyle CSL to match what we expect
            if (citation.issued) {
              citation.issued = { raw: citation.issued }
            }

            const formattedCitation = await formatCitation(citation, groupId)

            citation.formattedCitation = formattedCitation.result

            citation.citeHtml = formattedCitation.citeHtml
            return citation
          }),
        )

        return formattedCitations
      })
      .then(async refList => {
        const stringifiedResult = JSON.stringify(refList) || references
        resolve(stringifiedResult)
      })
      .catch(async err => {
        const { response } = err

        if (!response) {
          return reject(
            new Error(
              `Anystyle request failed with message: ${err.code}, ${err}`,
            ),
          )
        }

        const { status, data } = response
        const { msg } = data

        if (status === 401 && msg === 'expired token') {
          await serviceHandshake()
          return parseCitationsCSL(references, startNumber, groupId)
        }

        return reject(
          new Error(
            `Anystyle request failed with status ${status} and message: ${msg}`,
          ),
        )
      })
  })
}

module.exports = {
  parseCitations,
  parseCitationsCSL,
}
