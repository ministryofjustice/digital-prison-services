const parse = require('csv-parse')
const config = require('./config')
const logger = require('./log')

const validationMessages = {
  invalidFile: 'There was a problem importing your file, please use the template provided',
  maxFileSizeReached: `The csv is too large. Maximum file size is ${config.app.maximumFileUploadSizeInMb}MB`,
}

const csvParserService = ({ fs, isBinaryFileSync }) => {
  const parseCsvData = async data => {
    const output = []

    const parser = parse(data, { trim: true, skip_empty_lines: true }).on('readable', function() {
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
      throw new Error('There was a problem importing your file, please use the template provided')
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
