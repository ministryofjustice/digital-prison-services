const confirmAppointments = require('../controllers/confirmAppointment')

describe('Confirm appointments', () => {
  const elite2Api = {}
  const appointmentsService = {}
  const req = {}
  const res = {}
  const appointmentDetails = {
    offenderNo: 'A12345',
    firstName: 'john',
    lastName: 'doe',
    appointmentType: 'vid1',
    locationId: 1,
    startTime: '2017-10-10T11:00',
    endTime: '2017-10-10T14:00',
    recurring: 'No',
    comment: 'Test',
  }

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    appointmentsService.getAppointmentOptions = jest.fn()

    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [{ value: 'vid1', text: 'Videolink' }],
      locationTypes: [{ value: 1, text: 'Room 3' }],
    })

    elite2Api.getDetails.mockReturnValue({
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
      assignedLivingUnitDesc: 'Cell 1',
    })

    req.flash = jest.fn()
    req.params = { offenderNo: 'A12345' }
    req.session = { userDetails: {} }
    req.originalUrl = 'http://localhost'

    res.render = jest.fn()

    req.flash.mockImplementation(() => [appointmentDetails])
  })

  it('should extract appointment details from flash and return a populated view model', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      elite2Api,
      appointmentsService,
      logError: () => {},
    })

    await index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'confirmAppointments.njk',
      expect.objectContaining({
        addAppointmentsLink: '/offenders/A12345/add-appointment',
        prisonerProfileLink: `http://localhost:3000/offenders/A12345`,
        details: {
          prisonerName: `Doe, John (A12345)`,
          appointmentType: 'Videolink',
          location: 'Room 3',
          date: 'Tuesday 10 October 2017',
          startTime: '11:00',
          endTime: '14:00',
          recurring: 'No',
          comment: 'Test',
        },
      })
    )
  })

  it('should display recurring information', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      elite2Api,
      appointmentsService,
      logError: () => {},
    })

    req.flash = jest.fn()
    req.flash.mockImplementation(() => [
      {
        ...appointmentDetails,
        recurring: 'yes',
        times: '2',
        repeats: 'FORTNIGHTLY',
      },
    ])

    await index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'confirmAppointments.njk',
      expect.objectContaining({
        details: {
          prisonerName: `Doe, John (A12345)`,
          appointmentType: 'Videolink',
          location: 'Room 3',
          date: 'Tuesday 10 October 2017',
          startTime: '11:00',
          endTime: '14:00',
          comment: 'Test',
          recurring: 'Yes',
          howOften: 'Fortnightly',
          numberOfAppointments: '2',
          endDate: 'Tuesday 24 October 2017',
        },
      })
    )
  })

  it('should place data needed for movement slips into flash', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      elite2Api,
      appointmentsService,
      logError: () => {},
    })

    await index(req, res)

    expect(req.flash).toHaveBeenCalledWith('appointmentSlipsData', {
      appointmentDetails: {
        startTime: '2017-10-10T11:00',
        endTime: '2017-10-10T14:00',
        comments: 'Test',
        appointmentTypeDescription: 'Videolink',
        locationDescription: 'Room 3',
      },
      prisonersListed: [
        {
          firstName: 'John',
          lastName: 'Doe',
          offenderNo: 'A12345',
          startTime: '2017-10-10T11:00',
          endTime: '2017-10-10T14:00',
          assignedLivingUnitDesc: 'Cell 1',
        },
      ],
    })
  })

  it('should throw and log an error when appointment details are missing from flash', async () => {
    const logError = jest.fn()
    const { index } = confirmAppointments.confirmAppointmentFactory({
      elite2Api,
      appointmentsService,
      logError,
    })
    req.flash.mockImplementation(() => [])

    await index(req, res)

    expect(logError).toHaveBeenCalledWith(
      'http://localhost',
      new Error('Appointment details are missing'),
      'Sorry, the service is unavailable'
    )
    expect(res.render).toHaveBeenCalledWith('error.njk')
  })
})
