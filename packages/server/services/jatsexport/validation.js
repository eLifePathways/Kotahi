const path = require('path')
const fs = require('fs-extra').promises
const { logger } = require('@coko/server')

async function validateSchema(xml, xsdSchema) {
  const { XmlDocument, XsdValidator } = await import('libxml2-wasm')

  const xmlDoc = XmlDocument.fromString(xml.toString())
  const xsdDoc = XmlDocument.fromString(xsdSchema.toString())
  const validator = XsdValidator.fromDoc(xsdDoc)

  try {
    validator.validate(xmlDoc)
    return true
  } catch (e) {
    return e.details ?? [{ message: e.message, line: 0, col: 0 }]
  } finally {
    validator.dispose()
    xsdDoc.dispose()
    xmlDoc.dispose()
  }
}

// NOTE: to get this to work locally on an Apple Silicon Mac, I need to go into the server,
// find `/node_modules/libxmljs`, delete the `build` directory, and then run `npm rebuild libxmljs`.

// Given JATS as a string, this validates it against the JATS schema.
// If there are errors, it logs them to the console as errors; it reuturns an array of errors.
// If there are no errors, it returns an empty array.

const validateJats = async jats => {
  const jatsXsdPath = path.join(
    __dirname,
    './schemas/JATS-journalpublishing1-3-mathml3.xsd',
  )

  const schema = (await fs.readFile(jatsXsdPath)).toString()
  const result = await validateSchema(jats, schema) // this returns true is valid, or an array of errors if not.

  if (result.length) {
    logger.error(
      `${result.length} JATS validation error${result.length > 1 ? 's' : ''}:`,
    )
    return result.map(x => ({ ...x, message: x.message })) // message added explicitly because it's not enumerable in Error
  }

  return [] // This comes back as true if the JATS is valid, changing this to [].
}

module.exports = validateJats
