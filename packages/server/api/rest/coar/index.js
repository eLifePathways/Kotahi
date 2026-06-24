module.exports = {
  server: () => app => require('./inbox')(app),
}
