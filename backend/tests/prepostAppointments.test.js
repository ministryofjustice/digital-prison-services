const { prepostAppointmentsFactory } = require('../controllers/appointments/prepostAppoinments')
const { Time } = require('../../src/dateHelpers')
const { notifyClient } = require('../shared/notifyClient')
const config = require('../config')

describe('Pre post appointments', () => {
  let body
  const elite2Api = {}
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
    elite2Api.getDetails = jest.fn()
    elite2Api.addSingleAppointment = jest.fn()
    elite2Api.getLocation = jest.fn()
    elite2Api.getAgencyDetails = jest.fn()
    oauthApi.userEmail = jest.fn()
    appointmentsService.getAppointmentOptions = jest.fn()
    existingEventsService.getExistingEventsForLocation = jest.fn()
    whereaboutsApi.getCourtLocations = jest.fn()
    whereaboutsApi.addVideoLinkAppointment = jest.fn()

    req.flash = jest.fn()
    res.render = jest.fn()

    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [{ value: 'VLB', text: 'Videolink' }],
      locationTypes: [{ value: 1, text: 'Room 3' }],
    })

    elite2Api.getDetails.mockReturnValue({
      bookingId,
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
      assignedLivingUnitDesc: 'Cell 1',
    })

    elite2Api.getAgencyDetails.mockReturnValue({
      description: 'Moorland',
    })

    elite2Api.getLocation.mockReturnValue({ userDescription: 'Test location' })
    whereaboutsApi.getCourtLocations.mockReturnValue({ courtLocations: ['Leeds', 'London'] })
    existingEventsService.getExistingEventsForLocation.mockReturnValue(locationEvents)

    req.flash.mockImplementation(() => [appointmentDetails])

    body = {
      postAppointment: 'yes',
      preAppointment: 'no',
      postAppointmentDuration: '60',
      court: 'london',
    }
  })

  describe('index', () => {
    it('should return correct links', async () => {
      const { index } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        logError: () => {},
      })

      await index(req, res)

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
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        logError: () => {},
      })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          locations: [{ value: 1, text: 'Room 3' }],
        })
      )
    })

    it('should return court locations', async () => {
      const { index } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        logError: () => {},
      })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          courts: [
            { text: 'Leeds', value: 'leeds' },
            { text: 'London', value: 'london' },
            { text: 'Other', value: 'other' },
          ],
        })
      )
    })

    it('should return default form values', async () => {
      const { index } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        logError: () => {},
      })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          formValues: {
            postAppointment: 'yes',
            preAppointment: 'yes',
            postAppointmentDuration: '20',
            preAppointmentDuration: '20',
          },
        })
      )
    })

    it('should extract appointment details', async () => {
      const { index } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        logError: () => {},
      })

      await index(req, res)

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
      const { index } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError })

      req.flash.mockImplementation(() => [])
      req.body = body

      await index(req, res)

      expect(logError).toHaveBeenCalledWith(
        'http://localhost',
        new Error('Appointment details are missing'),
        'Sorry, the service is unavailable'
      )
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/offenders/A12345/add-appointment' })
    })

    it('should display locationEvents is present in flash', async () => {
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
        elite2Api,
        appointmentsService,
        existingEventsService,
        whereaboutsApi,
        logError: () => {},
      })

      await index(req, res)

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
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        logError: () => {},
      })

      req.body = {
        court: 'other',
        postAppointment: 'no',
        preAppointment: 'no',
      }

      await post(req, res)

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
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        logError: () => {},
      })

      req.body = {
        otherCourtForm: 'true',
        postAppointment: 'no',
        preAppointment: 'no',
      }

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'enterCustomCourt.njk',
        expect.objectContaining({
          errors: [{ href: '#otherCourt', text: 'Enter the name of the court' }],
        })
      )
    })

    it('should validate presence of room locations', async () => {
      const { post } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        logError: () => {},
      })

      req.body = {
        ...body,
        preAppointmentLocation: null,
        postAppointmentLocation: undefined,
        postAppointment: 'yes',
        preAppointment: 'yes',
      }

      await post(req, res)

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
        elite2Api,
        appointmentsService,
        existingEventsService,
        whereaboutsApi,
        logError: () => {},
      })

      req.body = {
        ...body,
        postAppointment: 'no',
        preAppointment: 'no',
        court: null,
      }

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          errors: [{ href: '#court', text: 'Select which court the hearing is for' }],
        })
      )
    })

    it('should validate presence of room locations when "no" have been selected', async () => {
      const { post } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        logError: () => {},
      })

      req.body = {
        ...body,
        preAppointmentLocation: null,
        postAppointment: 'no',
        preAppointment: 'yes',
      }

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          errors: [{ text: 'Select a room for the pre-court hearing briefing', href: '#preAppointmentLocation' }],
        })
      )
    })

    it('should return selected form values on validation errors', async () => {
      const { post } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        existingEventsService,
        whereaboutsApi,
        logError: () => {},
      })

      req.body = {
        preAppointment: 'yes',
        preAppointmentLocation: 2,
        postAppointment: 'yes',
        postAppointmentDuration: '60',
        court: 'london',
      }

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          formValues: {
            preAppointment: 'yes',
            preAppointmentLocation: 2,
            postAppointment: 'yes',
            postAppointmentDuration: '60',
            court: 'london',
          },
        })
      )
    })

    it('should return locations, links and summary details on validation errors', async () => {
      const { post } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        existingEventsService,
        whereaboutsApi,
        logError: () => {},
      })

      req.body = body

      await post(req, res)

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
      const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError })

      req.flash.mockImplementation(() => [])
      req.body = body

      await post(req, res)

      expect(logError).toHaveBeenCalledWith(
        'http://localhost',
        new Error('Appointment details are missing'),
        'Sorry, the service is unavailable'
      )
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/offenders/A12345/add-appointment' })
    })

    it('should pack appointment details back into flash before rendering', async () => {
      const { post } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        whereaboutsApi,
        existingEventsService,
        logError: () => {},
      })
      req.body = body

      await post(req, res)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
    })

    it('should raise a telemetry event on appointment creation', async () => {
      elite2Api.getAgencyDetails.mockReturnValue({
        description: 'Leeds',
      })

      const raiseAnalyticsEvent = jest.fn()

      const { post } = prepostAppointmentsFactory({
        elite2Api,
        oauthApi,
        appointmentsService,
        whereaboutsApi,
        existingEventsService,
        raiseAnalyticsEvent,
        logError: () => {},
      })

      req.body = {
        ...body,
        preAppointment: 'no',
        postAppointment: 'no',
      }
      res.redirect = () => {}

      await post(req, res)

      expect(elite2Api.getAgencyDetails).toHaveBeenCalledWith({}, 'LEI')
      expect(raiseAnalyticsEvent).toHaveBeenCalledWith('VLB Appointments', 'Video link booked', 'Leeds -  London')
    })

    describe('Events at location', () => {
      it('should return events at the pre appointment location on validation errors', async () => {
        const { post } = prepostAppointmentsFactory({
          elite2Api,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          logError: () => {},
        })

        req.body = {
          ...body,
          preAppointmentLocation: 1,
        }

        await post(req, res)

        expect(existingEventsService.getExistingEventsForLocation).toHaveBeenCalledWith({}, 'LEI', 1, '10/10/2019')

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
          elite2Api,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          logError: () => {},
        })

        req.body = {
          ...body,
          preAppointmentLocation: null,
          postAppointmentLocation: 1,
          postAppointment: 'yes',
          preAppointment: 'yes',
        }

        await post(req, res)

        expect(existingEventsService.getExistingEventsForLocation).toHaveBeenCalledWith({}, 'LEI', 1, '10/10/2019')

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
        req.flash.mockImplementation(() => [
          {
            ...appointmentDetails,
            startTime: '2017-10-10T11:00',
            endTime: '2017-10-10T14:00',
          },
        ])

        req.body = {
          postAppointment: 'yes',
          preAppointment: 'yes',
          postAppointmentDuration: '60',
          preAppointmentDuration: '15',
          preAppointmentLocation: '2',
          postAppointmentLocation: '3',
          court: 'london',
        }

        res.redirect = jest.fn()
      })

      it('should create main appointment', async () => {
        const { post } = prepostAppointmentsFactory({
          elite2Api,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          logError: () => {},
        })

        await post(req, res)

        expect(whereaboutsApi.addVideoLinkAppointment).toHaveBeenCalledWith(
          {},
          {
            bookingId: 1,
            comment: 'Test',
            locationId: 1,
            startTime: '2017-10-10T11:00',
            endTime: '2017-10-10T14:00',
            court: 'London',
            madeByTheCourt: false,
          }
        )
      })

      it('should create main pre appointment', async () => {
        const { post } = prepostAppointmentsFactory({
          elite2Api,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          logError: () => {},
        })

        await post(req, res)

        expect(whereaboutsApi.addVideoLinkAppointment).toHaveBeenCalledWith(
          {},
          {
            bookingId: 1,
            comment: 'Test',
            locationId: 2,
            startTime: '2017-10-10T10:45:00',
            endTime: '2017-10-10T11:00:00',
            court: 'London',
            madeByTheCourt: false,
          }
        )
      })

      it('should create main post appointment', async () => {
        const { post } = prepostAppointmentsFactory({
          elite2Api,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          logError: () => {},
        })

        await post(req, res)

        expect(whereaboutsApi.addVideoLinkAppointment).toHaveBeenCalledWith(
          {},
          {
            bookingId: 1,
            comment: 'Test',
            locationId: 3,
            startTime: '2017-10-10T14:00',
            endTime: '2017-10-10T15:00:00',
            court: 'London',
            madeByTheCourt: false,
          }
        )
      })

      it('should not request pre or post appointments when "no" has been selected', async () => {
        const { post } = prepostAppointmentsFactory({
          elite2Api,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          logError: () => {},
        })

        req.body = {
          postAppointment: 'no',
          preAppointment: 'no',
          court: 'London',
        }
        await post(req, res)

        expect(whereaboutsApi.addVideoLinkAppointment.mock.calls.length).toBe(1)
      })

      it('should place pre and post appointment details into flash', async () => {
        const { post } = prepostAppointmentsFactory({
          elite2Api,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          logError: () => {},
        })

        req.body = {
          postAppointment: 'yes',
          preAppointment: 'yes',
          preAppointmentLocation: 1,
          postAppointmentLocation: 2,
          preAppointmentDuration: 15,
          postAppointmentDuration: 15,
          court: 'london',
        }

        await post(req, res)

        expect(req.flash).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({
            preAppointment: {
              endTime: '2017-10-10T11:00:00',
              locationId: 1,
              startTime: '2017-10-10T10:45:00',
              duration: 15,
            },
            postAppointment: {
              endTime: '2017-10-10T14:15:00',
              locationId: 2,
              startTime: '2017-10-10T14:00',
              duration: 15,
            },
          })
        )
      })

      it('should redirect to confirmation page', async () => {
        notifyClient.sendEmail = jest.fn()

        const { post } = prepostAppointmentsFactory({
          elite2Api,
          oauthApi,
          appointmentsService,
          whereaboutsApi,
          logError: () => {},
          raiseAnalyticsEvent: () => {},
        })

        req.body = {
          postAppointment: 'no',
          preAppointment: 'no',
          court: 'london',
        }
        await post(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
        expect(notifyClient.sendEmail).not.toHaveBeenCalled()
      })

      it('should try to send email with prison template when prison user has email', async () => {
        notifyClient.sendEmail = jest.fn()

        oauthApi.userEmail.mockReturnValue({
          email: 'test@example.com',
        })

        notifyClient.sendEmail = jest.fn()

        const { post } = prepostAppointmentsFactory({
          elite2Api,
          oauthApi,
          notifyClient,
          appointmentsService,
          existingEventsService,
          whereaboutsApi,
          logError: () => {},
          raiseAnalyticsEvent: () => {},
        })

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
