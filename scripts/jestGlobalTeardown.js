const fs = require('fs-extra')
const path = require('path')
const kill = require('kill-port')

module.exports = async () => {
  await global.__BROWSER_SERVER__.close()
  if (!process.env.VITE_PRESERVE_BUILD_ARTIFACTS) {
    await kill('5000,5001,5002,5003')
    await fs.remove(path.resolve(__dirname, '../packages/temp'), (err) => {
      if (err) return console.log(err)
      console.log('temp file is deleted')
    })
  }
}
