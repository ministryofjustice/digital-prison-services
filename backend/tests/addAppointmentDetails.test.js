const moment = require('moment')
const { addAppointmentDetailsFactory } = require('../controllers/addAppointmentDetails')
const { serviceUnavailableMessage } = require('../common-messages')

const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } = require('../../src/dateHelpers')

describe('Add appointment details controller', () => {
  const bulkAppointmentService = {}
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

    bulkAppointmentService.getBulkAppointmentsViewModel = jest.fn()
    oauthApi.currentUser = jest.fn()
    logError = jest.fn()

    bulkAppointmentService.getBulkAppointmentsViewModel.mockReturnValue({
      appointmentTypes: [],
      locationTypes: [],
    })

    controller = addAppointmentDetailsFactory(bulkAppointmentService, oauthApi, logError)
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

      expect(bulkAppointmentService.getBulkAppointmentsViewModel).toHaveBeenCalledWith(context, 'LEI')
    })

    it('should return handle api errors', async () => {
      bulkAppointmentService.getBulkAppointmentsViewModel.mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      )

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', {
        url: 'http://localhost',
      })

      expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
    })

    it('should render template with view model', async () => {
      bulkAppointmentService.getBulkAppointmentsViewModel.mockReturnValue({
        appointmentTypes: [{ id: 'app1', description: 'app1' }, { id: 2, description: 'app2' }],
        locationTypes: [{ id: 1, description: 'loc1' }, { id: 2, description: 'loc2' }],
      })
      const now = moment().format(DATE_TIME_FORMAT_SPEC)

      req.query = {
        agency: 'LEI',
        appointmentType: 'App',
        location: 2,
        sameTimeAppointments: 'yes',
        date: now,
        startTime: now,
      }

      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('addAppointmentDetails.njk', {
        appointmentTypes: [{ value: 'app1', text: 'app1' }, { value: 2, text: 'app2' }],
        locations: [{ value: 1, text: 'loc1' }, { value: 2, text: 'loc2' }],
      })
    })
  })

  describe('Post', () => {
    it('should return a required fields validation messages', async () => {
      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith('addAppointmentDetails.njk', {
        appointmentTypes: [],
        date: undefined,
        locations: [],
        sameTimeAppointments: undefined,
        errors: [
          { text: 'Select an appointment type', href: '#appointment-type' },
          { text: 'Select a location', href: '#location' },
          { text: 'Select a start time', href: '#start-time-hours' },
          { text: 'Select a date', href: '#date' },
          { text: 'Select yes if the appointments all have the same time', href: '#same-time-appointments' },
        ],
      })
    })

    it('should return validation messages for start times being in the past', async () => {
      const date = moment().format(DAY_MONTH_YEAR)
      const startTime = moment().add(-1, 'hours')

      const startTimeHours = startTime.hour()
      const startTimeMinutes = startTime.minute()

      req.body = {
        appointmentType: 'App',
        location: 2,
        sameTimeAppointments: 'yes',
        date,
        startTimeHours,
        startTimeMinutes,
      }

      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointmentDetails.njk',
        expect.objectContaining({
          errors: [{ text: 'Select a start time that is not in the past', href: '#start-time-hours' }],
        })
      )
    })

    it('should return selected location and appointment type', async () => {
      bulkAppointmentService.getBulkAppointmentsViewModel.mockReturnValue({
        appointmentTypes: [{ id: 'app1', description: 'appointment 1' }, { id: 'app2', description: 'appointment 2' }],
        locationTypes: [{ id: 1, description: 'location 1' }, { id: 2, description: 'location 2' }],
      })

      req.body = {
        appointmentType: 'app2',
        location: 2,
      }

      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointmentDetails.njk',
        expect.objectContaining({
          appointmentTypes: [
            { text: 'appointment 1', value: 'app1' },
            { selected: true, text: 'appointment 2', value: 'app2' },
          ],
          locations: [{ text: 'location 1', value: 1 }, { selected: true, text: 'location 2', value: 2 }],
        })
      )
    })

    it('should ensure that the end time comes after the start time', async () => {
      const endTime = moment().subtract(1, 'hours')
      const endTimeHours = endTime.hour()
      const endTimeMinutes = endTime.minute()

      const startTime = moment()
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
      }

      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointmentDetails.njk',
        expect.objectContaining({
          errors: [{ text: 'Select an end time that is not in the past', href: '#end-time-hours' }],
        })
      )
    })

    it('should validate maximum length of comments', async () => {
      const comments = [...Array(3601).keys()].map(_ => 'A').join('')

      req.body = {
        date: moment().format(DAY_MONTH_YEAR),
        startTimeHours: moment().add(1, 'hours'),
        startTimeMinutes: '00',
        appointmentType: 'app1',
        location: 1,
        sameTimeAppointments: 'yes',
        comments,
      }

      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointmentDetails.njk',
        expect.objectContaining({
          errors: [{ href: '#comments', text: 'Maximum length should not exceed 3600 characters' }],
        })
      )
    })

    it('should validate that date is in the correct format', async () => {
      req.body = {
        date: moment().format(DATE_TIME_FORMAT_SPEC),
        startTimeHours: moment().add(1, 'hours'),
        startTimeMinutes: '00',
        appointmentType: 'app1',
        location: 1,
        sameTimeAppointments: 'yes',
      }

      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointmentDetails.njk',
        expect.objectContaining({
          errors: [{ href: '#date', text: 'Enter a date in DD/MM/YYYY format' }],
        })
      )
    })

    it('should validate against past dates', async () => {
      res.redirect = jest.fn()
      bulkAppointmentService.getBulkAppointmentsViewModel.mockReturnValue({
        appointmentTypes: [{ id: 'app1', description: 'appointment 1' }],
        locationTypes: [{ id: 1, description: 'location 1' }],
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
      }

      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointmentDetails.njk',
        expect.objectContaining({
          errors: [{ href: '#date', text: 'Select a date that is not in the past' }],
        })
      )
    })

    it('should store the appointment details into session', async () => {
      const date = moment()
      const startTime = moment().add(1, 'hours')
      const endTime = moment().add(2, 'hours')

      res.redirect = jest.fn()

      bulkAppointmentService.getBulkAppointmentsViewModel.mockReturnValue({
        appointmentTypes: [{ id: 'app1', description: 'appointment 1' }],
        locationTypes: [{ id: 1, description: 'location 1' }],
      })

      req.body = {
        date,
        startTimeHours: startTime.hours(),
        startTimeMinutes: startTime.minutes(),
        endTimeHours: endTime.hours(),
        endTimeMinutes: endTime.minutes(),
        appointmentType: 'app1',
        location: 1,
        sameTimeAppointments: 'yes',
      }

      await controller.post(req, res)

      expect(req.session.data).toEqual({
        location: 1,
        locationDescription: 'location 1',
        appointmentType: 'app1',
        appointmentTypeDescription: 'appointment 1',
        date,
        startTime: startTime.format(DATE_TIME_FORMAT_SPEC),
        endTime: endTime.format(DATE_TIME_FORMAT_SPEC),
        sameTimeAppointments: 'yes',
      })

      expect(res.redirect).toHaveBeenCalledWith('/bulk-appointments/upload-file')
    })

    it('should return handle api errors', async () => {
      bulkAppointmentService.getBulkAppointmentsViewModel.mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      )

      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', {
        url: 'http://localhost',
      })

      expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
    })
  })
})
