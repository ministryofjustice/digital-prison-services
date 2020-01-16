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
    appointmentType: 'appointment1',
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
      appointmentTypes: [{ value: 'VLB', text: 'Videolink' }, { value: 'appointment1', text: 'Appointment 1' }],
      locationTypes: [{ value: 1, text: 'Room 3' }, { value: 2, text: 'Room 1' }, { value: 3, text: 'Room 2' }],
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
          appointmentType: 'Appointment 1',
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

  it('should only extract pre and post appointments when appointmentType is VLB', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      elite2Api,
      appointmentsService,
      logError: () => {},
    })

    req.flash.mockImplementation(() => [
      {
        ...appointmentDetails,
        preAppointment: {
          endTime: '2017-10-10T11:00:00',
          locationId: 2,
          startTime: '2017-10-10T10:45:00',
          duration: 30,
        },
        appointmentType: 'VLB',
      },
    ])

    await index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'videolinkBookingConfirmHearing.njk',
      expect.objectContaining({
        prisonerProfileLink: `http://localhost:3000/offenders/A12345`,
        prisonerSearchLink: '/prisoner-search',
        prisonUser: false,
        title: 'Hearing added',
        details: {
          prisonerName: `Doe, John (A12345)`,
          location: 'Room 3',
          date: 'Tuesday 10 October 2017',
          startTime: '11:00',
          endTime: '14:00',
          comment: 'Test',
          preAppointment: `Room 1 - 30 minutes`,
          postAppointment: 'None',
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
          appointmentType: 'Appointment 1',
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

  it('should place data needed for movement slips into flash including pre and post appointments', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      elite2Api,
      appointmentsService,
      logError: () => {},
    })

    req.flash.mockImplementation(() => [
      {
        ...appointmentDetails,
        preAppointment: {
          startTime: '2017-10-10T10:00:00',
          endTime: '2017-10-10T10:45:00',
          locationId: 3,
          duration: 15,
        },
        postAppointment: {
          startTime: '2017-10-10T16:00:00',
          endTime: '2017-10-10T17:00:00',
          locationId: 4,
          duration: 15,
        },
      },
    ])

    await index(req, res)

    expect(req.session.appointmentSlipsData).toEqual({
      appointmentDetails: {
        comments: 'Test',
        appointmentTypeDescription: 'Appointment 1',
        locationDescription: 'Room 2',
      },
      prisonersListed: [
        {
          firstName: 'John',
          lastName: 'Doe',
          offenderNo: 'A12345',
          startTime: '2017-10-10T10:00:00',
          endTime: '2017-10-10T17:00:00',
          assignedLivingUnitDesc: 'Cell 1',
        },
      ],
    })
  })

  it('should place data needed for movement slips into flash', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      elite2Api,
      appointmentsService,
      logError: () => {},
    })

    req.flash.mockImplementation(() => [
      {
        ...appointmentDetails,
      },
    ])

    await index(req, res)

    expect(req.session.appointmentSlipsData).toEqual({
      appointmentDetails: {
        comments: 'Test',
        appointmentTypeDescription: 'Appointment 1',
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
