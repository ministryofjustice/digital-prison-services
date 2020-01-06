const { prepostAppointmentsFactory } = require('../controllers/prepostAppoinments')

describe('Pre post appointments', () => {
  const elite2Api = {}
  const appointmentsService = {}
  const existingEventsService = {}

  const req = {
    originalUrl: 'http://localhost',
    params: { offenderNo: 'A12345' },
    session: { userDetails: { activeCaseLoadId: 'LEI' } },
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
  }
  const body = {
    postAppointment: 'yes',
    preAppointment: 'no',
    postAppointmentDuration: '60',
    preAppointmentDuration: '60',
    preAppointmentLocation: '1',
  }

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.addAppointments = jest.fn()
    elite2Api.getLocation = jest.fn()
    appointmentsService.getAppointmentOptions = jest.fn()
    existingEventsService.getExistingEventsForLocation = jest.fn()

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

    req.flash.mockImplementation(() => [appointmentDetails])
  })

  describe('index', () => {
    it('should return correct links', async () => {
      const { index } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          links: {
            postAppointments: `/offenders/A12345/prepost-appointments`,
            prisonerProfile: `http://localhost:3000/offenders/A12345`,
          },
        })
      )
    })

    it('should return locations', async () => {
      const { index } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          locations: [{ value: 1, text: 'Room 3' }],
        })
      )
    })

    it('should return default form values', async () => {
      const { index } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          formValues: {
            postAppointment: 'yes',
            preAppointment: 'yes',
            postAppointmentDuration: 15,
            preAppointmentDuration: 15,
          },
        })
      )
    })

    it('should extract appointment details', async () => {
      const { index } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          details: {
            appointmentType: 'Videolink',
            comment: 'Test',
            date: 'Tuesday 10 October 2017',
            endTime: '14:00',
            location: 'Room 3',
            prisonerName: 'Doe, John (A12345)',
            recurring: 'No',
            startTime: '11:00',
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
      expect(res.render).toHaveBeenCalledWith('error.njk')
    })
  })

  describe('post', () => {
    it('should validate presence of room locations', async () => {
      const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

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
            { text: 'Select a room', href: '#preAppointmentLocation' },
            { text: 'Select a room', href: '#postAppointmentLocation' },
          ],
        })
      )
    })

    it('should validate presence of room locations when "no" have been selected', async () => {
      const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

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
          errors: [{ text: 'Select a room', href: '#preAppointmentLocation' }],
        })
      )
    })

    it('should return selected form values on validation errors', async () => {
      const { post } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        existingEventsService,
        logError: () => {},
      })

      req.body = body

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          formValues: {
            postAppointment: 'yes',
            preAppointment: 'no',
            postAppointmentDuration: '60',
            preAppointmentDuration: '60',
            preAppointmentLocation: 1,
          },
        })
      )
    })

    it('should return locations, links and summary details on validation errors', async () => {
      const { post } = prepostAppointmentsFactory({
        elite2Api,
        appointmentsService,
        existingEventsService,
        logError: () => {},
      })

      req.body = body

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prepostAppointments.njk',
        expect.objectContaining({
          links: {
            postAppointments: `/offenders/A12345/prepost-appointments`,
            prisonerProfile: `http://localhost:3000/offenders/A12345`,
          },
          locations: [{ value: 1, text: 'Room 3' }],
          details: {
            appointmentType: 'Videolink',
            comment: 'Test',
            date: 'Tuesday 10 October 2017',
            endTime: '14:00',
            location: 'Room 3',
            prisonerName: 'Doe, John (A12345)',
            recurring: 'No',
            startTime: '11:00',
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
      expect(res.render).toHaveBeenCalledWith('error.njk')
    })

    it('should pack appointment details back into flash before rendering', async () => {
      const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })
      req.body = body

      await post(req, res)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
    })

    describe('Events at location', () => {
      const locationEvents = [
        { locationId: 3, eventDescription: 'Doctors - An appointment', startTime: '12:00', endTime: '13:00' },
      ]

      beforeEach(() => {
        existingEventsService.getExistingEventsForLocation.mockReturnValue(locationEvents)
        elite2Api.getLocation.mockReturnValue({ userDescription: 'Test location' })
      })

      it('should return events at the pre appointment location on validation errors', async () => {
        const { post } = prepostAppointmentsFactory({
          elite2Api,
          appointmentsService,
          existingEventsService,
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
            recurring: 'yes',
            times: 1,
            repeats: 'DAILY',
          },
        ])

        req.body = {
          postAppointment: 'yes',
          preAppointment: 'yes',
          postAppointmentDuration: '60',
          preAppointmentDuration: '15',
          preAppointmentLocation: '2',
          postAppointmentLocation: '3',
        }

        res.redirect = jest.fn()
      })

      it('should create main appointment', async () => {
        const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

        await post(req, res)

        expect(elite2Api.addAppointments).toHaveBeenCalledWith(
          {},
          {
            appointmentDefaults: {
              comment: 'Test',
              locationId: 1,
              appointmentType: 'VLB',
              startTime: '2017-10-10T11:00',
              endTime: '2017-10-10T14:00',
            },
            appointments: [
              {
                bookingId,
              },
            ],
            repeat: {
              repeatPeriod: 'DAILY',
              count: 1,
            },
          }
        )
      })

      it('should create main pre appointment', async () => {
        const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

        await post(req, res)

        expect(elite2Api.addAppointments).toHaveBeenCalledWith(
          {},
          {
            appointmentDefaults: {
              comment: 'Test',
              locationId: 2,
              appointmentType: 'VLB',
              startTime: '2017-10-10T10:45:00',
              endTime: '2017-10-10T11:00:00',
            },
            appointments: [
              {
                bookingId,
              },
            ],
          }
        )
      })

      it('should create main post appointment', async () => {
        const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

        await post(req, res)

        expect(elite2Api.addAppointments).toHaveBeenCalledWith(
          {},
          {
            appointmentDefaults: {
              comment: 'Test',
              locationId: 3,
              appointmentType: 'VLB',
              startTime: '2017-10-10T14:00',
              endTime: '2017-10-10T15:00:00',
            },
            appointments: [
              {
                bookingId,
              },
            ],
          }
        )
      })

      it('should not request pre or post appointments when "no" has been selected', async () => {
        const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

        req.body = {
          postAppointment: 'no',
          preAppointment: 'no',
        }
        await post(req, res)

        expect(elite2Api.addAppointments.mock.calls.length).toBe(1)
      })

      it('should place pre and post appointment details into flash', async () => {
        const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

        req.body = {
          postAppointment: 'yes',
          preAppointment: 'yes',
          preAppointmentLocation: 1,
          postAppointmentLocation: 2,
          preAppointmentDuration: 15,
          postAppointmentDuration: 15,
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
        const { post } = prepostAppointmentsFactory({ elite2Api, appointmentsService, logError: () => {} })

        req.body = {
          postAppointment: 'no',
          preAppointment: 'no',
        }
        await post(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
      })
    })
  })
})
