const { buildDateTime, DATE_TIME_FORMAT_SPEC } = require('../../src/dateHelpers')

describe('Date helpers', () => {
  it('should return a valid date time with 0 as hours and minutes', () => {
    const dateTime = buildDateTime({ date: '2010-12-10', hours: 0, minutes: 0 })
    expect(dateTime.format(DATE_TIME_FORMAT_SPEC)).toEqual('2012-10-20T00:00:00')
  })

  it('should return a valid date time with strings as params ', () => {
    const dateTime = buildDateTime({ date: '2010-12-10', hours: '00', minutes: '00' })
    expect(dateTime.format(DATE_TIME_FORMAT_SPEC)).toEqual('2012-10-20T00:00:00')
  })

  it('should handle empty string', () => {
    const dateTime = buildDateTime({ date: '2010-12-10', hours: '', minutes: '' })
    expect(dateTime).toEqual('')
  })
})
