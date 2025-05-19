import confirmAppointments from '../controllers/appointments/confirmAppointment'
import { raiseAnalyticsEvent } from '../raiseAnalyticsEvent'

jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

describe('Confirm appointments', () => {
  const prisonApi = {}
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
    court: 'London',
  }
  const context = { _type: 'context' }
  const systemOauthClient = { getClientCredentialsTokens: () => context }

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentOptions' does not exist on... Remove this comment to see the full error message
    appointmentsService.getAppointmentOptions = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentOptions' does not exist on... Remove this comment to see the full error message
    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [
        { value: 'VLB', text: 'Videolink' },
        { value: 'appointment1', text: 'Appointment 1' },
      ],
      locationTypes: [
        { value: 1, text: 'Room 3' },
        { value: 2, text: 'Room 1' },
        { value: 3, text: 'Room 2' },
      ],
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockReturnValue({
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
      assignedLivingUnitDesc: 'Cell 1',
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{}'.
    req.flash = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'params' does not exist on type '{}'.
    req.params = { offenderNo: 'A12345' }
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'session' does not exist on type '{}'.
    req.session = { userDetails: { authSource: 'nomis' } }
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'originalUrl' does not exist on type '{}'... Remove this comment to see the full error message
    req.originalUrl = 'http://localhost'

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{}'.
    res.status = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    res.render = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{}'.
    res.redirect = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{}'.
    req.flash.mockImplementation(() => [appointmentDetails])
  })

  it('should extract appointment details from flash and return a populated view model', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      prisonApi,
      appointmentsService,
      systemOauthClient,
      logError: () => {},
    })

    await index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    expect(res.render).toHaveBeenCalledWith(
      'confirmAppointments.njk',
      expect.objectContaining({
        addAppointmentsLink: '/offenders/A12345/add-appointment',
        prisonerProfileLink: `/prisoner/A12345`,
        prisonerName: 'John Doe',
        details: {
          date: '10 October 2017',
          endTime: '14:00',
          location: 'Room 3',
          startTime: '11:00',
          type: 'Appointment 1',
          comment: 'Test',
        },
      })
    )
  })

  it('should only extract pre and post appointments when appointmentType is VLB', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      prisonApi,
      appointmentsService,
      systemOauthClient,
      logError: () => {},
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{}'.
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

    expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
      'VLB Appointments',
      'Video link booked for London',
      'Pre: Yes | Post: No'
    )

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    expect(res.render).toHaveBeenCalledWith(
      'videolinkBookingConfirmHearingPrison.njk',
      expect.objectContaining({
        prisonerProfileLink: '/prisoner/A12345',
        title: 'The video link has been booked',
        offender: {
          name: 'Doe, John',
          prisonRoom: 'Room 3',
          prison: undefined,
        },
        details: {
          date: '10 October 2017',
          courtHearingStartTime: '11:00',
          courtHearingEndTime: '14:00',
          comments: 'Test',
        },
        prepostData: {
          'pre-court hearing briefing': 'Room 1 - 10:45 to 11:00',
        },
        court: { courtLocation: 'London' },
      })
    )
  })

  it('should display recurring information', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      prisonApi,
      appointmentsService,
      systemOauthClient,
      logError: () => {},
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{}'.
    req.flash = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{}'.
    req.flash.mockImplementation(() => [
      {
        ...appointmentDetails,
        recurring: 'yes',
        times: '2',
        repeats: 'FORTNIGHTLY',
      },
    ])

    await index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    expect(res.render).toHaveBeenCalledWith(
      'confirmAppointments.njk',
      expect.objectContaining({
        details: {
          comment: 'Test',
          date: '10 October 2017',
          endTime: '14:00',
          lastAppointment: '24 October 2017',
          location: 'Room 3',
          numberAdded: '2',
          recurring: 'Yes',
          repeats: 'Fortnightly',
          startTime: '11:00',
          type: 'Appointment 1',
        },
      })
    )
  })

  it('should place data needed for movement slips into flash including pre and post appointments', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      prisonApi,
      appointmentsService,
      systemOauthClient,
      logError: () => {},
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{}'.
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

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'session' does not exist on type '{}'.
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

  it('should place data needed for movement slips into session', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({
      prisonApi,
      appointmentsService,
      systemOauthClient,
      logError: () => {},
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{}'.
    req.flash.mockImplementation(() => [
      {
        ...appointmentDetails,
      },
    ])

    await index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'session' does not exist on type '{}'.
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

  it('should redirect to prisoner profile page when appointment details are missing from flash', async () => {
    const logError = jest.fn()
    const { index } = confirmAppointments.confirmAppointmentFactory({
      prisonApi,
      appointmentsService,
      systemOauthClient,
      logError,
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{}'.
    req.flash.mockImplementation(() => [])

    await index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{}'.
    expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345')
  })

  it('should throw and log an error when an unexpected error occurs', async () => {
    const logError = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentOptions' does not exist on... Remove this comment to see the full error message
    appointmentsService.getAppointmentOptions.mockRejectedValue(new Error('Unexpected error'))
    const { index } = confirmAppointments.confirmAppointmentFactory({
      prisonApi,
      appointmentsService,
      systemOauthClient,
      logError,
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{}'.
    req.flash.mockImplementation(() => [])

    await index(req, res)

    expect(logError).toHaveBeenCalledWith(
      'http://localhost',
      new Error('Unexpected error'),
      'Sorry, the service is unavailable'
    )
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      url: '/prisoner/A12345',
      homeUrl: '/',
    })
  })
})
