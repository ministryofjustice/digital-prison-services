import moment from 'moment'
import {
  getListSizeClass,
  getLongDateFormat,
  pascalToString,
  isWithinLastYear,
  isWithinLastWeek,
  getCurrentPeriod,
  isAfterToday,
  forenameToInitial,
  isWithinNextTwoWorkingDays,
} from './utils'

describe('getListSizeClass()', () => {
  it('should return empty-list if no list provided', () => {
    expect(getListSizeClass()).toEqual('empty-list')
  })

  it('should return empty-list if provided array is empty', () => {
    const list = []
    expect(getListSizeClass(list)).toEqual('empty-list')
  })

  it('should return small-list if provided array has less than 20 entries', () => {
    const list = new Array(19)
    expect(getListSizeClass(list)).toEqual('small-list')
  })

  it('should return medium-list if provided array has less than 40 entries', () => {
    const list = new Array(29)
    expect(getListSizeClass(list)).toEqual('medium-list')
  })

  it('should return large-list if provided array has 40 or more entries', () => {
    const list = new Array(39)
    expect(getListSizeClass(list)).toEqual('large-list')
  })

  it('should return extra-large-list if provided array has 40 or more entries', () => {
    const list = new Array(40)
    expect(getListSizeClass(list)).toEqual('extra-large-list')
  })
})

describe('getLongDateFormat()', () => {
  it('should return Todays date in the long format by default', () => {
    const todaysLongDate = moment().format('dddd Do MMMM')

    expect(getLongDateFormat()).toEqual(todaysLongDate)
    expect(getLongDateFormat('Today')).toEqual(todaysLongDate)
  })

  it('should return the provided date in the desired long format starting with day name', () => {
    expect(getLongDateFormat('28/11/2018')).toEqual('Wednesday 28th November')
  })
})

describe('pascalToString()', () => {
  it('should return a correctly formatted string', () => {
    expect(pascalToString('PascalCasedString')).toEqual('Pascal cased string')
  })
})

describe('isWithinLastYear()', () => {
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547424000000) // Sunday 2019-01-13T00:00:00.000
  })

  afterAll(() => {
    Date.now.mockRestore()
  })

  it('returns true if date is "Today"', () => {
    expect(isWithinLastYear('Today')).toBe(true)
  })

  it('returns true if date is within the past year', () => {
    expect(isWithinLastYear('13/01/2018')).toBe(true)
  })

  it('returns false if date is not within the past year', () => {
    expect(isWithinLastYear('12/01/2018')).toBe(false)
  })
})

describe('isWithinLastWeek()', () => {
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547424000000) // Sunday 2019-01-13T00:00:00.000
  })

  afterAll(() => {
    Date.now.mockRestore()
  })

  it('returns true if date is "Today"', () => {
    expect(isWithinLastWeek('Today')).toBe(true)
  })

  it('returns true if date is within the past week', () => {
    expect(isWithinLastWeek('8/01/2019')).toBe(true)
  })

  it('returns false if date is not within the past week', () => {
    expect(isWithinLastWeek('2/01/2019')).toBe(false)
  })
})

describe('getCurrentPeriod()', () => {
  it('returns AM if time is post midnight', () => {
    expect(getCurrentPeriod('2019-08-11T00:00:01.000')).toEqual('AM')
  })

  it('returns AM if time is pre 12 noon', () => {
    expect(getCurrentPeriod('2019-08-11T11:59:59.000')).toEqual('AM')
  })

  it('returns PM if time is post 12 noon and before 5PM', () => {
    expect(getCurrentPeriod('2019-08-11T16:59:59.000')).toEqual('PM')
  })

  it('returns ED if time is post 5pm and before midnight', () => {
    expect(getCurrentPeriod('2019-08-11T23:59:59.000')).toEqual('ED')
  })
})

describe('isAfterToday()', () => {
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547424000000) // Sunday 2019-01-13T00:00:00.000
  })

  afterAll(() => {
    Date.now.mockRestore()
  })

  it('returns false if date is "Today"', () => {
    expect(isAfterToday('Today')).toBe(false)
  })

  it('returns false if date is within the past week', () => {
    expect(isAfterToday('2/01/2019')).toBe(false)
  })

  it('returns true if date is AFTER day', () => {
    expect(isAfterToday('14/01/2019')).toBe(true)
  })

  it('returns true if date is within the next week', () => {
    expect(isAfterToday('19/01/2019')).toBe(true)
  })
})

describe.only('isWithinNextTwoWorkingDays()', () => {
  afterEach(() => {
    Date.now.mockRestore()
  })

  it('does not allow previous days', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547424000000) // Monday 2019-01-14T00:00:00.000Z
    expect(isWithinNextTwoWorkingDays('13/01/2019')).toBe(false)
  })

  it('allows Today', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547424000000) // Monday 2019-01-14T00:00:00.000Z
    expect(isWithinNextTwoWorkingDays('Today')).toBe(true)
    expect(isWithinNextTwoWorkingDays('14/01/2019')).toBe(true)
  })

  it('allow only the next 2 days if Today is a weekday', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547424000000) // Monday 2019-01-14T00:00:00.000Z
    expect(isWithinNextTwoWorkingDays('15/01/2019')).toBe(true)
    expect(isWithinNextTwoWorkingDays('16/01/2019')).toBe(true)
    expect(isWithinNextTwoWorkingDays('17/01/2019')).toBe(false)
  })

  it('allows only Friday and Monday if today is Thursday', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547683200000) // Thursday 2019-01-17T00:00:00.000Z
    expect(isWithinNextTwoWorkingDays('18/01/2019')).toBe(true)
    expect(isWithinNextTwoWorkingDays('21/01/2019')).toBe(true)
    expect(isWithinNextTwoWorkingDays('22/01/2019')).toBe(false)
  })

  it('allows only Monday and Tuesday if today is Friday', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547769600000) // Friday 2019-01-18T00:00:00.000Z
    expect(isWithinNextTwoWorkingDays('21/01/2019')).toBe(true)
    expect(isWithinNextTwoWorkingDays('22/01/2019')).toBe(true)
    expect(isWithinNextTwoWorkingDays('23/01/2019')).toBe(false)
  })

  it('allows only Monday and Tuesday if today is Saturday', () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1547856000000) // Saturday 2019-01-19T00:00:00.000Z
    expect(isWithinNextTwoWorkingDays('21/01/2019')).toBe(true)
    expect(isWithinNextTwoWorkingDays('22/01/2019')).toBe(true)
    expect(isWithinNextTwoWorkingDays('23/01/2019')).toBe(false)
  })
})

describe('forenameToInitial()', () => {
  it('should return a correctly formatted name', () => {
    expect(forenameToInitial('Test User')).toEqual('T User')
  })
})
