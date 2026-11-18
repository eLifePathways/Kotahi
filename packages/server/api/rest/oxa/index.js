const endpoint = require('./endpoint')

module.exports = {
  server: () => app => endpoint(app),
}
