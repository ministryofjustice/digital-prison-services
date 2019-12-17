const moment = require('moment')
const { addAppointmentFactory } = require('../controllers/addAppointment')
const config = require('../config')
const { DAY_MONTH_YEAR } = require('../../src/dateHelpers')
const { serviceUnavailableMessage } = require('../common-messages')
const { repeatTypes } = require('../shared/appointmentConstants')

config.app.notmEndpointUrl = '//dpsUrl/'

describe('Add appointment', () => {
  const elite2Api = {}
  const appointmentsService = {}
  const existingEventsService = {}
  const offenderNo = 'ABC123'
  const bookingId = 123

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      body: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
        data: {},
      },
      params: {},
      flash: jest.fn(),
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    logError = jest.fn()

    appointmentsService.getAppointmentOptions = jest.fn()
    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [],
      locationTypes: [],
    })

    existingEventsService.getExistingEventsForOffender = jest.fn()

    elite2Api.getDetails = jest.fn()
    elite2Api.addAppointments = jest.fn()

    controller = addAppointmentFactory(appointmentsService, existingEventsService, elite2Api, logError)
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      beforeEach(() => {
        req.params.offenderNo = offenderNo
        elite2Api.getDetails.mockReturnValue({
          bookingId,
          firstName: 'BARRY',
          lastName: 'SMITH',
        })
      })

      it('should make the correct calls for information and render the correct template', async () => {
        await controller.index(req, res)

        expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
        expect(appointmentsService.getAppointmentOptions).toHaveBeenCalledWith(res.locals, 'LEI')
        expect(res.render).toHaveBeenCalledWith('addAppointment/addAppointment.njk', {
          bookingId,
          offenderNo,
          appointmentLocations: [],
          appointmentTypes: [],
          errors: undefined,
          dpsUrl: 'http://localhost:3000/',
          offenderName: 'Smith, Barry',
          repeatTypes,
        })
      })
    })

    describe('when there are API errors', () => {
      beforeEach(() => {
        req.params.offenderNo = offenderNo
        elite2Api.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))
      })

      it('should render the error template', async () => {
        await controller.index(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: `http://localhost:3000/offenders/${offenderNo}` })
      })
    })
  })

  describe('post', () => {
    const validBody = {
      appointmentType: 'APT1',
      location: '1',
      date: moment().format(DAY_MONTH_YEAR),
      startTimeHours: '01',
      startTimeMinutes: '00',
      endTimeHours: '02',
      endTimeMinutes: '00',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      comments: 'Test comment',
      bookingId,
    }

    beforeEach(() => {
      req.params.offenderNo = offenderNo
      elite2Api.getDetails.mockReturnValue({
        bookingId,
        firstName: 'BARRY',
        lastName: 'SMITH',
      })
    })

    describe('when there are no errors', () => {
      it('should submit the appointment with the correct details and redirect', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 33103209600000) // Friday 3019-01-01T00:00:00.000Z
        req.body = { ...validBody, date: moment().format(DAY_MONTH_YEAR) }
        req.flash = jest.fn()
        elite2Api.addAppointments = jest.fn().mockReturnValue('All good')

        await controller.post(req, res)

        expect(elite2Api.addAppointments).toHaveBeenCalledWith(res.locals, {
          appointmentDefaults: {
            appointmentType: 'APT1',
            locationId: 1,
            startTime: '3019-01-01T01:00:00',
            endTime: '3019-01-01T02:00:00',
            comment: 'Test comment',
          },
          appointments: [
            {
              bookingId,
            },
          ],
          repeat: {
            count: '1',
            repeatPeriod: 'DAILY',
          },
        })
        expect(res.redirect).toHaveBeenCalledWith(`/offenders/${offenderNo}/confirm-appointment`)
        expect(req.flash).toHaveBeenCalledWith('appointmentDetails', {
          appointmentType: 'APT1',
          bookingId: 123,
          locationId: 1,
          startTime: '3019-01-01T01:00:00',
          endTime: '3019-01-01T02:00:00',
          comment: 'Test comment',
          recurring: 'yes',
          times: '1',
          repeats: 'DAILY',
        })

        Date.now.mockRestore()
      })
    })

    describe('when there are API errors', () => {
      it('should render the error template', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 33103209600000) // Friday 3019-01-01T00:00:00.000Z
        req.body = { ...validBody, date: moment().format(DAY_MONTH_YEAR) }
        elite2Api.addAppointments.mockImplementation(() => Promise.reject(new Error('Network error')))

        await controller.post(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: `http://localhost:3000/offenders/${offenderNo}` })

        Date.now.mockRestore()
      })
    })

    describe('when there are form errors', () => {
      beforeEach(() => {
        req.params.offenderNo = offenderNo
        elite2Api.getDetails.mockReturnValue({
          bookingId,
          firstName: 'BARRY',
          lastName: 'SMITH',
        })
      })

      it('should validate and check for missing required fields', async () => {
        req.body = {
          recurring: 'yes',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
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

      it('should validate missing answer for a recurring appointment', async () => {
        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { href: '#recurring', text: 'Select yes if this is a recurring appointment' },
            ]),
          })
        )
      })

      it('should return validation messages for start times being in the past', async () => {
        const date = moment().format(DAY_MONTH_YEAR)
        const startTime = moment().subtract(5, 'minutes')
        const startTimeHours = startTime.hour()
        const startTimeMinutes = startTime.minute()

        req.body = {
          date,
          startTimeHours,
          startTimeMinutes,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { text: 'Select a start time that is not in the past', href: '#start-time-hours' },
            ]),
          })
        )
      })

      it('should validate that the end time comes after the start time', async () => {
        const endTime = moment().subtract(2, 'hours')
        const endTimeHours = endTime.hour()
        const endTimeMinutes = endTime.minute()

        const startTime = moment().add(5, 'minutes')
        const startTimeHours = startTime.hour()
        const startTimeMinutes = startTime.minute()

        req.body = {
          date: moment().format(DAY_MONTH_YEAR),
          startTimeHours,
          startTimeMinutes,
          endTimeHours,
          endTimeMinutes,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { text: 'Select an end time that is not in the past', href: '#end-time-hours' },
            ]),
          })
        )
      })

      it('should validate maximum length of comments', async () => {
        req.body = {
          comments: [...Array(3601).keys()].map(_ => 'A').join(''),
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { href: '#comments', text: 'Maximum length should not exceed 3600 characters' },
            ]),
          })
        )
      })

      describe('and there are existing events for an offender', () => {
        it('still show the appointment clashes along with the validation messages', async () => {
          jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
          const offenderEvents = [
            { eventDescription: '**Court visit scheduled**' },
            {
              locationId: 2,
              eventDescription: 'Office 1 - An appointment',
              startTime: '12:00',
              endTime: '13:00',
            },
          ]
          const date = moment().format(DAY_MONTH_YEAR)
          const startTime = moment().subtract(5, 'minutes')
          const startTimeHours = startTime.hour()
          const startTimeMinutes = startTime.minute()

          req.body = {
            date,
            startTimeHours,
            startTimeMinutes,
          }

          existingEventsService.getExistingEventsForOffender.mockReturnValue(offenderEvents)

          await controller.post(req, res)

          expect(existingEventsService.getExistingEventsForOffender).toHaveBeenCalledWith(
            {},
            'LEI',
            '29/03/2019',
            'ABC123'
          )
          expect(res.render).toHaveBeenCalledWith(
            'addAppointment/addAppointment.njk',
            expect.objectContaining({
              errors: expect.arrayContaining([
                { text: 'Select a start time that is not in the past', href: '#start-time-hours' },
              ]),
              offenderEvents,
            })
          )
        })
      })
    })
  })
})
