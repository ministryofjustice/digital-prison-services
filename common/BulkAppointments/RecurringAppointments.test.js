import moment from 'moment'
import RecurringAppointments from './RecurringAppointments'

describe('Recurring appointments', () => {
  it('should calculate the end date for 4 days ( Monday to Friday)', () => {
    const repeats = 'WEEKDAYS'
    const startTime = moment('2019-01-30')
    const numberOfTimes = 4

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-02-04')
  })

  it('should calculate the end dae for 2 weeks', () => {
    const repeats = 'WEEKLY'
    const startTime = moment('2019-01-30')
    const numberOfTimes = 2

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-02-06')
  })

  it('should calculate end date for 10 fortnights', () => {
    const repeats = 'FORTNIGHTLY'
    const startTime = moment('2019-01-30')
    const numberOfTimes = 10

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-06-05')
  })

  it('should calculate end date for 10 months', () => {
    const repeats = 'MONTHLY'
    const startTime = moment('2019-01-31')
    const numberOfTimes = 10

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-10-31')
  })

  it('should calculate end date for 7 days', () => {
    const repeats = 'DAILY'
    const startTime = moment('2019-03-19')
    const numberOfTimes = 7

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-03-25')
  })
})
