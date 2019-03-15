import moment from 'moment'
import RecurringAppointments from './RecurringAppointments'

describe('Recurring appointments', () => {
  it('should calculate the end date for 10 days ( Monday to Friday)', () => {
    const repeats = 'WEEKDAYS'
    const startTime = moment('2019-01-30')
    const numberOfTimes = 4

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-02-05')
  })

  it('should calculate the end dae for 10 weeks', () => {
    const repeats = 'WEEKLY'
    const startTime = moment('2019-01-30')
    const numberOfTimes = 10

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-04-10')
  })

  it('should calculate end date for 10 fortnights', () => {
    const repeats = 'FORTNIGHTLY'
    const startTime = moment('2019-01-30')
    const numberOfTimes = 10

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-06-19')
  })

  it('should calculate end date for 10 months', () => {
    const repeats = 'MONTHLY'
    const startTime = moment('2019-01-31')
    const numberOfTimes = 10

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-11-30')
  })

  it('should calculate end date for 60 days', () => {
    const repeats = 'DAILY'
    const startTime = moment('2019-01-31')
    const numberOfTimes = 60

    const endDate = RecurringAppointments.calculateEndDate({ startTime, repeats, numberOfTimes })

    expect(endDate.format('YYYY-MM-DD')).toBe('2019-04-01')
  })
})
