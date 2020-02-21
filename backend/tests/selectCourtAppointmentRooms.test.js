const { selectCourtAppointmentRoomsFactory } = require('../controllers/appointments/selectCourtAppointmentRooms')
const { notifyClient } = require('../shared/notifyClient')
const config = require('../config')

describe('Select court appointment rooms', () => {
  const elite2Api = {}
  const whereaboutsApi = {}
  const oauthApi = {}
  const appointmentsService = {}
  const existingEventsService = {}

  const req = {
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345' },
    session: { userDetails: { activeCaseLoadId: 'LEI' } },
    body: {},
  }
  const res = { locals: {} }
  const logError = jest.fn()

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
    locationTypes: [{ value: 1, text: 'Room 3' }, { value: 2, text: 'Room 2' }, { value: 3, text: 'Room 3' }],
    date: '10/10/2019',
    preAppointmentRequired: 'yes',
    postAppointmentRequired: 'yes',
    court: 'Leeds',
  }

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.getAgencyDetails = jest.fn()
    elite2Api.addSingleAppointment = jest.fn()
    elite2Api.getLocation = jest.fn()
    oauthApi.userEmail = jest.fn()
    whereaboutsApi.addVideoLinkAppointment = jest.fn()
    appointmentsService.getAppointmentOptions = jest.fn()
    appointmentsService.getLocations = jest.fn()

    existingEventsService.getAppointmentsAtLocations = jest.fn()
    existingEventsService.getAvailableLocationsForVLB = jest.fn()

    req.flash = jest.fn()
    res.render = jest.fn()

    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [{ value: 'VLB', text: 'Videolink' }],
      locationTypes: [{ value: 1, text: 'Room 3' }],
    })

    existingEventsService.getAvailableLocationsForVLB.mockReturnValue({})

    elite2Api.getDetails.mockReturnValue({
      bookingId,
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
      assignedLivingUnitDesc: 'Cell 1',
    })

    elite2Api.getAgencyDetails.mockReturnValue({ description: 'Moorland' })

    req.flash.mockImplementation(() => [appointmentDetails])
  })

  describe('index', () => {
    it('should return correct links', async () => {
      const { index } = selectCourtAppointmentRoomsFactory({
        elite2Api,
        appointmentsService,
        logError,
        existingEventsService,
      })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          cancelLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms/cancel',
        })
      )
    })

    it('should return locations', async () => {
      const availableLocations = {
        mainLocations: [{ value: 1, text: 'Room 1' }],
        preLocations: [{ value: 2, text: 'Room 2' }],
        postLocations: [{ value: 3, text: 'Room 3' }],
      }
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue(availableLocations)

      const { index } = selectCourtAppointmentRoomsFactory({
        elite2Api,
        appointmentsService,
        logError,
        existingEventsService,
      })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining(availableLocations)
      )
    })

    it('should extract appointment details', async () => {
      const { index } = selectCourtAppointmentRoomsFactory({
        elite2Api,
        appointmentsService,
        logError,
        existingEventsService,
      })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          details: {
            date: '10 October 2017',
            endTime: '14:00',
            prisonerName: 'John Doe',
            startTime: '11:00',
            prison: 'Moorland',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const { index } = selectCourtAppointmentRoomsFactory({
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

  describe('post', () => {
    it('should return a validation message if the pre or post appointment location is the same as the main appointment location', async () => {
      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '1',
        selectPostAppointmentLocation: '1',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
        comment: 'Test',
      }

      const { post } = selectCourtAppointmentRoomsFactory({
        elite2Api,
        appointmentsService,
        logError,
        existingEventsService,
      })

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          errors: [
            {
              text: 'Select a room other than the one used for the main appointment',
              href: '#selectPostAppointmentLocation',
            },
            {
              text: 'Select a room other than the one used for the main appointment',
              href: '#selectPreAppointmentLocation',
            },
          ],
        })
      )
    })
    it('should validate presence of room locations', async () => {
      const { post } = selectCourtAppointmentRoomsFactory({
        elite2Api,
        appointmentsService,
        logError,
        existingEventsService,
        oauthApi,
      })

      req.body = {
        selectPreAppointmentLocation: null,
        selectMainAppointmentLocation: null,
        selectPostAppointmentLocation: null,
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
        comment: 'Test',
      }

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          errors: [
            { text: 'Select a room for the main appointment', href: '#selectMainAppointmentLocation' },
            { text: 'Select a room for the pre appointment', href: '#selectPreAppointmentLocation' },
            { text: 'Select a room for the post appointment', href: '#selectPostAppointmentLocation' },
          ],
        })
      )
    })

    it('should return selected form values on validation errors', async () => {
      const { post } = selectCourtAppointmentRoomsFactory({
        elite2Api,
        appointmentsService,
        logError,
        existingEventsService,
      })
      const comment = 'Some supporting comment text'

      req.body = { comment }

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          formValues: { comment },
        })
      )
    })

    it('should return locations, links and summary details on validation errors', async () => {
      const { post } = selectCourtAppointmentRoomsFactory({
        elite2Api,
        appointmentsService,
        logError,
        existingEventsService,
      })

      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          mainLocations: [{ value: 1, text: 'Room 3' }],
          postLocations: [{ value: 1, text: 'Room 3' }],
          preLocations: [{ value: 1, text: 'Room 3' }],
        },
      ])

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          cancelLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms/cancel',
          mainLocations: [{ value: 1, text: 'Room 3' }],
          postLocations: [{ value: 1, text: 'Room 3' }],
          preLocations: [{ value: 1, text: 'Room 3' }],
          details: {
            date: '10 October 2017',
            startTime: '11:00',
            endTime: '14:00',
            prisonerName: 'John Doe',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, appointmentsService, logError })

      req.flash.mockImplementation(() => [])

      await post(req, res)

      expect(logError).toHaveBeenCalledWith(
        'http://localhost',
        new Error('Appointment details are missing'),
        'Sorry, the service is unavailable'
      )
      expect(res.render).toHaveBeenCalledWith('error.njk')
    })

    it('should pack appointment details back into flash before rendering', async () => {
      const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, appointmentsService, logError })

      await post(req, res)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
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
          selectPreAppointmentLocation: '1',
          selectMainAppointmentLocation: '2',
          selectPostAppointmentLocation: '3',
          comment: 'Test',
        }

        res.redirect = jest.fn()
      })

      it('should create main appointment', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({
          elite2Api,
          whereaboutsApi,
          appointmentsService,
          logError,
        })

        await post(req, res)

        expect(whereaboutsApi.addVideoLinkAppointment).toHaveBeenCalledWith(
          {},
          {
            bookingId: 1,
            court: 'Leeds',
            hearingType: 'MAIN',
            comment: 'Test',
            locationId: 2,
            startTime: '2017-10-10T11:00',
            endTime: '2017-10-10T14:00',
          }
        )
      })

      it('should create main pre appointment 20 minutes before main with 20 minute duration', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({
          elite2Api,
          whereaboutsApi,
          appointmentsService,
          logError,
        })

        await post(req, res)

        expect(whereaboutsApi.addVideoLinkAppointment).toHaveBeenCalledWith(
          {},
          {
            bookingId: 1,
            court: 'Leeds',
            hearingType: 'PRE',
            comment: 'Test',
            locationId: 1,
            startTime: '2017-10-10T10:40:00',
            endTime: '2017-10-10T11:00',
          }
        )
      })

      it('should create main post appointment 20 minutes after main with 20 minute duration', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({
          elite2Api,
          whereaboutsApi,
          appointmentsService,
          logError,
        })

        await post(req, res)

        expect(whereaboutsApi.addVideoLinkAppointment).toHaveBeenCalledWith(
          {},
          {
            bookingId: 1,
            court: 'Leeds',
            hearingType: 'POST',
            comment: 'Test',
            locationId: 3,
            startTime: '2017-10-10T14:00',
            endTime: '2017-10-10T14:20:00',
          }
        )
      })

      it('should not request pre or post appointments when "no" has been selected', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({
          elite2Api,
          whereaboutsApi,
          appointmentsService,
          logError,
          notifyClient,
          oauthApi,
        })

        req.flash.mockImplementation(() => [
          {
            ...appointmentDetails,
            preAppointmentRequired: 'no',
            postAppointmentRequired: 'no',
          },
        ])

        req.body = {
          selectMainAppointmentLocation: '2',
        }
        await post(req, res)

        expect(whereaboutsApi.addVideoLinkAppointment.mock.calls.length).toBe(1)
      })

      it('should place pre and post appointment details into flash', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({
          elite2Api,
          whereaboutsApi,
          appointmentsService,
          logError,
        })

        req.body = {
          selectPreAppointmentLocation: '1',
          selectMainAppointmentLocation: '2',
          selectPostAppointmentLocation: '3',
          comment: 'Test',
        }

        await post(req, res)

        expect(req.flash).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({
            locationId: '2',
            comment: 'Test',
            postAppointment: { endTime: '2017-10-10T14:20:00', locationId: 3, startTime: '2017-10-10T14:00' },
            preAppointment: { endTime: '2017-10-10T11:00', locationId: 1, startTime: '2017-10-10T10:40:00' },
          })
        )
      })

      it('should redirect to confirmation page', async () => {
        notifyClient.sendEmail = jest.fn()
        const { post } = selectCourtAppointmentRoomsFactory({
          elite2Api,
          whereaboutsApi,
          oauthApi,
          logError,
          appointmentsService,
        })

        req.body = {
          selectPreAppointmentLocation: '1',
          selectMainAppointmentLocation: '2',
          selectPostAppointmentLocation: '3',
          comment: 'Test',
        }

        await post(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
        expect(notifyClient.sendEmail).not.toHaveBeenCalled()
      })
    })

    it('should try to send email with court template when court user has email', async () => {
      notifyClient.sendEmail = jest.fn()

      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preLocations: [{ value: 1, text: 'Room 1' }],
          mainLocations: [{ value: 2, text: 'Room 2' }],
          postLocations: [{ value: 3, text: 'Room 3' }],
        },
      ])

      oauthApi.userEmail.mockReturnValue({
        email: 'test@example.com',
      })

      const { post } = selectCourtAppointmentRoomsFactory({
        elite2Api,
        whereaboutsApi,
        oauthApi,
        notifyClient,
        logError,
        appointmentsService,
        existingEventsService,
      })

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      await post(req, res)

      const personalisation = {
        startTime: appointmentDetails.startTime,
        endTime: appointmentDetails.endTime,
        comment: appointmentDetails.comment,
        firstName: appointmentDetails.firstName,
        lastName: appointmentDetails.lastName,
        offenderNo: appointmentDetails.offenderNo,
        location: 'Room 2',
        preAppointmentStartTime: '2017-10-10T10:40:00',
        preAppointmentEndTime: '2017-10-10T11:00',
        postAppointmentStartTime: '2017-10-10T14:00',
        postAppointmentEndTime: '2017-10-10T14:20:00',
        preAppointmentLocation: 'Room 1',
        postAppointmentLocation: 'Room 3',
      }

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        config.notifications.confirmBookingCourtTemplateId,
        'test@example.com',
        {
          personalisation,
          reference: null,
        }
      )
    })
  })
})
