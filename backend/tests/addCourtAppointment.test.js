const moment = require('moment')
const { DAY_MONTH_YEAR, DATE_ONLY_FORMAT_SPEC } = require('../../src/dateHelpers')
const { addCourtAppointmentsFactory } = require('../controllers/appointments/addCourtAppointment')

const existingEventsService = {}
const elite2Api = {}
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
  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.getAgencyDetails = jest.fn()
    res.render = jest.fn()

    elite2Api.getDetails.mockReturnValue({ firstName: 'firstName', lastName: 'lastName', bookingId: 1 })
    elite2Api.getAgencyDetails.mockReturnValue({ description: 'Moorland' })

    existingEventsService.getAvailableLocationsForVLB = jest.fn()
    existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
      mainLocations: [],
      preLocations: [],
      postLocations: [],
    })
  })

  it('should request user and agency details', async () => {
    const { index } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

    await index(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')

    expect(elite2Api.getAgencyDetails).toHaveBeenCalledWith({}, 'MDI')
  })

  it('should render template with default data', async () => {
    const { index } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

    await index(req, res)

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
    const logError = jest.fn()

    elite2Api.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

    const { index } = addCourtAppointmentsFactory(existingEventsService, elite2Api, logError)

    await index(req, res)

    expect(res.render).toHaveBeenCalledWith('error.njk', expect.objectContaining({}))
    expect(logError).toHaveBeenCalledWith(undefined, new Error('Network error'), 'Sorry, the service is unavailable')
  })

  it('should return validation errors', async () => {
    const { post } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

    req.body = {}
    await post(req, res)

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
        preLocations: [{ value: 2, text: 'Room 2' }],
        postLocations: [{ value: 3, text: 'Room 3' }],
      })

      const tomorrow = moment().add(1, 'day')

      req.flash = jest.fn()
      res.redirect = jest.fn()

      const { post } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

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

      await post(req, res)

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
      const { index } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

      await index(req, res)

      expect(req.session.userDetails).toEqual({ activeCaseLoadId: 'MDI' })
    })
  })

  describe('when there are no rooms available', () => {
    const tomorrow = moment().add(1, 'day')

    beforeEach(() => {
      res.send = jest.fn()
      res.redirect = jest.fn()
    })

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

    describe('when there are no rooms available for pre appointment', () => {
      it('should notify the user if a pre appointment is required', async () => {
        existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
          mainLocations: [{ value: 1, text: 'Room 1' }],
          preLocations: [],
          postLocations: [{ value: 3, text: 'Room 3' }],
        })

        const { post } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

        await post(req, res)

        expect(res.send).toHaveBeenCalledWith('No rooms available')
      })

      it('should continue with the journey if a pre appointment not required', async () => {
        existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
          mainLocations: [{ value: 1, text: 'Room 1' }],
          preLocations: [],
          postLocations: [{ value: 3, text: 'Room 3' }],
        })

        const { post } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

        req.body = {
          ...req.body,
          preAppointmentRequired: 'no',
        }
        await post(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')
      })
    })

    it('should notify the user if there are no rooms available for the main locations', async () => {
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [],
        preLocations: [{ value: 2, text: 'Room 2' }],
        postLocations: [{ value: 3, text: 'Room 3' }],
      })

      const { post } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

      await post(req, res)

      expect(res.send).toHaveBeenCalledWith('No rooms available')
    })

    describe('when there are no rooms available for post appointment', () => {
      it('should notify the user if a post appointment is required', async () => {
        existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
          mainLocations: [{ value: 1, text: 'Room 1' }],
          preLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [],
        })

        const { post } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

        await post(req, res)

        expect(res.send).toHaveBeenCalledWith('No rooms available')
      })

      it('should continue with the journey if a post appointment not required', async () => {
        existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
          mainLocations: [{ value: 1, text: 'Room 1' }],
          preLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [],
        })

        const { post } = addCourtAppointmentsFactory(existingEventsService, elite2Api, {})

        req.body = {
          ...req.body,
          postAppointmentRequired: 'no',
        }
        await post(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')
      })
    })
  })
})
