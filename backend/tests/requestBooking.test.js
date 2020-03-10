const moment = require('moment')
const { requestBookingFactory } = require('../controllers/appointments/requestBooking')
const { DAY_MONTH_YEAR } = require('../../src/dateHelpers')
const { notifyClient } = require('../shared/notifyClient')
const {
  notifications: { requestBookingCourtTemplateId },
} = require('../config')

describe('Request a booking', () => {
  let req
  let res
  let logError
  let controller
  const whereaboutsApi = {}
  const oauthApi = {}

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
    controller = requestBookingFactory({ logError, notifyClient, whereaboutsApi, oauthApi })
  })

  describe('Start of journey', () => {
    it('should make the correct calls for information and render the correct template', async () => {
      await controller.startOfJourney(req, res)
      expect(res.render).toHaveBeenCalledWith('requestBooking/requestBooking.njk', {
        homeUrl: '/videolink',
        prisonsContactConfig: [
          {
            text: 'HMP Wandsworth',
            value: 'dominic.bull@digital.justice.gov.uk',
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
        startTimeHours: '01',
        startTimeMinutes: '00',
        endTimeHours: '02',
        endTimeMinutes: '00',
        comments: 'Test comment',
        preAppointmentRequired: 'no',
        postAppointmentRequired: 'no',
      }

      it('should stash the appointment details and redirect to offender details', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 33103209600000) // Friday 3019-01-01T00:00:00.000Z
        req.body = { ...validBody, date: moment().format(DAY_MONTH_YEAR) }

        await controller.checkAvailability(req, res)

        expect(req.flash).toHaveBeenCalledWith(
          'requestBooking',
          expect.objectContaining({
            date: '01/01/3019',
            prison: 'test@test',
            startTime: '3019-01-01T01:00:00',
            endTime: '3019-01-01T02:00:00',
            preAppointmentRequired: 'no',
            postAppointmentRequired: 'no',
          })
        )

        expect(res.redirect).toHaveBeenCalledWith('/request-booking/enter-offender-details')

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
            errors: [
              {
                text: 'Select if a pre-court hearing briefing is required',
                href: '#pre-appointment-required',
              },
              {
                text: 'Select if a post-court hearing briefing is required',
                href: '#post-appointment-required',
              },
              { text: 'Select a prison', href: '#prison' },
              { text: 'Select an end time', href: '#end-time-hours' },
              { text: 'Select a start time', href: '#start-time-hours' },
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
        const endTime = moment().subtract(2, 'hours')
        const endTimeHours = endTime.hour()
        const endTimeMinutes = endTime.minute()

        const startTime = moment().add(5, 'minutes')
        const startTimeHours = startTime.hour()
        const startTimeMinutes = startTime.minute()

        req.body = {
          date: moment().format(DAY_MONTH_YEAR),
          startTimeHours,
          startTimeMinutes,
          endTimeHours,
          endTimeMinutes,
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
  })

  describe('Enter offender details', () => {
    it('should render the correct template', async () => {
      await controller.enterOffenderDetails(req, res)
      expect(res.render).toHaveBeenCalledWith('requestBooking/offenderDetails.njk')
    })

    it('should validate missing offender details', async () => {
      req.body = {}

      await controller.validateOffenderDetails(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'requestBooking/offenderDetails.njk',
        expect.objectContaining({
          errors: [
            { href: '#first-name', text: 'Enter a first name' },
            { href: '#last-name', text: 'Enter a last name' },
            { href: '#dobDay', text: 'Enter a date of birth' },
          ],
        })
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

      await controller.validateOffenderDetails(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'requestBooking/offenderDetails.njk',
        expect.objectContaining({
          errors: expect.arrayContaining([
            { href: '#comments', text: 'Maximum length should not exceed 3600 characters' },
          ]),
        })
      )
    })

    it('should stash the offender details and redirect to select court', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        dobYear: 2019,
        dobMonth: 12,
        dobDay: 10,
        comments: 'test',
      }

      await controller.validateOffenderDetails(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBooking',
        expect.objectContaining({
          comments: 'test',
          dateOfBirth: '10 December 2019',
          firstName: 'John',
          lastName: 'Doe',
        })
      )
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/select-court')
    })
  })

  describe('Select court', () => {
    it('should render the correct template with the correct view model', async () => {
      whereaboutsApi.getCourtLocations.mockReturnValue({ courtLocations: ['London', 'York'] })
      req.flash.mockImplementation(key => {
        return key !== 'errors'
          ? [
              {
                date: '01/01/3019',
                startTime: '3019-01-01T01:00:00',
                endTime: '3019-01-01T02:00:00',
                prison: 'dominic.bull@digital.justice.gov.uk',
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
          details: {
            courtHearingEndTime: '02:00',
            courtHearingStartTime: '01:00',
            date: '1 January 3019',
            'post-court hearing briefing': '02:00 to 02:20',
            'pre-court hearing briefing': '00:40 to 01:00',
            prison: 'HMP Wandsworth',
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
  })

  describe('Create booking', () => {
    it('should stash error and redirect to select courts', async () => {
      req.body = {}
      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: 'Select a court location', href: '#hearingLocation' }])
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/select-court')
    })

    it('should submit two emails, one for the prison and another for the current user', async () => {
      oauthApi.userEmail.mockReturnValue({
        email: 'test@test',
      })
      req.flash.mockImplementation(() => [
        {
          date: '01/01/2019',
          startTime: '2919-01-01T10:00:00',
          endTime: '2019-01-01T11:00:00',
          prison: 'dominic.bull@digital.justice.gov.uk',
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
          comment: 'test',
          firstName: 'John',
          lastName: 'Doe',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          dateOfBirth: '14/05/1920',
        },
      ])
      req.body = { hearingLocation: 'London' }
      await controller.createBookingRequest(req, res)

      const personalisation = {
        date: 'Tuesday 1 January 2019',
        startTime: '10:00',
        endTime: '11:00',
        postHearingStartAndEndTime: '09:35 to 11:00',
        preHearingStartAndEndTime: '11:00 to 11:20',
        dateOfBirth: '14/05/1920',
        firstName: 'John',
        hearingLocation: 'London',
        lastName: 'Doe',
        comment: 'test',
        prison: 'dominic.bull@digital.justice.gov.uk',
      }

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        requestBookingCourtTemplateId,
        'dominic.bull@digital.justice.gov.uk',
        {
          personalisation,
          reference: null,
        }
      )

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(requestBookingCourtTemplateId, 'test@test', {
        personalisation,
        reference: null,
      })
    })

    it('should stash appointment details and redirect to the confirmation page', async () => {
      oauthApi.userEmail.mockReturnValue({
        email: 'test@test',
      })
      req.flash.mockImplementation(() => [
        {
          date: '01/01/2019',
          startTime: '2919-01-01T10:00:00',
          endTime: '2019-01-01T11:00:00',
          prison: 'dominic.bull@digital.justice.gov.uk',
          preAppointmentRequired: 'yes',
          postAppointmentRequired: 'yes',
          comment: 'test',
          firstName: 'John',
          lastName: 'Doe',
          postHearingStartAndEndTime: '09:35 to 11:00',
          preHearingStartAndEndTime: '11:00 to 11:20',
          dateOfBirth: '14/05/1920',
        },
      ])
      req.body = { hearingLocation: 'London' }
      await controller.createBookingRequest(req, res)

      expect(req.flash).toHaveBeenCalledWith('requestBooking', {
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
        prison: 'dominic.bull@digital.justice.gov.uk',
        startTime: '10:00',
      })
      expect(res.redirect).toHaveBeenCalledWith('/request-booking/confirmation')
    })
  })

  describe('confirm', () => {
    it('should submit an email and render the confirmation template', async () => {
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
        prison: 'dominic.bull@digital.justice.gov.uk',
        startTime: '10:00',
      }
      req.flash.mockReturnValue([details])
      await controller.confirm(req, res)

      expect(res.render).toHaveBeenCalledWith('requestBooking/requestBookingConfirmation.njk', {
        details: {
          prison: 'HMP Wandsworth',
          name: `Doe, John`,
          dateOfBirth: '14/05/1920',
          date: 'Tuesday 1 January 2019',
          courtHearingStartTime: '10:00',
          courtHearingEndTime: '11:00',
          comment: 'test',
          'post-court hearing briefing': '09:35 to 11:00',
          'pre-court hearing briefing': '11:00 to 11:20',
          courtLocation: 'London',
        },
        homeUrl: '/videolink',
        title: 'The video link has been requested',
        user: { displayName: 'Test User' },
      })
    })
  })
})
