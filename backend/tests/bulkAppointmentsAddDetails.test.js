const moment = require('moment')
const { bulkAppointmentsAddDetailsFactory } = require('../controllers/appointments/bulkAppointmentsAddDetails')
const { serviceUnavailableMessage } = require('../common-messages')
const { repeatTypes } = require('../shared/appointmentConstants')

const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } = require('../../src/dateHelpers')

const buildBodyForDate = date => {
  const startTime = moment().add(1, 'hours')
  const endTime = moment().add(2, 'hours')

  return {
    date,
    startTimeHours: startTime.hours(),
    startTimeMinutes: startTime.minutes(),
    endTimeHours: endTime.hours(),
    endTimeMinutes: endTime.minutes(),
    appointmentType: 'app1',
    location: 1,
    sameTimeAppointments: 'no',
    times: undefined,
    recurring: 'no',
    repeatTypes,
  }
}

describe('Add appointment details controller', () => {
  const appointmentsService = {}
  const oauthApi = {}
  const context = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
        data: {},
      },
    }
    res = { locals: {} }
    res.render = jest.fn()

    appointmentsService.getAppointmentOptions = jest.fn()
    oauthApi.currentUser = jest.fn()
    logError = jest.fn()

    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [],
      locationTypes: [],
    })

    controller = bulkAppointmentsAddDetailsFactory(appointmentsService, oauthApi, logError)
  })

  describe('Index', () => {
    it('should make a call to the bulk appointment service', async () => {
      const now = moment().format(DATE_TIME_FORMAT_SPEC)

      req.body = {
        agency: 'LEI',
        appointmentType: 'App',
        location: 2,
        sameTimeAppointments: 'yes',
        date: now,
        startTime: now,
      }

      await controller.index(req, res)

      expect(appointmentsService.getAppointmentOptions).toHaveBeenCalledWith(context, 'LEI')
    })

    it('should return handle api errors', async () => {
      appointmentsService.getAppointmentOptions.mockImplementation(() => Promise.reject(new Error('Network error')))

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', {
        url: 'http://localhost',
      })

      expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
    })

    it('should render template with view model', async () => {
      appointmentsService.getAppointmentOptions.mockReturnValue({
        appointmentTypes: [{ value: 'app1', text: 'app1' }, { value: 2, text: 'app2' }],
        locationTypes: [{ value: 1, text: 'loc1' }, { value: 2, text: 'loc2' }],
      })

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('bulkAppointmentsAddDetails.njk', {
        ...buildBodyForDate(moment()),
        appointmentType: undefined,
        comments: undefined,
        date: undefined,
        endTimeHours: '',
        endTimeMinutes: '',
        location: undefined,
        repeats: undefined,
        sameTimeAppointments: undefined,
        recurring: undefined,
        startTimeHours: '',
        startTimeMinutes: '',
        title: 'Add appointment details',
        appointmentTypes: [{ value: 'app1', text: 'app1' }, { value: 2, text: 'app2' }],
        locations: [{ value: 1, text: 'loc1' }, { value: 2, text: 'loc2' }],
        homeUrl: 'http://localhost:3000/',
      })
    })

    it('should render template with the contents of session data when available', async () => {
      const now = moment().add(1, 'days')

      req.render = jest.fn()
      req.session.data = {
        appointmentType: 'app1',
        location: 1,
        date: now.format(DAY_MONTH_YEAR),
        startTime: now
          .hour(1)
          .minutes(30)
          .format(DATE_TIME_FORMAT_SPEC),
        endTime: now
          .hours(2)
          .minutes(33)
          .format(DATE_TIME_FORMAT_SPEC),
        sameTimeAppointments: 'yes',
        comments: 'test',
        times: 1,
        repeats: 'DAILY',
        recurring: 'yes',
      }

      appointmentsService.getAppointmentOptions.mockReturnValue({
        appointmentTypes: [{ value: 'app1', text: 'app1' }, { value: 2, text: 'app2' }],
        locationTypes: [{ value: 1, text: 'loc1' }, { value: 2, text: 'loc2' }],
      })

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('bulkAppointmentsAddDetails.njk', {
        ...buildBodyForDate(now),
        appointmentType: 'app1',
        appointmentTypes: [{ text: 'app1', value: 'app1' }, { text: 'app2', value: 2 }],
        comments: 'test',
        date: now.format(DAY_MONTH_YEAR),
        endTimeHours: '02',
        endTimeMinutes: '33',
        homeUrl: 'http://localhost:3000/',
        location: 1,
        locations: [{ text: 'loc1', value: 1 }, { text: 'loc2', value: 2 }],
        sameTimeAppointments: 'yes',
        startTimeHours: '01',
        startTimeMinutes: '30',
        title: 'Add appointment details',
        times: 1,
        repeats: 'DAILY',
        recurring: 'yes',
      })
    })
  })

  describe('Post', () => {
    describe('Form validation', () => {
      it('should return a required fields validation messages', async () => {
        req.body = {
          sameTimeAppointments: 'yes',
          recurring: 'yes',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            homeUrl: 'http://localhost:3000/',
            errors: [
              { href: '#appointment-type', text: 'Select an appointment type' },
              { href: '#location', text: 'Select a location' },
              { href: '#date', text: 'Select a date' },
              { href: '#start-time-hours', text: 'Select a start time' },
              { href: '#repeats', text: 'Select a period' },
              { href: '#times', text: 'Enter the number of appointments using numbers only' },
            ],
          })
        )
      })

      it('should return validation messages for start times being in the past', async () => {
        const date = moment().format(DAY_MONTH_YEAR)
        const startTime = moment().subtract(5, 'minutes')

        const startTimeHours = startTime.hour()
        const startTimeMinutes = startTime.minute()

        req.body = {
          appointmentType: 'App',
          location: 2,
          sameTimeAppointments: 'yes',
          recurring: 'no',
          date,
          startTimeHours,
          startTimeMinutes,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [{ text: 'Select a start time that is not in the past', href: '#start-time-hours' }],
          })
        )
      })

      it('should only care about start times being in the past if the date is today', async () => {
        res.redirect = jest.fn()

        const date = moment()
          .add(1, 'day')
          .format(DAY_MONTH_YEAR)
        const startTime = moment().subtract(5, 'minutes')

        const startTimeHours = startTime.hour()
        const startTimeMinutes = startTime.minute()

        req.body = {
          appointmentType: 'App',
          location: 2,
          sameTimeAppointments: 'yes',
          recurring: 'no',
          date,
          startTimeHours,
          startTimeMinutes,
        }

        await controller.post(req, res)

        expect(res.redirect).toHaveBeenCalled()
      })

      it('should validate that the end time comes after the start time', async () => {
        const endTime = moment().subtract(2, 'hours')
        const endTimeHours = endTime.hour()
        const endTimeMinutes = endTime.minute()

        const startTime = moment().add(5, 'minutes')
        const startTimeHours = startTime.hour()
        const startTimeMinutes = startTime.minute()

        req.body = {
          location: 2,
          appointmentType: 'app1',
          date: moment().format(DAY_MONTH_YEAR),
          startTimeHours,
          startTimeMinutes,
          endTimeHours,
          endTimeMinutes,
          sameTimeAppointments: 'yes',
          recurring: 'no',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [{ text: 'Select an end time that is not in the past', href: '#end-time-hours' }],
          })
        )
      })

      it('should validate maximum length of comments', async () => {
        const comments = [...Array(3601).keys()].map(_ => 'A').join('')

        req.body = {
          date: moment().format(DAY_MONTH_YEAR),
          startTimeHours: moment()
            .add(1, 'hours')
            .hours(),
          startTimeMinutes: '00',
          appointmentType: 'app1',
          location: 1,
          sameTimeAppointments: 'yes',
          recurring: 'no',
          comments,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [{ href: '#comments', text: 'Maximum length should not exceed 3600 characters' }],
          })
        )
      })

      it('should validate that date is in the correct format', async () => {
        req.body = {
          date: moment().format(DATE_TIME_FORMAT_SPEC),
          startTimeHours: moment()
            .add(1, 'hours')
            .hours(),
          startTimeMinutes: '00',
          appointmentType: 'app1',
          location: 1,
          sameTimeAppointments: 'yes',
          recurring: 'no',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [{ href: '#date', text: 'Enter a date in DD/MM/YYYY format' }],
          })
        )
      })

      it('should validate against past dates', async () => {
        appointmentsService.getAppointmentOptions.mockReturnValue({
          appointmentTypes: [{ value: 'app1', text: 'appointment 1' }],
          locationTypes: [{ value: 1, text: 'location 1' }],
        })

        req.body = {
          date: moment()
            .subtract(1, 'days')
            .format(DAY_MONTH_YEAR),
          startTimeHours: '00',
          startTimeMinutes: '00',
          appointmentType: 'app1',
          location: 1,
          sameTimeAppointments: 'yes',
          recurring: 'no',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [{ href: '#date', text: 'Select a date that is not in the past' }],
          })
        )
      })

      it('should only validate start and end time when "Yes" has been selected', async () => {
        res.redirect = jest.fn()
        appointmentsService.getAppointmentOptions.mockReturnValue({
          appointmentTypes: [{ value: 'app1', text: 'appointment 1' }],
          locationTypes: [{ value: 1, text: 'location 1' }],
        })

        req.body = {
          date: moment().format(DAY_MONTH_YEAR),
          appointmentType: 'app1',
          location: 1,
          sameTimeAppointments: 'no',
          recurring: 'no',
        }

        await controller.post(req, res)

        expect(res.redirect).toHaveBeenCalled()
      })

      it('should only validate times and repeats when recurring is "Yes"', async () => {
        res.redirect = jest.fn()

        req.body = {
          date: moment().format(DAY_MONTH_YEAR),
          appointmentType: 'app1',
          location: 1,
          sameTimeAppointments: 'no',
          recurring: 'no',
        }

        await controller.post(req, res)

        expect(res.redirect).toHaveBeenCalled()
      })

      it('should return a error message when daily x times days exceeds 1 year', async () => {
        const date = moment().endOf('day')
        const yearAndDay = moment()
          .endOf('day')
          .add('1', 'year')
          .add(2, 'days')

        const days = Math.abs(date.diff(yearAndDay, 'days', true))

        req.body = {
          ...buildBodyForDate(date),
          startTime: date,
          recurring: 'yes',
          repeats: 'DAILY',
          times: days,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [
              {
                text: 'Select fewer number of appointments - you can only add them for a maximum of 1 year',
                href: '#times',
              },
            ],
          })
        )
      })

      it('should return an error message when date is on a Saturday', async () => {
        const date = moment().day('Saturday')

        req.body = {
          ...buildBodyForDate(date),
          date: date.format(DAY_MONTH_YEAR),
          recurring: 'yes',
          times: 1,
          repeats: 'WEEKDAYS',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [{ text: 'The date must be a week day', href: '#date' }],
          })
        )
      })

      it('should return an error message when date is on a Sunday', async () => {
        const date = moment()
          .day('SUNDAY')
          .add(1, 'week')

        req.body = {
          ...buildBodyForDate(date),
          date: date.format(DAY_MONTH_YEAR),
          recurring: 'yes',
          repeats: 'WEEKDAYS',
          times: 1,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [{ text: 'The date must be a week day', href: '#date' }],
          })
        )
      })

      it('should return an error when weekdays x working days exceeds 1 year', async () => {
        const date = moment('3014-04-25T01:32:21.196Z')

        req.body = {
          ...buildBodyForDate(date),
          startTime: date,
          recurring: 'yes',
          repeats: 'WEEKDAYS',
          times: 400,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [
              {
                text: 'Select fewer number of appointments - you can only add them for a maximum of 1 year',
                href: '#times',
              },
            ],
          })
        )
      })

      it('should validate that occurrences is larger than zero', async () => {
        req.body = {
          ...buildBodyForDate(moment('3014-04-25T01:32:21.196Z')),
          recurring: 'yes',
          repeats: 'WEEKDAYS',
          times: '-1',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [{ text: 'Enter the number of appointments using numbers only', href: '#times' }],
          })
        )
      })

      it('should validate missing answer for same time appointments', async () => {
        res.render = jest.fn()

        req.body = {
          date: moment().format(DAY_MONTH_YEAR),
          appointmentType: 'ap1',
          location: 1,
          recurring: 'yes',
          repeats: 'DAILY',
          times: 1,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [
              { href: '#same-time-appointments', text: 'Select yes if the appointments all have the same time' },
            ],
          })
        )
      })

      it('should validate missing answer for recurring appointments', async () => {
        res.render = jest.fn()

        req.body = {
          date: moment().format(DAY_MONTH_YEAR),
          appointmentType: 'ap1',
          location: 1,
          sameTimeAppointments: 'no',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            errors: [{ href: '#recurring', text: 'Select yes if these are recurring appointments' }],
          })
        )
      })
    })

    describe('Form', () => {
      it('should store the appointment details into session', async () => {
        res.redirect = jest.fn()
        appointmentsService.getAppointmentOptions.mockReturnValue({
          appointmentTypes: [{ value: 'app1', text: 'appointment 1' }],
          locationTypes: [{ value: 1, text: 'location 1' }],
        })

        const date = moment('3014-04-25T01:32:21.196Z')
        const startTime = date.add(1, 'hours').seconds(0)
        const endTime = date.add(2, 'hours').seconds(0)

        req.body = {
          date: date.format(DAY_MONTH_YEAR),
          startTimeHours: startTime.hours(),
          startTimeMinutes: startTime.minutes(),
          endTimeHours: endTime.hours(),
          endTimeMinutes: endTime.minutes(),
          appointmentType: 'app1',
          location: 1,
          sameTimeAppointments: 'yes',
          recurring: 'yes',
          times: 1,
          repeats: 'DAILY',
          comments: 'test',
        }

        await controller.post(req, res)

        expect(req.session.data).toEqual({
          location: 1,
          locationDescription: 'location 1',
          appointmentType: 'app1',
          appointmentTypeDescription: 'appointment 1',
          date: date.format(DAY_MONTH_YEAR),
          startTime: startTime.format(DATE_TIME_FORMAT_SPEC),
          endTime: endTime.format(DATE_TIME_FORMAT_SPEC),
          sameTimeAppointments: 'yes',
          recurring: 'yes',
          times: 1,
          repeatsText: 'Daily',
          repeats: 'DAILY',
          comments: 'test',
          endOfPeriod: date.format('dddd D MMMM YYYY'),
        })

        expect(res.redirect).toHaveBeenCalledWith('/bulk-appointments/upload-file')
      })

      it('it should only store time and recurring data into session when correct args are passed', async () => {
        res.redirect = jest.fn()
        appointmentsService.getAppointmentOptions.mockReturnValue({
          appointmentTypes: [{ value: 'app1', text: 'appointment 1' }],
          locationTypes: [{ value: 1, text: 'location 1' }],
        })

        const date = moment().format(DAY_MONTH_YEAR)

        req.body = {
          date,
          appointmentType: 'app1',
          location: 1,
          sameTimeAppointments: 'no',
          recurring: 'no',
          comments: 'test',
        }

        await controller.post(req, res)

        expect(req.session.data).toEqual({
          location: 1,
          locationDescription: 'location 1',
          appointmentType: 'app1',
          appointmentTypeDescription: 'appointment 1',
          date,
          sameTimeAppointments: 'no',
          repeats: undefined,
          recurring: 'no',
          comments: 'test',
        })
      })

      it('should return handle api errors', async () => {
        appointmentsService.getAppointmentOptions.mockImplementation(() => Promise.reject(new Error('Network error')))

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('error.njk', {
          url: 'http://localhost',
        })

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
      })

      it('should return selected location and appointment type', async () => {
        appointmentsService.getAppointmentOptions.mockReturnValue({
          appointmentTypes: [{ value: 'app1', text: 'appointment 1' }, { value: 'app2', text: 'appointment 2' }],
          locationTypes: [{ value: 1, text: 'location 1' }, { value: 2, text: 'location 2' }],
        })

        req.body = {
          appointmentType: 'app2',
          location: 2,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'bulkAppointmentsAddDetails.njk',
          expect.objectContaining({
            appointmentTypes: [
              { text: 'appointment 1', value: 'app1' },
              { selected: true, text: 'appointment 2', value: 'app2' },
            ],
            locations: [{ text: 'location 1', value: 1 }, { selected: true, text: 'location 2', value: 2 }],
          })
        )
      })

      it('should ignore the previously selected start and end time of "no" has been selected', async () => {
        appointmentsService.getAppointmentOptions.mockReturnValue({
          appointmentTypes: [{ value: 'app1', text: 'appointment 1' }],
          locationTypes: [{ value: 1, text: 'location 1' }],
        })

        const now = moment().add(1, 'days')

        req.body = {
          appointmentType: 'app1',
          location: 1,
          date: now.format(DAY_MONTH_YEAR),
          startTimeHours: '10',
          startTimeMinutes: '05',
          endTimeHours: '10',
          endTimeMinute: '20',
          sameTimeAppointments: 'no',
          recurring: 'no',
        }

        await controller.post(req, res)

        expect(req.session.data).toEqual({
          appointmentType: 'app1',
          appointmentTypeDescription: 'appointment 1',
          comments: undefined,
          date: now.format(DAY_MONTH_YEAR),
          endTime: undefined,
          location: 1,
          locationDescription: 'location 1',
          sameTimeAppointments: 'no',
          recurring: 'no',
          startTime: undefined,
        })
      })
    })
  })
})
