import config from '../config'
import { csvParserService, validationMessages } from '../csv-parser'

describe('csv-parser', () => {
  const fs = {}
  let isBinaryFileSync

  beforeEach(() => {
    isBinaryFileSync = jest.fn()
    fs.lstatSync = jest.fn()
    fs.readFileSync = jest.fn()
  })

  it('should return a validation error on exceeding maximum file size', done => {
    fs.lstatSync.mockReturnValue({ size: config.app.maximumFileUploadSizeInMb * 1000001 })
    const service = csvParserService({ fs, isBinaryFileSync })

    service.loadAndParseCsvFile({}).catch(error => {
      expect(error.message).toBe(validationMessages.maxFileSizeReached)
      done()
    })
  })

  it('should return return a validation error on unsupported file type', done => {
    isBinaryFileSync.mockReturnValue(true)
    fs.lstatSync.mockReturnValue({ size: 2 })

    const service = csvParserService({ fs, isBinaryFileSync })

    service.loadAndParseCsvFile({}).catch(error => {
      expect(error.message).toBe(validationMessages.invalidFile)
      done()
    })
  })

  it('should return a validation error where no file has been input', done => {
    fs.lstatSync.mockReturnValue({ size: 0 })
    const service = csvParserService({ fs, isBinaryFileSync })

    service.loadAndParseCsvFile({}).catch(error => {
      expect(error.message).toBe(validationMessages.noFileInput)
      done()
    })
  })

  it('should return return a validation error if the file added has no records input', done => {
    isBinaryFileSync.mockReturnValue(true)
    fs.lstatSync.mockReturnValue({ size: 0 })

    const service = csvParserService({ fs, isBinaryFileSync })

    service.loadAndParseCsvFile({ path: '/path/to/cvs', originalFilename: 'fileName.csv' }).catch(error => {
      expect(error.message).toBe(validationMessages.noFileContent)
      done()
    })
  })

  it('should handle errors from readFile', done => {
    isBinaryFileSync.mockReturnValue(false)
    fs.lstatSync.mockReturnValue({ size: 2 })
    fs.readFile = (path, callback) => {
      callback('Parsing error')
    }

    const service = csvParserService({ fs, isBinaryFileSync })

    service.loadAndParseCsvFile({}).catch(error => {
      expect(error.message).toBe(validationMessages.parsingError)
      done()
    })
  })

  it('should return parsing errors', done => {
    isBinaryFileSync.mockReturnValue(false)
    fs.lstatSync.mockReturnValue({ size: 2 })
    fs.readFileSync = jest.fn()

    fs.readFile = (path, callback) => {
      callback(null, null)
    }

    const service = csvParserService({ fs, isBinaryFileSync })

    service.loadAndParseCsvFile({}).catch(error => {
      expect(error.message).toBe(validationMessages.parsingError)
      done()
    })
  })

  it('should return the result from parse', done => {
    isBinaryFileSync.mockReturnValue(false)
    fs.lstatSync.mockReturnValue({ size: 2 })
    fs.readFileSync = jest.fn()

    fs.readFile = (path, callback) => {
      callback(null, `A12345\n`)
    }

    const service = csvParserService({ fs, isBinaryFileSync })

    service.loadAndParseCsvFile({}).then(result => {
      expect(result).toEqual([['A12345']])
      done()
    })
  })
})
