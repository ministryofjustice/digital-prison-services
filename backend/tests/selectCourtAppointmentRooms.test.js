const { selectCourtAppointmentRoomsFactory } = require('../controllers/appointments/selectCourtAppointmentRooms')
const { notifyClient } = require('../shared/notifyClient')

describe('Select court appointment rooms', () => {
  const elite2Api = {}
  const oauthApi = {}
  const appointmentsService = {}

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
  }

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.getAgencyDetails = jest.fn()
    elite2Api.addSingleAppointment = jest.fn()
    elite2Api.getLocation = jest.fn()
    oauthApi.userEmail = jest.fn()
    appointmentsService.getAppointmentOptions = jest.fn()

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

    elite2Api.getAgencyDetails.mockReturnValue({ description: 'Moorland' })

    req.flash.mockImplementation(() => [appointmentDetails])
  })

  describe('index', () => {
    it('should return correct links', async () => {
      const { index } = selectCourtAppointmentRoomsFactory({ elite2Api, appointmentsService, logError })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          cancelLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms/cancel',
        })
      )
    })

    it('should return locations', async () => {
      const { index } = selectCourtAppointmentRoomsFactory({ elite2Api, appointmentsService, logError })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          locations: [{ value: 1, text: 'Room 3' }],
        })
      )
    })

    it('should extract appointment details', async () => {
      const { index } = selectCourtAppointmentRoomsFactory({ elite2Api, appointmentsService, logError })

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          details: {
            date: 'Tuesday 10 October 2017',
            endTime: '14:00',
            prisonerName: 'Doe, John (A12345)',
            startTime: '11:00',
            prison: 'Moorland',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const { index } = selectCourtAppointmentRoomsFactory({ elite2Api, appointmentsService, logError })

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
    it('should validate presence of room locations', async () => {
      const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, oauthApi, logError, appointmentsService })

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          errors: [
            { text: 'Select a room for the pre appointment', href: '#preAppointmentLocation' },
            { text: 'Select a room for the main appointment', href: '#mainAppointmentLocation' },
            { text: 'Select a room for the post appointment', href: '#postAppointmentLocation' },
          ],
        })
      )
    })

    it('should return selected form values on validation errors', async () => {
      const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, logError, appointmentsService })
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
      const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, logError, appointmentsService })

      await post(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentRooms.njk',
        expect.objectContaining({
          cancelLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms/cancel',
          locations: [{ text: 'Room 3', value: 1 }, { text: 'Room 2', value: 2 }, { text: 'Room 3', value: 3 }],
          details: {
            date: 'Tuesday 10 October 2017',
            startTime: '11:00',
            endTime: '14:00',
            prisonerName: 'Doe, John (A12345)',
          },
        })
      )
    })

    it('should throw and log an error when appointment details are missing from flash', async () => {
      const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, logError, appointmentsService })

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
      const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, logError, appointmentsService })

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
          preAppointmentLocation: '1',
          mainAppointmentLocation: '2',
          postAppointmentLocation: '3',
          comment: 'Test',
        }

        res.redirect = jest.fn()
      })

      it('should create main appointment', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, logError, appointmentsService })

        await post(req, res)

        expect(elite2Api.addSingleAppointment).toHaveBeenCalledWith({}, 1, {
          comment: 'Test',
          locationId: 2,
          appointmentType: 'VLB',
          startTime: '2017-10-10T11:00',
          endTime: '2017-10-10T14:00',
        })
      })

      it('should create main pre appointment 20 minutes before main with 20 minute duration', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, logError, appointmentsService })

        await post(req, res)

        expect(elite2Api.addSingleAppointment).toHaveBeenCalledWith({}, 1, {
          comment: 'Test',
          locationId: 1,
          appointmentType: 'VLB',
          startTime: '2017-10-10T10:40:00',
          endTime: '2017-10-10T11:00',
        })
      })

      it('should create main post appointment 20 minutes after main with 20 minute duration', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, logError, appointmentsService })

        await post(req, res)

        expect(elite2Api.addSingleAppointment).toHaveBeenCalledWith({}, 1, {
          comment: 'Test',
          locationId: 3,
          appointmentType: 'VLB',
          startTime: '2017-10-10T14:00',
          endTime: '2017-10-10T14:20:00',
        })
      })

      it('should not request pre or post appointments when "no" has been selected', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, logError, appointmentsService })

        req.flash.mockImplementation(() => [
          {
            ...appointmentDetails,
            preAppointmentRequired: 'no',
            postAppointmentRequired: 'no',
          },
        ])

        req.body = {
          mainAppointmentLocation: '2',
        }
        await post(req, res)

        expect(elite2Api.addSingleAppointment.mock.calls.length).toBe(1)
      })

      it('should place pre and post appointment details into flash', async () => {
        const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, logError, appointmentsService })

        req.body = {
          preAppointmentLocation: '1',
          mainAppointmentLocation: '2',
          postAppointmentLocation: '3',
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
        const { post } = selectCourtAppointmentRoomsFactory({ elite2Api, oauthApi, logError, appointmentsService })

        req.body = {
          preAppointmentLocation: '1',
          mainAppointmentLocation: '2',
          postAppointmentLocation: '3',
          comment: 'Test',
        }

        await post(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/offenders/A12345/confirm-appointment')
        expect(notifyClient.sendEmail).not.toHaveBeenCalled()
      })
    })

    it('should try to send email with court template when court user has email', async () => {
      notifyClient.sendEmail = jest.fn()

      oauthApi.userEmail.mockReturnValue({
        email: 'test@example.com',
      })

      const courtTemplateId = '7f44cd94-4a74-4b9d-aff8-386fec34bd2e'

      const { post } = selectCourtAppointmentRoomsFactory({
        elite2Api,
        oauthApi,
        notifyClient,
        logError,
        appointmentsService,
      })

      req.body = {
        preAppointmentLocation: '1',
        mainAppointmentLocation: '2',
        postAppointmentLocation: '3',
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
        preAppointmentLocation: 'Room 3',
        postAppointmentLocation: 'Room 3',
      }

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(courtTemplateId, 'test@example.com', {
        personalisation,
        reference: null,
      })
    })
  })
})
