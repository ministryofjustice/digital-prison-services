// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prepostApp... Remove this comment to see the full error message
const { prepostAppointmentsFactory } = require('../controllers/appointments/prepostAppoinments')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Time'.
const { Time } = require('../../common/dateHelpers')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'notifyClie... Remove this comment to see the full error message
const { notifyClient } = require('../shared/notifyClient')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('../config')

describe('Pre post appointments', () => {
  let body
  const prisonApi = {}
  const oauthApi = {}
  const whereaboutsApi = {}
  const appointmentsService = {}
  const existingEventsService = {}

  const req = {
    originalUrl: 'http://localhost',
    params: { offenderNo: 'A12345' },
    session: { userDetails: { activeCaseLoadId: 'LEI', authSource: 'nomis' } },
  }
  const res = { locals: {} }

  const bookingId = 1
  const appointmentDetails = {
    bookingId,
    offenderNo: 'A12345',
    firstName: 'john',
    lastName: 'doe',
    appointmentType: 'VLB',
    locationId: 1,
    startTime: '2017-10-10T11:00',
    endTime: '2017-10-10T14:00',
    recurring: 'No',
    comment: 'Test',
    locationDescription: 'Room 3',
    appointmentTypeDescription: 'Videolink',
    locationTypes: [{ value: 1, text: 'Room 3' }],
    date: '10/10/2019',
    court: 'london',
  }

  const locationEvents = [
    { locationId: 3, eventDescription: 'Doctors - An appointment', startTime: '12:00', endTime: '13:00' },
  ]

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'addSingleAppointment' does not exist on ... Remove this comment to see the full error message
    prisonApi.addSingleAppointment = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getLocation = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userEmail' does not exist on type '{}'.
    oauthApi.userEmail = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentOptions' does not exist on... Remove this comment to see the full error message
    appointmentsService.getAppointmentOptions = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForLocation' does not e... Remove this comment to see the full error message
    existingEventsService.getExistingEventsForLocation = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtLocations' does not exist on typ... Remove this comment to see the full error message
    whereaboutsApi.getCourtLocations = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'addVideoLinkBooking' does not exist on t... Remove this comment to see the full error message
    whereaboutsApi.addVideoLinkBooking = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
    req.flash = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
    res.locals = {}

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentOptions' does not exist on... Remove this comment to see the full error message
    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [{ value: 'VLB', text: 'Videolink' }],
      locationTypes: [{ value: 1, text: 'Room 3' }],
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockReturnValue({
      bookingId,
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
      assignedLivingUnitDesc: 'Cell 1',
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails.mockReturnValue({
      description: 'Moorland',
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocation' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getLocation.mockReturnValue({ userDescription: 'Test location' })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtLocations' does not exist on typ... Remove this comment to see the full error message
    whereaboutsApi.getCourtLocations.mockReturnValue([
      { id: 'LEICOURT-1', name: 'Leeds' },
      { id: 'LDNCOURT-1', name: 'London' },
    ])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForLocation' does not e... Remove this comment to see the full error message
    existingEventsService.getExistingEventsForLocation.mockReturnValue(locationEvents)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
    req.flash.mockImplementation(() => [appointmentDetails])

    body = {
      postAppointment: 'yes',
      preAppointment: 'no',
      court: 'LDNCOURT-1',
    }
  })

  describe('index', () => {
    it('should return correct links', async () => {
      const { index } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      await index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          links: {
            postAppointments: '/offenders/A12345/prepost-appointments',
            cancel: '/offenders/A12345/prepost-appointments/cancel',
          },
        })
      )
    })

    it('should return locations', async () => {
      const { index } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      await index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          locations: [{ value: 1, text: 'Room 3' }],
        })
      )
    })

    it('should return court locations', async () => {
      const { index } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      await index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          courts: [
            { text: 'Leeds', value: 'LEICOURT-1' },
            { text: 'London', value: 'LDNCOURT-1' },
            { text: 'Other', value: 'other' },
          ],
        })
      )
    })

    it('should return no default form values', async () => {
      const { index } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      await index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          formValues: {},
        })
      )
    })

    it('should extract appointment details', async () => {
      const { index } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      await index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          date: '10/10/2017',
          details: {
            courtHearingEndTime: '14:00',
            courtHearingStartTime: '11:00',
            date: '10 October 2017',
            location: 'Room 3',
            name: 'Doe, John',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const logError = jest.fn()
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
      const { index } = prepostAppointmentsFactory({ prisonApi, appointmentsService, logError })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      req.flash.mockImplementation(() => [])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
      res.status = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = body

      await expect(index(req, res)).rejects.toThrowError(new Error('Appointment details are missing'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirectUrl' does not exist on type '{}'... Remove this comment to see the full error message
      expect(res.locals.redirectUrl).toBe('/offenders/A12345/add-appointment')
    })

    it('should display locationEvents is present in flash', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preAppointment: {
            locationId: 1,
          },
          postAppointment: {
            locationId: 1,
          },
        },
      ])

      const { index } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        existingEventsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      await index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          locationEvents: {
            postAppointment: {
              events: [
                { endTime: '13:00', eventDescription: 'Doctors - An appointment', locationId: 3, startTime: '12:00' },
              ],
              locationName: 'Test location',
            },
            preAppointment: {
              events: [
                { endTime: '13:00', eventDescription: 'Doctors - An appointment', locationId: 3, startTime: '12:00' },
              ],
              locationName: 'Test location',
            },
          },
        })
      )
    })
  })

  describe('post', () => {
    it('should redirect to the court location page when other has been selected', async () => {
      const { post } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = {
        court: 'other',
        postAppointment: 'no',
        preAppointment: 'no',
      }

      await post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', {
        appointmentType: 'VLB',
        appointmentTypeDescription: 'Videolink',
        bookingId: 1,
        comment: 'Test',
        court: 'Other',
        date: '10/10/2019',
        endTime: '2017-10-10T14:00',
        firstName: 'john',
        lastName: 'doe',
        locationDescription: 'Room 3',
        locationId: 1,
        locationTypes: [{ text: 'Room 3', value: 1 }],
        offenderNo: 'A12345',
        postAppointment: {
          required: 'no',
        },
        preAppointment: {
          required: 'no',
        },
        recurring: 'No',
        startTime: '2017-10-10T11:00',
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith('enterCustomCourt.njk', {
        date: '10/10/2019',
        errors: [],
        formValues: {
          court: 'other',
          postAppointment: 'no',
          preAppointment: 'no',
        },
        cancel: '/offenders/A12345/prepost-appointments',
      })
    })

    it('should validate the presence of other court', async () => {
      const { post } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = {
        otherCourtForm: 'true',
        postAppointment: 'no',
        preAppointment: 'no',
      }

      await post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'enterCustomCourt.njk',
        expect.objectContaining({
          errors: [{ href: '#otherCourt', text: 'Enter the name of the court' }],
        })
      )
    })

    it('should validate presence of room locations', async () => {
      const { post } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = {
        ...body,
        preAppointmentLocation: null,
        postAppointmentLocation: undefined,
        postAppointment: 'yes',
        preAppointment: 'yes',
      }

      await post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          errors: [
            { text: 'Select a room for the pre-court hearing briefing', href: '#preAppointmentLocation' },
            { text: 'Select a room for the post-court hearing briefing', href: '#postAppointmentLocation' },
          ],
        })
      )
    })

    it('should validate presence of court', async () => {
      const { post } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        existingEventsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = {
        ...body,
        postAppointment: 'no',
        preAppointment: 'no',
        court: null,
      }

      await post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          errors: [{ href: '#court', text: 'Select which court the hearing is for' }],
        })
      )
    })

    it('should validate presence of room locations when "no" have been selected', async () => {
      const { post } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = {
        ...body,
        preAppointmentLocation: null,
        postAppointment: 'no',
        preAppointment: 'yes',
      }

      await post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          errors: [{ text: 'Select a room for the pre-court hearing briefing', href: '#preAppointmentLocation' }],
        })
      )
    })

    it('should return selected form values on validation errors', async () => {
      const { post } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        existingEventsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = {
        preAppointment: 'yes',
        preAppointmentLocation: 2,
        postAppointment: 'yes',
        court: 'london',
      }

      await post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          formValues: {
            preAppointment: 'yes',
            preAppointmentLocation: 2,
            postAppointment: 'yes',
            court: 'london',
          },
        })
      )
    })

    it('should return locations, links and summary details on validation errors', async () => {
      const { post } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        existingEventsService,
        whereaboutsApi,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = body

      await post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          links: {
            postAppointments: `/offenders/A12345/prepost-appointments`,
            cancel: '/offenders/A12345/prepost-appointments/cancel',
          },
          locations: [{ value: 1, text: 'Room 3' }],
          details: {
            courtHearingEndTime: '14:00',
            courtHearingStartTime: '11:00',
            date: '10 October 2017',
            location: 'Room 3',
            name: 'Doe, John',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const logError = jest.fn()
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
      const { post } = prepostAppointmentsFactory({ prisonApi, appointmentsService, logError })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      req.flash.mockImplementation(() => [])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = body

      await expect(post(req, res)).rejects.toThrowError(new Error('Appointment details are missing'))

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirectUrl' does not exist on type '{}'... Remove this comment to see the full error message
      expect(res.locals.redirectUrl).toBe('/offenders/A12345/add-appointment')
    })

    it('should pack appointment details back into flash before rendering', async () => {
      const { post } = prepostAppointmentsFactory({
        prisonApi,
        appointmentsService,
        whereaboutsApi,
        existingEventsService,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
        logError: () => {},
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = body

      await post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
    })

    it('should raise a telemetry event on appointment creation', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
      prisonApi.getAgencyDetails.mockReturnValue({
        description: 'Leeds',
      })

      const raiseAnalyticsEvent = jest.fn()

      const { post } = prepostAppointmentsFactory({
        prisonApi,
        oauthApi,
        appointmentsService,
        whereaboutsApi,
        existingEventsService,
        raiseAnalyticsEvent,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; oauthApi: {}; a... Remove this comment to see the full error message
        logError: () => {},
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = {
        ...body,
        preAppointment: 'no',
        postAppointment: 'no',
      }
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
      res.redirect = () => {}

      await post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith({}, 'LEI')
      expect(raiseAnalyticsEvent).toHaveBeenCalledWith('VLB Appointments', 'Video link booked', 'Leeds -  London')
    })

    describe('Events at location', () => {
      it('should return events at the pre appointment location on validation errors', async () => {
        const { post } = prepostAppointmentsFactory({
          prisonApi,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
          logError: () => {},
        })

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
        req.body = {
          ...body,
          preAppointmentLocation: 1,
        }

        await post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForLocation' does not e... Remove this comment to see the full error message
        expect(existingEventsService.getExistingEventsForLocation).toHaveBeenCalledWith({}, 'LEI', 1, '10/10/2019')

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toHaveBeenCalledWith(
          'prepostAppointments.njk',
          expect.objectContaining({
            locationEvents: {
              preAppointment: {
                locationName: 'Test location',
                events: locationEvents,
              },
            },
          })
        )
      })

      it('should return events at the post appointment location on validation errors', async () => {
        const { post } = prepostAppointmentsFactory({
          prisonApi,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; appointmentsSer... Remove this comment to see the full error message
          logError: () => {},
        })

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
        req.body = {
          ...body,
          preAppointmentLocation: null,
          postAppointmentLocation: 1,
          postAppointment: 'yes',
          preAppointment: 'yes',
        }

        await post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExistingEventsForLocation' does not e... Remove this comment to see the full error message
        expect(existingEventsService.getExistingEventsForLocation).toHaveBeenCalledWith({}, 'LEI', 1, '10/10/2019')

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toHaveBeenCalledWith(
          'prepostAppointments.njk',
          expect.objectContaining({
            locationEvents: {
              postAppointment: {
                locationName: 'Test location',
                events: locationEvents,
              },
            },
          })
        )
      })
    })

    describe('Create appointments', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
        req.flash.mockImplementation(() => [
          {
            ...appointmentDetails,
            startTime: '2017-10-10T11:00',
            endTime: '2017-10-10T14:00',
          },
        ])

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
        req.body = {
          postAppointment: 'yes',
          preAppointment: 'yes',
          preAppointmentLocation: '2',
          postAppointmentLocation: '3',
          court: 'LDNCOURT-1',
        }

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
        res.redirect = jest.fn()
      })

      it('should create booking', async () => {
        const { post } = prepostAppointmentsFactory({
          prisonApi,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          raiseAnalyticsEvent: () => {},
        })

        await post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addVideoLinkBooking' does not exist on t... Remove this comment to see the full error message
        expect(whereaboutsApi.addVideoLinkBooking).toHaveBeenCalledWith(
          {},
          {
            bookingId: 1,
            comment: 'Test',
            court: undefined,
            courtId: 'LDNCOURT-1',
            madeByTheCourt: false,
            pre: {
              startTime: '2017-10-10T10:45:00',
              endTime: '2017-10-10T11:00:00',
              locationId: 2,
            },
            main: {
              startTime: '2017-10-10T11:00',
              endTime: '2017-10-10T14:00',
              locationId: 1,
            },
            post: {
              startTime: '2017-10-10T14:00',
              endTime: '2017-10-10T14:15:00',
              locationId: 3,
            },
          }
        )
      })

      it('when other court selected it should create booking', async () => {
        const { post } = prepostAppointmentsFactory({
          prisonApi,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          raiseAnalyticsEvent: () => {},
        })

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
        await post({ ...req, body: { ...req.body, otherCourt: 'Mega Court' } }, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addVideoLinkBooking' does not exist on t... Remove this comment to see the full error message
        expect(whereaboutsApi.addVideoLinkBooking).toHaveBeenCalledWith(
          {},
          {
            bookingId: 1,
            comment: 'Test',
            court: 'Mega Court',
            courtId: undefined,
            madeByTheCourt: false,
            pre: {
              startTime: '2017-10-10T10:45:00',
              endTime: '2017-10-10T11:00:00',
              locationId: 2,
            },
            main: {
              startTime: '2017-10-10T11:00',
              endTime: '2017-10-10T14:00',
              locationId: 1,
            },
            post: {
              startTime: '2017-10-10T14:00',
              endTime: '2017-10-10T14:15:00',
              locationId: 3,
            },
          }
        )
      })

      it('should not request pre or post appointments when no has been selected', async () => {
        const { post } = prepostAppointmentsFactory({
          prisonApi,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          raiseAnalyticsEvent: () => {},
        })

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
        req.body = {
          postAppointment: 'no',
          preAppointment: 'no',
          court: 'LDNCOURT-1',
        }
        await post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addVideoLinkBooking' does not exist on t... Remove this comment to see the full error message
        expect(whereaboutsApi.addVideoLinkBooking.mock.calls.length).toBe(1)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addVideoLinkBooking' does not exist on t... Remove this comment to see the full error message
        expect(whereaboutsApi.addVideoLinkBooking).toHaveBeenCalledWith(
          {},
          {
            bookingId: 1,
            comment: 'Test',
            court: undefined,
            courtId: 'LDNCOURT-1',
            madeByTheCourt: false,
            main: {
              startTime: '2017-10-10T11:00',
              endTime: '2017-10-10T14:00',
              locationId: 1,
            },
          }
        )
      })

      it('should place pre and post appointment details into flash', async () => {
        const { post } = prepostAppointmentsFactory({
          prisonApi,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          raiseAnalyticsEvent: () => {},
        })

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
        req.body = {
          postAppointment: 'yes',
          preAppointment: 'yes',
          preAppointmentLocation: 1,
          postAppointmentLocation: 2,
          court: 'london',
        }

        await post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
        expect(req.flash).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({
            preAppointment: {
              required: 'yes',
              endTime: '2017-10-10T11:00:00',
              locationId: 1,
              startTime: '2017-10-10T10:45:00',
            },
            postAppointment: {
              required: 'yes',
              endTime: '2017-10-10T14:15:00',
              locationId: 2,
              startTime: '2017-10-10T14:00',
            },
          })
        )
      })

      it('should redirect to confirmation page', async () => {
        notifyClient.sendEmail = jest.fn()

        const { post } = prepostAppointmentsFactory({
          prisonApi,
          oauthApi,
          appointmentsService,
          whereaboutsApi,
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; oauthApi: {}; a... Remove this comment to see the full error message
          logError: () => {},
          raiseAnalyticsEvent: () => {},
        })

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
        req.body = {
          postAppointment: 'no',
          preAppointment: 'no',
          court: 'london',
        }
        await post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
        expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
        expect(notifyClient.sendEmail).not.toHaveBeenCalled()
      })

      it('should try to send email with prison template when prison user has email', async () => {
        notifyClient.sendEmail = jest.fn()

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userEmail' does not exist on type '{}'.
        oauthApi.userEmail.mockReturnValue({
          email: 'test@example.com',
        })

        notifyClient.sendEmail = jest.fn()

        const { post } = prepostAppointmentsFactory({
          prisonApi,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; oauthApi: {}; n... Remove this comment to see the full error message
          logError: () => {},
          raiseAnalyticsEvent: () => {},
        })

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
        req.body = {
          postAppointment: 'no',
          preAppointment: 'no',
          court: 'london',
        }
        await post(req, res)

        const personalisation = {
          startTime: Time(appointmentDetails.startTime),
          endTime: Time(appointmentDetails.endTime),
          comments: appointmentDetails.comment,
          date: '10 October 2019',
          firstName: 'John',
          lastName: 'Doe',
          offenderNo: appointmentDetails.offenderNo,
          location: 'Room 3',
          postAppointmentInfo: 'None requested',
          preAppointmentInfo: 'None requested',
          prison: 'Moorland',
        }

        expect(notifyClient.sendEmail).toHaveBeenCalledWith(
          config.notifications.confirmBookingPrisonTemplateId,
          'test@example.com',
          {
            personalisation,
            reference: null,
          }
        )
      })
    })
  })
})
