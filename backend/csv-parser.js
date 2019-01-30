const parse = require('csv-parse')
const fs = require('fs')

function CsvParseError(message) {
  this.name = 'CsvParseError'
  this.message = message
}
CsvParseError.prototype = Error.prototype

const parseCsvData = async data => {
  const output = []
  let lastError

  const parser = parse(data, { trim: true, skip_empty_lines: true })
    // eslint-disable-next-line func-names
    .on('readable', function() {
      let record
      // eslint-disable-next-line no-cond-assign
      while ((record = this.read())) {
        output.push(record)
      }
    })

  const getCorrectCallBack = (resolve, reject) => (lastError && reject(new CsvParseError(lastError))) || resolve(output)

  return new Promise((resolve, reject) => {
    parser.on('end', () => getCorrectCallBack(resolve, reject))
    parser.on('finish', () => getCorrectCallBack(resolve, reject))
  })
}

const readFile = path =>
  new Promise((resolve, reject) => {
    fs.readFile(path, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result.toString())
      }
    })
  })

module.exports = {
  readFile,
  parseCsvData,
  CsvParseError,
}
