const { useTransaction } = require('@coko/server')
const Config = require('../config.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    await Promise.all(
      configs.map(async config => {
        const form = config.formData

        const { gmailSenderName, gmailAuthEmail, gmailAuthPassword } =
          form.notification

        const hasData = gmailSenderName || gmailAuthEmail || gmailAuthPassword

        form.emailNotification = {
          from: gmailSenderName,
          host: hasData ? 'smtp.gmail.com' : null,
          port: hasData ? '465' : null,
          user: gmailAuthEmail,
          pass: gmailAuthPassword,
        }

        delete form.notification.gmailSenderName
        delete form.notification.gmailAuthEmail
        delete form.notification.gmailAuthPassword

        await Config.patchAndFetchById(config.id, { formData: form }, { trx })
      }),
    )
  })
}

exports.down = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    await Promise.all(
      configs.map(async config => {
        const form = config.formData
        const { from, user, pass } = form.emailNotification

        form.notification = {
          ...form.notification,
          gmailSenderName: from,
          gmailAuthEmail: user,
          gmailAuthPassword: pass,
        }

        delete form.emailNotification

        await Config.patchAndFetchById(config.id, { formData: form }, { trx })
      }),
    )
  })
}
