const moment = require('moment')
const { DAY_MONTH_YEAR, DATE_ONLY_FORMAT_SPEC } = require('../../src/dateHelpers')
const { addCourtAppointmentsFactory } = require('../controllers/appointments/addCourtAppointment')

const appointmentService = {}
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
const res = { locals: {} }

describe('Add court appointment', () => {
  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.getAgencyDetails = jest.fn()
    res.render = jest.fn()

    elite2Api.getDetails.mockReturnValue({ firstName: 'firstName', lastName: 'lastName', bookingId: 1 })
    elite2Api.getAgencyDetails.mockReturnValue({ description: 'Moorland' })
  })

  it('should request user and agency details', async () => {
    const { index } = addCourtAppointmentsFactory(appointmentService, elite2Api, {})

    await index(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')

    expect(elite2Api.getAgencyDetails).toHaveBeenCalledWith({}, 'MDI')
  })

  it('should render template with default data', async () => {
    const { index } = addCourtAppointmentsFactory(appointmentService, elite2Api, {})

    await index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'addAppointment/addCourtAppointment.njk',
      expect.objectContaining({
        formValues: {
          appointmentType: 'VLB',
        },
        offenderNo: 'A12345',
        offenderName: 'Lastname, Firstname',
        agencyDescription: 'Moorland',
        dpsUrl: 'http://localhost:3000/',
        bookingId: 1,
      })
    )
  })

  it('should render index error template', async () => {
    const logError = jest.fn()

    elite2Api.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

    const { index } = addCourtAppointmentsFactory(appointmentService, elite2Api, logError)

    await index(req, res)

    expect(res.render).toHaveBeenCalledWith('error.njk', expect.objectContaining({}))
    expect(logError).toHaveBeenCalledWith(undefined, new Error('Network error'), 'Sorry, the service is unavailable')
  })

  it('should return validation errors', async () => {
    const { post } = addCourtAppointmentsFactory(appointmentService, elite2Api, {})

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
        ],
        offenderName: 'Lastname, Firstname',
        agencyDescription: 'Moorland',
        offenderNo: 'A12345',
      })
    )
  })

  it('should place appointment details into flash', async () => {
    const tomorrow = moment().add(1, 'day')

    req.flash = jest.fn()
    res.redirect = jest.fn()

    const { post } = addCourtAppointmentsFactory(appointmentService, elite2Api, {})

    req.body = {
      bookingId: 1,
      date: tomorrow.format(DAY_MONTH_YEAR),
      startTimeHours: '00',
      startTimeMinutes: '01',
      endTimeHours: '00',
      endTimeMinutes: '01',
    }

    await post(req, res)

    const isoFormatted = tomorrow.format(DATE_ONLY_FORMAT_SPEC)

    expect(req.flash).toHaveBeenCalledWith('appointmentDetails', {
      appointmentType: 'VLB',
      bookingId: 1,
      endTime: `${isoFormatted}T00:01:00`,
      startTime: `${isoFormatted}T00:01:00`,
    })
    expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/prepost-appointments')
  })

  it('should pack agencyId into user details', async () => {
    const { index } = addCourtAppointmentsFactory(appointmentService, elite2Api, {})

    await index(req, res)

    expect(req.session.userDetails).toEqual({ activeCaseLoadId: 'MDI' })
  })
})
