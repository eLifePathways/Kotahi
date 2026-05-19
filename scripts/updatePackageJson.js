const fs = require('fs')
const path = require('path')

const rootPackageJson = require('../package.json')
const clientPackageJson = require('../packages/client/package.json')
const serverPackageJson = require('../packages/server/package.json')

const oldVersion = rootPackageJson.version
const [oldDate, oldIncrement] = oldVersion.split('-')

const getDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, 0)
  const day = String(date.getDate()).padStart(2, 0)

  return `${year}.${month}.${day}`
}

const newDate = getDate()
let newVersion = ''

if (oldDate === newDate) {
  newVersion = `${newDate}-${Number(oldIncrement) + 1}`
} else {
  newVersion = `${newDate}-0`
}

const files = [
  {
    data: rootPackageJson,
    path: path.join(__dirname, '..', 'package.json'),
  },
  {
    data: clientPackageJson,
    path: path.join(__dirname, '..', 'packages', 'client', 'package.json'),
  },
  {
    data: serverPackageJson,
    path: path.join(__dirname, '..', 'packages', 'server', 'package.json'),
  },
]

files.forEach(item => {
  item.data.version = newVersion

  fs.writeFile(item.path, `${JSON.stringify(item.data, null, 2)}\n`, err => {
    if (err) {
      throw new Error(`Could not write to ${item.path}: ${err}`)
    }

    /* eslint-disable-next-line no-console */
    console.log(`Updated version on ${item.path} to ${newVersion}`)
  })
})
