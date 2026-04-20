const { usersLoader } = require('./review.loaders')
const model = require('./review.model')

module.exports = {
  model,
  modelName: 'Review',
  modelLoaders: { usersLoader },
}
