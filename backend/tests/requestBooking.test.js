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

  beforeEach(() => {
    req = {
      body: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          name: 'Test User',
        },
        data: {},
      },
      params: {},
      flash: jest.fn(),
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    logError = jest.fn()
    notifyClient.sendEmail = jest.fn()

    controller = requestBookingFactory({ logError, notifyClient })
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      it('should make the correct calls for information and render the correct template', async () => {
        await controller.index(req, res)
        expect(res.render).toHaveBeenCalledWith('requestBooking/requestBooking.njk', {
          errors: undefined,
          formValues: undefined,
          homeUrl: '/videolink',
          user: {
            displayName: 'Test User',
          },
        })
      })
    })

    describe('post', () => {
      const validBody = {
        firstName: 'Test',
        lastName: 'Offender',
        dobDay: '01',
        dobMonth: '01',
        dobYear: '1970',
        prison: 'test@email.com',
        hearingLocation: "King's Court",
        caseNumber: 123446,
        startTimeHours: '01',
        startTimeMinutes: '00',
        endTimeHours: '02',
        endTimeMinutes: '00',
        comments: 'Test comment',
      }

      describe('when there are no errors', () => {
        beforeEach(() => {
          req.flash = jest.fn()
        })
        it('should submit the appointment with the correct details and redirect', async () => {
          jest.spyOn(Date, 'now').mockImplementation(() => 33103209600000) // Friday 3019-01-01T00:00:00.000Z
          req.body = { ...validBody, date: moment().format(DAY_MONTH_YEAR) }

          await controller.post(req, res)

          expect(res.redirect).toHaveBeenCalledWith(`/request-booking/confirmation`)
          expect(req.flash).toHaveBeenCalledWith('bookingDetails', {
            firstName: 'Test',
            lastName: 'Offender',
            date: '01/01/3019',
            dateOfBirth: '1 January 1970',
            prison: 'test@email.com',
            hearingLocation: "King's Court",
            caseNumber: 123446,
            startTime: '3019-01-01T01:00:00',
            endTime: '3019-01-01T02:00:00',
            comment: 'Test comment',
          })

          Date.now.mockRestore()
        })
      })

      describe('when there are form errors', () => {
        it('should validate and check for missing required fields', async () => {
          jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
          const date = moment().format(DAY_MONTH_YEAR)

          req.body = {
            date,
          }

          await controller.post(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'requestBooking/requestBooking.njk',
            expect.objectContaining({
              errors: [
                { href: '#first-name', text: 'Enter a first name' },
                { href: '#last-name', text: 'Enter a last name' },
                { href: '#hearing-location', text: 'Enter a court (hearing) location' },
                { href: '#case-number', text: 'Enter a case number' },
                { href: '#prison', text: 'Select a prison' },
                { href: '#end-time-hours', text: 'Select an end time' },
                { href: '#dobDay', text: 'Enter a date of birth' },
                { href: '#start-time-hours', text: 'Select a start time' },
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

          await controller.post(req, res)

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

          await controller.post(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'requestBooking/requestBooking.njk',
            expect.objectContaining({
              errors: expect.arrayContaining([
                { text: 'Select an end time that is not in the past', href: '#end-time-hours' },
              ]),
            })
          )
        })

        it('should validate maximum length of comments', async () => {
          req.body = {
            comments: [...Array(3601).keys()].map(_ => 'A').join(''),
          }

          await controller.post(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'requestBooking/requestBooking.njk',
            expect.objectContaining({
              errors: expect.arrayContaining([
                { href: '#comments', text: 'Maximum length should not exceed 3600 characters' },
              ]),
            })
          )
        })
      })
    })
  })

  describe('confirm', () => {
    it('should submit an email and render the confirmation template', async () => {
      req.flash.mockReturnValue([
        {
          firstName: 'Test',
          lastName: 'Offender',
          dateOfBirth: '17 July 1960',
          prison: 'test@email.com',
          caseNumber: 'Case 1234',
          hearingLocation: 'A court',
          date: '06/02/2020',
          comment: 'Test',
          startTime: '2020-02-06T03:10:00',
          endTime: '2020-02-06T07:20:00',
        },
      ])
      await controller.confirm(req, res)

      const details = {
        caseNumber: 'Case 1234',
        comment: 'Test',
        date: 'Thursday 6 February 2020',
        dateOfBirth: '17 July 1960',
        startTime: '03:10',
        endTime: '07:20',
        firstName: 'Test',
        lastName: 'Offender',
      }

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(requestBookingCourtTemplateId, 'test@email.com', {
        personalisation: expect.objectContaining({
          ...details,
          hearingLocation: 'A court',
        }),
        reference: null,
      })
      expect(res.render).toHaveBeenCalledWith('requestBooking/requestBookingConfirmation.njk', {
        details: {
          ...details,
          courtHearingLocation: 'A court',
          prison: 'test@email.com',
        },
        homeUrl: '/videolink',
        title: 'Request submitted',
        user: { displayName: 'Test User' },
      })
    })
  })
})
