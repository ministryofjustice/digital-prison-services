const { addCourtAppointmentsFactory } = require('../controllers/appointments/addCourtAppointment')

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
  let controller
  let logError

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.getAgencyDetails = jest.fn()

    elite2Api.getDetails.mockReturnValue({ firstName: 'firstName', lastName: 'lastName', bookingId: 1 })
    elite2Api.getAgencyDetails.mockReturnValue({ description: 'Moorland' })

    res.render = jest.fn()
    res.send = jest.fn()
    res.redirect = jest.fn()

    req.flash = jest.fn()
    logError = jest.fn()
    controller = addCourtAppointmentsFactory(elite2Api, logError)
  })

  afterEach(() => {
    if (Date.now.mockRestore) Date.now.mockRestore()
  })

  it('should request user and agency details', async () => {
    await controller.index(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
    expect(elite2Api.getAgencyDetails).toHaveBeenCalledWith({}, 'MDI')
  })

  it('should pack agencyId into user details', async () => {
    await controller.index(req, res)

    expect(req.session.userDetails).toEqual({ activeCaseLoadId: 'MDI' })
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
    await controller.validateInput(req, res)

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

  it('should go to the court selection page', () => {
    controller.goToCourtSelection(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')
  })
})
