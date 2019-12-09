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

    appointmentsService.getAppointmentOptions = jest.fn()
    logError = jest.fn()

    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [],
      locationTypes: [],
    })

    elite2Api.getDetails = jest.fn()
    elite2Api.addAppointments = jest.fn()

    controller = addAppointmentFactory(appointmentsService, elite2Api, logError)
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
        expect(res.render).toHaveBeenCalledWith('addAppointment.njk', {
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
    jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z

    const validBody = {
      appointmentType: 'APT1',
      appointmentLocation: '1',
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
    })

    describe('when there are no errors', () => {
      beforeEach(() => {
        elite2Api.addAppointments = jest.fn().mockReturnValue('All good')

        req.body = validBody
      })

      it('should submit the appointment with the correct details and redirect', async () => {
        await controller.post(req, res)

        expect(elite2Api.addAppointments).toHaveBeenCalledWith(res.locals, {
          appointmentDefaults: {
            appointmentType: 'APT1',
            locationId: 1,
            startTime: '2019-03-29T01:00:00',
            endTime: '2019-03-29T02:00:00',
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
        expect(res.redirect).toHaveBeenCalledWith(`http://localhost:3000/offenders/${offenderNo}?appointmentAdded=true`)
      })
    })

    describe('when there are API errors', () => {
      beforeEach(() => {
        req.body = validBody

        elite2Api.addAppointments.mockImplementation(() => Promise.reject(new Error('Network error')))
      })

      it('should render the error template', async () => {
        await controller.post(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: `http://localhost:3000/offenders/${offenderNo}` })
      })
    })
  })
})
