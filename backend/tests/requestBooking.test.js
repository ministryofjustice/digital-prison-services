const moment = require('moment')

process.env.VIDEO_LINK_ENABLED_FOR = 'WWI'
process.env.WANDSWORTH_VLB_EMAIL = 'test@justice.gov.uk'
const config = require('../config')

const { requestBookingFactory } = require('../controllers/appointments/requestBooking')
const { DAY_MONTH_YEAR } = require('../../src/dateHelpers')
const { notifyClient } = require('../shared/notifyClient')
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')

const { requestBookingCourtTemplateVLBAdminId, requestBookingCourtTemplateRequesterId } = config.notifications

jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

describe('Request a booking', () => {
  let req
  let res
  let logError
  let controller
  const whereaboutsApi = {}
  const oauthApi = {}
  const elite2Api = {}

  beforeEach(() => {
    req = {
      body: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          name: 'Test User',
          username: 'testUsername',
        },
        data: {},
      },
      params: {},
      flash: jest.fn(),
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
    res.redirect = jest.fn()
    req.flash = jest.fn()
    req.flash.mockImplementation(() => [])

    logError = jest.fn()
    notifyClient.sendEmail = jest.fn()
    whereaboutsApi.getCourtLocations = jest.fn()
    oauthApi.userEmail = jest.fn()
    oauthApi.userDetails = jest.fn()
    elite2Api.getAgencies = jest.fn()

    elite2Api.getAgencies.mockReturnValue([{ agencyId: 'WWI', description: 'HMP Wandsworth' }])

    oauthApi.userEmail.mockReturnValue({ email: 'test@test' })
    oauthApi.userDetails.mockReturnValue({ name: 'Staff member' })

    controller = requestBookingFactory({ logError, notifyClient, whereaboutsApi, oauthApi, elite2Api })

    raiseAnalyticsEvent.mockRestore()
  })

  describe('Start of journey', () => {
    it('should make the correct calls for information and render the correct template', async () => {
      await controller.startOfJourney(req, res)
      expect(res.render).toHaveBeenCalledWith('requestBooking/requestBooking.njk', {
        homeUrl: '/videolink',
        prisons: [
          {
            text: 'HMP Wandsworth',
            value: 'WWI',
          },
        ],
        user: {
          displayName: 'Test User',
        },
      })
    })

    describe('Check availability', () => {
      const validBody = {
        prison: 'test@test',
        startTimeHours: '22',
        startTimeMinutes: '05',
        endTimeHours: '23',
        endTimeMinutes: '05',
        comments: 'Test comment',
        preAppointmentRequired: 'no',
        postAppointmentRequired: 'no',
      }

      it('should stash the appointment details and redirect to offender details', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z

        req.body = { ...validBody, date: moment().format(DAY_MONTH_YEAR) }

        await controller.checkAvailability(req, res)

        expect(req.flash).toHaveBeenCalledWith(
          'requestBooking',
          expect.objectContaining({
            date: '29/03/2019',
            prison: 'test@test',
            startTime: '2019-03-29T22:05:00',
            endTime: '2019-03-29T23:05:00',
            preAppointmentRequired: 'no',
            postAppointmentRequired: 'no',
          })
        )

        expect(res.redirect).toHaveBeenCalledWith('/request-booking/select-court')

        Date.now.mockRestore()
      })

      it('should validate and check for missing required fields', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
        const date = moment().format(DAY_MONTH_YEAR)

        req.body = {
          date,
        }

        await controller.checkAvailability(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'requestBooking/requestBooking.njk',
          expect.objectContaining({
            formValues: {
              date,
            },
            errors: [
              { href: '#pre-appointment-required', text: 'Select yes if you want to add a pre-court hearing briefing' },
              {
                href: '#post-appointment-required',
                text: 'Select yes if you want to add a post-court hearing briefing',
              },
              { href: '#prison', text: 'Select which prison you want a video link with' },
              { href: '#start-time-hours', text: 'Select the start time of the court hearing video link' },
              { href: '#end-time-hours', text: 'Select the end time of the court hearing video link' },
            ],
          })
        )

        Date.now.mockRestore()
      })

      it('should return validation messages for start times being in the past', async () => {
        const date = moment().format(DAY_MONTH_YEAR)
        const startTime = moment().subtract(5, 'minutes')
        const startTimeHours = startTime.hour()
        const startTimeMinutes = startTime.minute()

        req.body = {
          date,
          startTimeHours,
          startTimeMinutes,
        }

        await controller.checkAvailability(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'requestBooking/requestBooking.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { text: 'Select a start time that is not in the past', href: '#start-time-hours' },
            ]),
          })
        )
      })

      it('should validate that the end time comes after the start time', async () => {
        req.body = {
          date: moment().format(DAY_MONTH_YEAR),
          startTimeHours: '23',
          startTimeMinutes: '00',
          endTimeHours: '22',
          endTimeMinutes: '00',
        }

        await controller.checkAvailability(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'requestBooking/requestBooking.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { text: 'Select an end time that is not in the past', href: '#end-time-hours' },
            ]),
          })
        )
      })
    })

    it('should validate full start and end time', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
      const date = moment().format(DAY_MONTH_YEAR)

      req.body = {
        prison: 'WWI',
        date,
        startTimeHours: '23',
        endTimeHours: '22',
        preAppointmentRequired: 'no',
        postAppointmentRequired: 'no',
      }

      await controller.checkAvailability(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'requestBooking/requestBooking.njk',
        expect.objectContaining({
          errors: [
            {
              text: 'Select a full start time of the court hearing video link',
              href: '#start-time-hours',
            },
            {
              text: 'Select a full end time of the court hearing video link',
              href: '#end-time-hours',
            },
          ],
        })
      )

      Date.now.mockRestore()
    })
  })

  describe('Enter offender details', () => {
    it('should render the correct template with errors and form values', async () => {
      const errors = [{ href: '#first-name', text: 'Enter a first name' }]
      req.flash.mockImplementation(key => (key === 'errors' ? errors : [{ lastName: 'doe' }]))

      await controller.enterOffenderDetails(req, res)
      expect(res.render).toHaveBeenCalledWith('requestBooking/offenderDetails.njk', {
        errors,
        formValues: { lastName: 'doe' },
      })
    })

    it('should stash the offender details and redirect to the confirmation page', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: 'test',
      }
      oauthApi.userEmail.mockReturnValue({
        email: 'test@test',
      })
      req.flash.mockImplementation(() => [
        {
          date: '01/01/2019',
          startTime: '2919-01-01T10:00:00',
          endTime: '2019-01-01T11:00:00',
          prison: 'WWI',
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          dateOfBirth: '14/05/1920',
        },
      ])

      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBooking',
        expect.objectContaining({
          comment: 'test',
          date: 'Tuesday 1 January 2019',
          dateOfBirth: '10 December 2019',
          endTime: '11:00',
          firstName: 'John',
          lastName: 'Doe',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          prison: 'HMP Wandsworth',
          startTime: '10:00',
        })
      )
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/confirmation')
    })

    it('should add provide default comment value', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
      }
      oauthApi.userEmail.mockReturnValue({ email: 'test@test' })
      req.flash.mockImplementation(() => [{ prison: 'WWI' }])

      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBooking',
        expect.objectContaining({
          comment: 'None entered',
        })
      )
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/confirmation')
    })
  })

  describe('Select court', () => {
    it('should stash correct values into flash', async () => {
      whereaboutsApi.getCourtLocations.mockReturnValue({ courtLocations: ['London', 'York'] })
      req.flash.mockImplementation(key => {
        return key !== 'errors'
          ? [
              {
                date: '01/01/3019',
                startTime: '3019-01-01T01:00:00',
                endTime: '3019-01-01T02:00:00',
                prison: 'WWI',
                preAppointmentRequired: 'no',
                postAppointmentRequired: 'yes',
              },
            ]
          : []
      })

      await controller.selectCourt(req, res)

      expect(req.flash).toHaveBeenCalledWith('requestBooking', {
        date: '01/01/3019',
        endTime: '3019-01-01T02:00:00',
        postAppointmentRequired: 'yes',
        postHearingStartAndEndTime: '02:00 to 02:20',
        preAppointmentRequired: 'no',
        preHearingStartAndEndTime: 'Not required',
        prison: 'WWI',
        startTime: '3019-01-01T01:00:00',
      })
    })
    it('should render the correct template with the correct view model', async () => {
      whereaboutsApi.getCourtLocations.mockReturnValue({ courtLocations: ['London', 'York'] })
      req.flash.mockImplementation(key => {
        return key !== 'errors'
          ? [
              {
                date: '01/01/3019',
                startTime: '3019-01-01T01:00:00',
                endTime: '3019-01-01T02:00:00',
                prison: 'WWI',
                preAppointmentRequired: 'yes',
                postAppointmentRequired: 'yes',
              },
            ]
          : []
      })

      await controller.selectCourt(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'requestBooking/selectCourt.njk',
        expect.objectContaining({
          prisonDetails: {
            prison: 'HMP Wandsworth',
          },
          hearingDetails: {
            courtHearingEndTime: '02:00',
            courtHearingStartTime: '01:00',
            date: '1 January 3019',
          },
          prePostDetails: {
            'post-court hearing briefing': '02:00 to 02:20',
            'pre-court hearing briefing': '00:40 to 01:00',
          },
          hearingLocations: [
            {
              text: 'London',
              value: 'London',
            },
            {
              text: 'York',
              value: 'York',
            },
          ],
        })
      )
    })

    it('should stash hearing location into flash and redirect to enter offender details', async () => {
      req.body = { hearingLocation: 'London' }
      await controller.validateCourt(req, res)

      expect(req.flash).toHaveBeenCalledWith('requestBooking', {
        hearingLocation: 'London',
      })
      expect(res.redirect('/request-booking/enter-offender-details'))
    })
  })

  describe('Create booking', () => {
    it('should stash error and redirect to select courts', async () => {
      req.body = {}
      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [
        { text: 'Enter a first name', href: '#first-name' },
        { text: 'Enter a last name', href: '#last-name' },
        { text: 'Enter a date of birth', href: '#dobDay' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/enter-offender-details')
    })

    it('should validate missing offender details', async () => {
      const bookingDetails = {
        date: '01/01/3019',
        startTime: '3019-01-01T01:00:00',
        endTime: '3019-01-01T02:00:00',
        prison: 'WWI',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
      }
      req.flash.mockImplementation(() => [bookingDetails])
      req.body = { stuff: 'stuffOne' }

      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith('formValues', { stuff: 'stuffOne' })
      expect(req.flash).toHaveBeenCalledWith('requestBooking', bookingDetails)
      expect(req.flash).toHaveBeenCalledWith(
        'errors',
        expect.objectContaining([
          { href: '#first-name', text: 'Enter a first name' },
          { href: '#last-name', text: 'Enter a last name' },
          { href: '#dobDay', text: 'Enter a date of birth' },
        ])
      )

      expect(req.flash).toHaveBeenCalledWith('formValues', req.body)

      expect(res.redirect('/request-booking/enter-offender-details'))
    })

    it('should trigger date of birth in the past validation message', async () => {
      req.body = {
        dobDay: 1,
        dobMonth: 1,
        dobYear: 8000,
        firstName: 'John',
        lastName: 'Doe',
      }

      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'errors',
        expect.objectContaining([
          { href: '#dobDay', text: 'Enter a date of birth which is in the past' },
          { href: '#dobError' },
        ])
      )
    })

    it('should trigger date of birth not real validation message', async () => {
      req.body = {
        dobDay: 200,
        dobMonth: 200,
        dobYear: 8000,
        firstName: 'John',
        lastName: 'Doe',
      }

      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'errors',
        expect.objectContaining([
          { href: '#dobDay', text: 'Enter a date of birth which is a real date' },
          { href: '#dobError' },
        ])
      )
    })

    it('should validate maximum length of comments', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: [...Array(3601).keys()].map(_ => 'A').join(''),
      }

      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'errors',
        expect.objectContaining([{ href: '#comments', text: 'Maximum length should not exceed 3600 characters' }])
      )
    })

    it('should submit two emails, one for the prison and another for the current user', async () => {
      req.flash.mockImplementation(() => [
        {
          date: '01/01/2019',
          startTime: '2919-01-01T10:00:00',
          endTime: '2019-01-01T11:00:00',
          prison: 'WWI',
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          courtHearing: 'HMP Wandsworth',
          hearingLocation: 'London',
        },
      ])
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: 'test',
      }
      await controller.createBookingRequest(req, res)

      const personalisation = {
        date: 'Tuesday 1 January 2019',
        startTime: '10:00',
        endTime: '11:00',
        postHearingStartAndEndTime: '09:35 to 11:00',
        preHearingStartAndEndTime: '11:00 to 11:20',
        dateOfBirth: '10 December 2019',
        firstName: 'John',
        hearingLocation: 'London',
        lastName: 'Doe',
        comment: 'test',
        prison: 'HMP Wandsworth',
      }

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        requestBookingCourtTemplateVLBAdminId,
        'test@justice.gov.uk',
        expect.objectContaining({
          personalisation,
          reference: null,
        })
      )

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        requestBookingCourtTemplateRequesterId,
        'test@test',
        expect.objectContaining({
          personalisation: {
            ...personalisation,
            username: 'Staff member',
          },
          reference: null,
        })
      )
    })

    it('should stash appointment details and redirect to the confirmation page', async () => {
      req.flash.mockImplementation(() => [
        {
          date: '01/01/2019',
          startTime: '2919-01-01T10:00:00',
          endTime: '2019-01-01T11:00:00',
          prison: 'WWI',
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          hearingLocation: 'London',
        },
      ])
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: 'test',
      }
      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBooking',
        expect.objectContaining({
          date: 'Tuesday 1 January 2019',
          endTime: '11:00',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          prison: 'HMP Wandsworth',
          startTime: '10:00',
          hearingLocation: 'London',
          firstName: 'John',
          lastName: 'Doe',
          comment: 'test',
        })
      )
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/confirmation')
    })
  })

  describe('confirm', () => {
    it('should submit an email and render the confirmation template', () => {
      const details = {
        comment: 'test',
        date: 'Tuesday 1 January 2019',
        dateOfBirth: '14/05/1920',
        endTime: '11:00',
        firstName: 'John',
        hearingLocation: 'London',
        lastName: 'Doe',
        postAppointmentRequired: 'yes',
        postHearingStartAndEndTime: '09:35 to 11:00',
        preAppointmentRequired: 'yes',
        preHearingStartAndEndTime: '11:00 to 11:20',
        prison: 'HMP Wandsworth',
        startTime: '10:00',
      }
      req.flash.mockReturnValue([details])
      controller.confirm(req, res)

      expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
        'VLB Appointments',
        'Video link requested for London',
        'Pre: Yes | Post: Yes'
      )

      expect(res.render).toHaveBeenCalledWith('requestBooking/requestBookingConfirmation.njk', {
        details: {
          prison: 'HMP Wandsworth',
          name: 'John Doe',
          dateOfBirth: '14/05/1920',
        },
        hearingDetails: {
          date: 'Tuesday 1 January 2019',
          courtHearingStartTime: '10:00',
          courtHearingEndTime: '11:00',
          comment: 'test',
        },
        prePostDetails: {
          'post-court hearing briefing': '09:35 to 11:00',
          'pre-court hearing briefing': '11:00 to 11:20',
        },
        courtDetails: {
          courtLocation: 'London',
        },
        homeUrl: '/videolink',
        title: 'The video link has been requested',
        user: { displayName: 'Test User' },
      })
    })

    it('should render an error and not raise analytics event if there are no request details', () => {
      const details = {}
      req.flash.mockReturnValue([details])
      controller.confirm(req, res)

      expect(raiseAnalyticsEvent).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('courtServiceError.njk', { url: 'http://localhost' })
    })
  })
})
