import {
  capitalize,
  properCaseName,
  mapToQueryString,
  formatDaysInYears,
  formatMonthsAndDays,
  formatTimestampToDateTime,
  formatTimestampToDate,
  formatName,
} from './utils'

describe('capitalize()', () => {
  describe('when a string IS NOT provided', () => {
    it('should return an empty string', () => {
      expect(capitalize()).toEqual('')
      expect(capitalize(['array item 1, array item 2'])).toEqual('')
      expect(capitalize({ key: 'value' })).toEqual('')
      expect(capitalize(1)).toEqual('')
    })
  })

  describe('when a string IS provided', () => {
    it('should handle uppercased strings', () => {
      expect(capitalize('HOUSEBLOCK 1')).toEqual('Houseblock 1')
    })

    it('should handle lowercased strings', () => {
      expect(capitalize('houseblock 1')).toEqual('Houseblock 1')
    })

    it('should handle multiple word strings', () => {
      expect(capitalize('Segregation Unit')).toEqual('Segregation unit')
    })
  })
})

describe('properCaseName', () => {
  it('null string', () => {
    expect(properCaseName(null)).toEqual('')
  })
  it('empty string', () => {
    expect(properCaseName('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(properCaseName('bob')).toEqual('Bob')
  })
  it('Mixed Case', () => {
    expect(properCaseName('GDgeHHdGr')).toEqual('Gdgehhdgr')
  })
  it('Multiple words', () => {
    expect(properCaseName('BOB SMITH')).toEqual('Bob smith')
  })
  it('Hyphenated', () => {
    expect(properCaseName('MONTGOMERY-FOSTER-SMYTH-WALLACE-BOB')).toEqual('Montgomery-Foster-Smyth-Wallace-Bob')
  })
})

describe('mapToQueryParams', () => {
  it('should handle empty maps', () => {
    expect(mapToQueryString({})).toEqual('')
  })

  it('should handle single key values', () => {
    expect(mapToQueryString({ key1: 'val' })).toEqual('key1=val')
  })

  it('should handle non-string, scalar values', () => {
    expect(mapToQueryString({ key1: 1, key2: true })).toEqual('key1=1&key2=true')
  })

  it('should ignore null values', () => {
    expect(mapToQueryString({ key1: 1, key2: null })).toEqual('key1=1')
  })

  it('should handle encode values', () => {
    expect(mapToQueryString({ key1: "Hi, I'm here" })).toEqual("key1=Hi%2C%20I'm%20here")
  })
})

describe('formatDaysInYears', () => {
  it('should return correct string when more than one days and years present', () => {
    expect(formatDaysInYears(812)).toEqual('2 years, 82 days')
  })

  it('should return correct string when 1 year and 1 day', () => {
    expect(formatDaysInYears(366)).toEqual('1 year, 1 day')
  })

  it('should return correct string when 0 years and multiple days', () => {
    expect(formatDaysInYears(250)).toEqual('250 days')
  })

  it('should return correct string when multiple years and no days', () => {
    expect(formatDaysInYears(365 * 2)).toEqual('2 years')
  })
})

describe('formatMonthsAndDay', () => {
  it('should return correct string when no years or days', () => {
    expect(formatMonthsAndDays(null, null)).toEqual('')
    expect(formatMonthsAndDays(0, 0)).toEqual('')
  })

  it('should return correct string when 1 month and no days', () => {
    expect(formatMonthsAndDays(1, 0)).toEqual('1 month')
  })

  it('should return correct string when multiple month and no days', () => {
    expect(formatMonthsAndDays(2, 0)).toEqual('2 months')
  })

  it('should return correct string when 1 day and no months', () => {
    expect(formatMonthsAndDays(0, 1)).toEqual('1 day')
  })

  it('should return correct string when multiple days and no months', () => {
    expect(formatMonthsAndDays(0, 2)).toEqual('2 days')
  })

  it('should return correct string when 1 month and 1 day', () => {
    expect(formatMonthsAndDays(1, 1)).toEqual('1 month, 1 day')
  })

  it('should return correct string when multiple months and multiple days', () => {
    expect(formatMonthsAndDays(3, 23)).toEqual('3 months, 23 days')
  })
})

describe('formatTimestampToDate', () => {
  it('should format timestamp to date', () => {
    expect(formatTimestampToDate('2018-12-23T13:21')).toEqual('23/12/2018')
  })
  it('should not fail to parse absent timestamp', () => {
    expect(formatTimestampToDate(undefined)).toEqual(undefined)
  })
})

describe('formatTimestampToDateTime', () => {
  it('should format timestamp to date time', () => {
    expect(formatTimestampToDateTime('2018-12-23T13:21')).toEqual('23/12/2018 - 13:21')
  })
  it('should not fail to parse absent timestamp', () => {
    expect(formatTimestampToDateTime(undefined)).toEqual(undefined)
  })
})

describe('formatName', () => {
  it('Can format name', () => {
    expect(formatName('bob', 'smith')).toEqual('Bob Smith')
  })
  it('can format first name only', () => {
    expect(formatName('BOB', '')).toEqual('Bob')
  })
  it('can format last name only', () => {
    expect(formatName(undefined, 'Smith')).toEqual('Smith')
  })
  it('can format empty name', () => {
    expect(formatName('', '')).toEqual('')
  })
  it('can format no name', () => {
    expect(formatName(undefined, undefined)).toEqual('')
  })
})
