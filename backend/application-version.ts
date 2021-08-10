import fs from 'fs'

export const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
export const buildNumber = fs.existsSync('./build-info.json')
  ? JSON.parse(fs.readFileSync('./build-info.json', 'utf-8')).buildNumber
  : packageData.version
export default { buildNumber, packageData }
