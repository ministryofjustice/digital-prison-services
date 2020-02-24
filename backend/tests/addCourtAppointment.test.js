const moment = require('moment')
const { DAY_MONTH_YEAR, DATE_ONLY_FORMAT_SPEC, DATE_TIME_FORMAT_SPEC } = require('../../src/dateHelpers')
const { addCourtAppointmentsFactory } = require('../controllers/appointments/addCourtAppointment')

const existingEventsService = {}
const elite2Api = {}
const availableSlotsService = {}
const req = {
  session: {
    userDetails: {},
  },
  params: {
    offenderNo: 'A12345',
    agencyId: 'MDI',
  },
}
const res = { locals: {}, send: jest.fn(), redirect: jest.fn() }

describe('Add court appointment', () => {
  let controller
  let logError

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.getAgencyDetails = jest.fn()
    availableSlotsService.getAvailableRooms = jest.fn()
    existingEventsService.getAvailableLocationsForVLB = jest.fn()

    elite2Api.getDetails.mockReturnValue({ firstName: 'firstName', lastName: 'lastName', bookingId: 1 })
    elite2Api.getAgencyDetails.mockReturnValue({ description: 'Moorland' })
    availableSlotsService.getAvailableRooms.mockReturnValue([])

    res.render = jest.fn()
    res.send = jest.fn()
    res.redirect = jest.fn()
    req.flash = jest.fn()
    logError = jest.fn()
    controller = addCourtAppointmentsFactory(existingEventsService, elite2Api, logError, availableSlotsService)
  })

  afterEach(() => {
    if (Date.now.mockRestore) Date.now.mockRestore()
  })

  it('should request user and agency details', async () => {
    await controller.index(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
    expect(elite2Api.getAgencyDetails).toHaveBeenCalledWith({}, 'MDI')
  })

  it('should render template with default data', async () => {
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'addAppointment/addCourtAppointment.njk',
      expect.objectContaining({
        formValues: {
          appointmentType: 'VLB',
        },
        offenderNo: 'A12345',
        offenderNameWithNumber: 'Lastname, Firstname (A12345)',
        agencyDescription: 'Moorland',
        dpsUrl: 'http://localhost:3000/',
        bookingId: 1,
      })
    )
  })

  it('should render index error template', async () => {
    elite2Api.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith('error.njk', expect.objectContaining({}))
    expect(logError).toHaveBeenCalledWith(undefined, new Error('Network error'), 'Sorry, the service is unavailable')
  })

  it('should return validation errors', async () => {
    req.body = {}
    await controller.post(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'addAppointment/addCourtAppointment.njk',
      expect.objectContaining({
        bookingId: 1,
        dpsUrl: 'http://localhost:3000/',
        errors: [
          { href: '#date', text: 'Select a date' },
          { href: '#start-time-hours', text: 'Select a start time' },
          { href: '#end-time-hours', text: 'Select an end time' },
          { href: '#pre-appointment-required', text: 'Select if a pre appointment is required' },
          { href: '#post-appointment-required', text: 'Select if a post appointment is required' },
        ],
        offenderNameWithNumber: 'Lastname, Firstname (A12345)',
        agencyDescription: 'Moorland',
        offenderNo: 'A12345',
      })
    )
  })

  describe('when there are rooms available', () => {
    it('should place appointment details into flash and redirect to court selection page', async () => {
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [{ value: 1, text: 'Room 1' }],
        preLocations: [{ value: 2, text: 'Room 2' }, { value: 22, text: 'Room 22' }],
        postLocations: [{ value: 3, text: 'Room 3' }, { value: 33, text: 'Room 33' }],
      })

      const tomorrow = moment().add(1, 'day')
      req.body = {
        bookingId: 1,
        date: tomorrow.format(DAY_MONTH_YEAR),
        startTimeHours: '00',
        startTimeMinutes: '01',
        endTimeHours: '00',
        endTimeMinutes: '01',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
      }

      await controller.post(req, res)

      const isoFormatted = tomorrow.format(DATE_ONLY_FORMAT_SPEC)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', {
        appointmentType: 'VLB',
        bookingId: 1,
        endTime: `${isoFormatted}T00:01:00`,
        startTime: `${isoFormatted}T00:01:00`,
        postAppointmentRequired: 'yes',
        preAppointmentRequired: 'yes',
      })
      expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')
    })

    it('should pack agencyId into user details', async () => {
      await controller.index(req, res)

      expect(req.session.userDetails).toEqual({ activeCaseLoadId: 'MDI' })
    })
  })

  describe('when there are no rooms available', () => {
    beforeEach(() => {
      req.body = {
        bookingId: 1,
        date: moment().format(DAY_MONTH_YEAR),
        startTimeHours: '12',
        startTimeMinutes: '00',
        endTimeHours: '13',
        endTimeMinutes: '00',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
      }
    })

    it('should include pre and post time when checking for availability', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [],
        preLocations: [],
        postLocations: [],
      })

      req.body = {
        ...req.body,
        date: moment().format(DAY_MONTH_YEAR),
        startTimeHours: '12',
        startTimeMinutes: '00',
        endTimeHours: '13',
        endTimeMinutes: '00',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
      }

      await controller.post(req, res)

      const mainStartTime = moment()
        .hour(12)
        .minute(0)

      const mainEndTime = moment()
        .hour(13)
        .minute(0)

      const startTime = moment(mainStartTime)
        .subtract(20, 'minutes')
        .format(DATE_TIME_FORMAT_SPEC)
      const endTime = moment(mainEndTime)
        .add(20, 'minutes')
        .format(DATE_TIME_FORMAT_SPEC)

      expect(availableSlotsService.getAvailableRooms).toHaveBeenCalledWith(
        {},
        {
          agencyId: 'MDI',
          startTime,
          endTime,
        }
      )
    })

    it('should return the availability for the whole day screen when there is less than two available rooms', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [],
        preLocations: [],
        postLocations: [],
      })

      availableSlotsService.getAvailableRooms.mockReturnValue([{ value: 1 }])

      req.body = {
        ...req.body,
        date: moment().format(DAY_MONTH_YEAR),
      }
      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith('noAppointmentsForWholeDay.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
        date: 'Sunday 1 January 2017',
      })
    })

    it('should return the availability for date time screen when there is more or equal to two available rooms', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [],
        preLocations: [],
        postLocations: [],
      })

      availableSlotsService.getAvailableRooms.mockReturnValue([{ value: 1 }, { value: 2 }])

      req.body = {
        ...req.body,
        date: moment().format(DAY_MONTH_YEAR),
      }
      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith('noAppointmentsForDateTime.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
        date: 'Sunday 1 January 2017',
        endTime: '13:20',
        startTime: '11:40',
      })
    })

    it('should continue with the journey if a pre appointment not required', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [{ value: 1, text: 'Room 1' }],
        preLocations: [],
        postLocations: [{ value: 3, text: 'Room 3' }, { value: 4, text: 'Room 4' }],
      })

      req.flash = () => {}
      req.body = {
        ...req.body,
        preAppointmentRequired: 'no',
        date: moment().format(DAY_MONTH_YEAR),
      }
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')
    })

    it('should continue with the journey if a post appointment not required', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [{ value: 1, text: 'Room 1' }],
        preLocations: [{ value: 3, text: 'Room 3' }, { value: 4, text: 'Room 4' }],
        postLocations: [],
      })

      req.flash = () => {}
      req.body = {
        ...req.body,
        postAppointmentRequired: 'no',
        date: moment().format(DAY_MONTH_YEAR),
      }
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')
    })
  })
})
