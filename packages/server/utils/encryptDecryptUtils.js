const crypto = require('crypto')
const { config } = require('@coko/server')

const deriveKey = (secret, salt) => {
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha512')
}

const encryptionKeySecret = config.get('secret')
const algorithm = 'aes-256-gcm'

const encrypt = text => {
  const iv = crypto.randomBytes(16)
  const salt = crypto.randomBytes(16)
  const key = deriveKey(encryptionKeySecret, salt)

  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${salt.toString(
    'hex',
  )}:${encrypted}:${tag.toString('hex')}`
}

const decrypt = text => {
  const [ivHex, saltHex, encryptedText, tagHex] = text.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const salt = Buffer.from(saltHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const key = deriveKey(encryptionKeySecret, salt)

  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

module.exports = {
  encrypt,
  decrypt,
}
