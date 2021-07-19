// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'packageDat... Remove this comment to see the full error message
const packageData = JSON.parse(fs.readFileSync('./package.json'))
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'buildNumbe... Remove this comment to see the full error message
const buildNumber = fs.existsSync('./build-info.json')
  ? JSON.parse(fs.readFileSync('./build-info.json')).buildNumber
  : packageData.version
module.exports = { buildNumber, packageData }
