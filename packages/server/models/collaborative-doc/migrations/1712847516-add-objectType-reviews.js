const { useTransaction } = require('@coko/server')

const CollaborativeDoc = require('../collaborativeDoc.model')
const Review = require('../../review/review.model')

exports.up = async () => {
  // At the current time the object Type is always Review,
  // since we dont have any other collabaorative forms.
  return useTransaction(async trx => {
    const docs = await CollaborativeDoc.query(trx).whereNull('objectType')

    return Promise.all(
      docs.map(async doc => {
        const review = await Review.query(trx)
          .findById(doc.objectId)
          .throwIfNotFound()

        if (review) {
          await CollaborativeDoc.query(trx)
            .patch({ objectType: 'Review' })
            .findById(doc.id)
        }
      }),
    )
  })
}
