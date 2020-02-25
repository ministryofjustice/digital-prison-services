const { buildDateTime, DATE_TIME_FORMAT_SPEC } = require('../../src/dateHelpers')

describe('Date helpers', () => {
  it('should return a valid date time', () => {
    const dateTime = buildDateTime({ date: '2010-12-10', hours: 0, minutes: 0 })
    expect(dateTime.format(DATE_TIME_FORMAT_SPEC)).toEqual('2012-10-20T00:00:00')
  })
})
