import { parseCsvData, CsvParseError } from '../csv-parser'

describe('csv-parser', () => {
  it.skip('should throw a CSV Parser exception with a line count error', done => {
    const csvData = `
        A111111, 14:00
        A222222         
        `
    parseCsvData(csvData).catch(error => {
      expect(error.name).toBe(CsvParseError.name)
      expect(error.Error).toBe('Error: Invalid Record Length: expect 2, got 1 online 3')
      done()
    })
  })
})
