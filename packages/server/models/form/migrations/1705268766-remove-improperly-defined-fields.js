// This migration deletes form fields that have no component selected.
// Such fields are malformed and unusable.
// You used to get such fields by adding a field in the form-builder but
// never filling out the required info. New functionality prevents
// a user creating a partially-defined field like this.

const {
  useTransaction,
  // logger
} = require('@coko/server')

const Form = require('../form.model')

exports.up = async () => {
  return useTransaction(async trx => {
    // let updatedFormsCount = 0
    const forms = await Form.query(trx)
    // logger.info(`Total forms: ${forms.length}`)

    return Promise.all(
      forms.map(async form => {
        const fields = form.structure.children
        const newFields = fields.filter(field => !!field.component)

        if (newFields.length !== fields.length) {
          await Form.query(trx).patchAndFetchById(form.id, {
            structure: { ...form.structure, children: newFields },
          })
          // updatedFormsCount += 1
        }
      }),
    )
    // .then(res => {
    //   logger.info(`Total updated forms: ${updatedFormsCount}`)
    // })
  })
}
