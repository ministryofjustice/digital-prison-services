const parse = require('csv-parse')
const config = require('./config')
const logger = require('./log')

const validationMessages = {
  invalidFile: 'Select a CSV file - the file you have chosen is not a CSV file',
  maxFileSizeReached: `Select a CSV file less than ${
    config.app.maximumFileUploadSizeInMb
  }MB - the file you selected is too big`,
  noFileInput: `Select a file`,
  noFileContent: `Select a CSV file with prison numbers entered`,
  parsingError: 'There was a problem importing your file, please use the template provided',
}

const csvParserService = ({ fs, isBinaryFileSync }) => {
  const parseCsvData = async data => {
    const output = []
    // eslint-disable-next-line prefer-arrow-callback
    const parser = parse(data, { trim: true, skip_empty_lines: true }).on('readable', function onRead() {
      let record
      // eslint-disable-next-line no-cond-assign
      while ((record = this.read())) {
        output.push(record)
      }
    })

    return new Promise((resolve, reject) => {
      parser.on('error', error => reject(error))
      parser.on('end', () => resolve(output))
      parser.on('finish', () => resolve(output))
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

  const validateCsvFile = ({ path, originalFilename }) => {
    const sizeInMb = config.app.maximumFileUploadSizeInMb
    const maximumFileSizeInBytes = sizeInMb * 1000000

    const { size } = fs.lstatSync(path)

    if (originalFilename && size <= 0) {
      logger.error(`file input had no records in it`)
      throw new Error(validationMessages.noFileContent)
    }

    if (size <= 0) {
      logger.error(`No file was input`)
      throw new Error(validationMessages.noFileInput)
    }

    if (size > maximumFileSizeInBytes) {
      logger.error(`A file exceeding ${sizeInMb} was rejected, filename ${originalFilename} size ${size}`)
      throw new Error(validationMessages.maxFileSizeReached)
    }

    const bytes = fs.readFileSync(path)
    if (isBinaryFileSync(bytes, size)) {
      logger.error(`Unsupported file type rejected, filename ${originalFilename}`)
      throw new Error(validationMessages.invalidFile)
    }
  }

  const loadAndParseCsvFile = async ({ path, originalFilename }) => {
    await validateCsvFile({ path, originalFilename })
    try {
      const data = await readFile(path)
      return await parseCsvData(data)
    } catch (error) {
      logger.error(`There was parsing error - ${(error && error.message) || error}, filename ${originalFilename}`)
      throw new Error(validationMessages.parsingError)
    }
  }

  return {
    loadAndParseCsvFile,
  }
}

module.exports = {
  csvParserService,
  validationMessages,
}
