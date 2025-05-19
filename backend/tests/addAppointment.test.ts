import moment from 'moment'
import { addAppointmentFactory } from '../controllers/appointments/addAppointment'
import { DAY_MONTH_YEAR } from '../../common/dateHelpers'
import { repeatTypes } from '../shared/appointmentConstants'

describe('Add appointment', () => {
  const prisonApi = {} as any
  const appointmentsService = {} as any
  const existingEventsService = {} as any
  const whereaboutsApi = {} as any
  const offenderNo = 'ABC123'
  const bookingId = 123
  const context = { _type: 'context' }
  const systemOauthClient = { getClientCredentialsTokens: () => context }

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
          activeCaseLoadId: 'LEI',
        },
        data: {},
      },
      params: {},
      flash: jest.fn(),
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    logError = jest.fn()

    appointmentsService.getAppointmentOptions = jest.fn()
    appointmentsService.getAppointmentOptions.mockReturnValue({
      appointmentTypes: [],
      locationTypes: [],
    })

    existingEventsService.getExistingEventsForOffender = jest.fn()
    existingEventsService.getExistingEventsForLocation = jest.fn()

    prisonApi.getDetails = jest.fn()
    prisonApi.getLocation = jest.fn()

    whereaboutsApi.createAppointment = jest.fn()

    controller = addAppointmentFactory(
      appointmentsService,
      systemOauthClient,
      existingEventsService,
      prisonApi,
      whereaboutsApi,
      logError
    )
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      beforeEach(() => {
        req.params.offenderNo = offenderNo
        prisonApi.getDetails.mockReturnValue({
          bookingId,
          firstName: 'BARRY',
          lastName: 'SMITH',
          agencyId: 'MDI',
        })
      })

      it('should make the correct calls for information and render the correct template', async () => {
        await controller.index(req, res)

        expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
        expect(appointmentsService.getAppointmentOptions).toHaveBeenCalledWith(res.locals, context, 'MDI')
        expect(res.render).toHaveBeenCalledWith('addAppointment/addAppointment.njk', {
          bookingId,
          offenderNo,
          appointmentLocations: [],
          appointmentTypes: [],
          errors: undefined,
          offenderName: 'Smith, Barry',
          firstName: 'Barry',
          lastName: 'Smith',
          repeatTypes,
        })
      })
    })

    describe('when there are API errors', () => {
      const error = new Error('Network error')
      beforeEach(() => {
        req.params.offenderNo = offenderNo
        prisonApi.getDetails.mockRejectedValue(error)
      })

      it('should render the error template', async () => {
        res.status = jest.fn()

        await expect(controller.index(req, res)).rejects.toThrowError(error)
        expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
      })
    })
  })

  describe('post', () => {
    const validBody = {
      appointmentType: 'APT1',
      location: '1',
      date: moment().format(DAY_MONTH_YEAR),
      startTimeHours: '01',
      startTimeMinutes: '00',
      endTimeHours: '02',
      endTimeMinutes: '00',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      comments: 'Test comment',
      bookingId,
    }

    beforeEach(() => {
      req.params.offenderNo = offenderNo
      prisonApi.getDetails.mockReturnValue({
        bookingId,
        firstName: 'BARRY',
        lastName: 'SMITH',
        agencyId: 'MDI',
      })

      prisonApi.getLocation = jest.fn().mockResolvedValue({ userDescription: 'Gym' })
      existingEventsService.getExistingEventsForLocation = jest.fn().mockResolvedValue([{ eventId: 1 }, { eventId: 2 }])
    })

    describe('when there are no errors', () => {
      const appointmentDefaults = {
        appointmentType: 'APT1',
        locationId: 1,
        startTime: '3019-01-01T01:00:00',
        endTime: '3019-01-01T02:00:00',
        comment: 'Test comment',
      }
      beforeEach(() => {
        prisonApi.addAppointments = jest.fn().mockReturnValue('All good')
        req.flash = jest.fn()
      })

      it('should submit the appointment with the correct details and redirect', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 33103209600000) // Friday 3019-01-01T00:00:00.000Z
        req.body = { ...validBody, date: moment().format(DAY_MONTH_YEAR) }

        await controller.post(req, res)

        expect(whereaboutsApi.createAppointment).toHaveBeenCalledWith(res.locals, {
          ...appointmentDefaults,
          bookingId,
          repeat: {
            count: '1',
            repeatPeriod: 'DAILY',
          },
        })
        expect(res.redirect).toHaveBeenCalledWith(`/offenders/${offenderNo}/confirm-appointment`)
        expect(req.flash).toHaveBeenCalledWith('appointmentDetails', {
          appointmentType: 'APT1',
          bookingId: 123,
          locationId: 1,
          startTime: '3019-01-01T01:00:00',
          endTime: '3019-01-01T02:00:00',
          comment: 'Test comment',
          recurring: 'yes',
          times: '1',
          repeats: 'DAILY',
        })

        const spy = jest.spyOn(Date, 'now')
        spy.mockRestore()
      })
    })

    describe('when there are API errors', () => {
      it('should render the error template', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 33103209600000) // Friday 3019-01-01T00:00:00.000Z
        req.body = { ...validBody, date: moment().format(DAY_MONTH_YEAR) }
        res.status = jest.fn()

        const error = new Error('Network error')

        whereaboutsApi.createAppointment.mockRejectedValue(error)

        await expect(controller.post(req, res)).rejects.toThrowError(error)
        expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)

        const spy = jest.spyOn(Date, 'now')
        spy.mockRestore()
      })
    })

    describe('when there are form errors', () => {
      beforeEach(() => {
        req.params.offenderNo = offenderNo
        prisonApi.getDetails.mockReturnValue({
          bookingId,
          firstName: 'BARRY',
          lastName: 'SMITH',
          agencyId: 'MDI',
        })
      })

      it('should validate and check for missing required fields', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
        const date = moment().format(DAY_MONTH_YEAR)

        req.body = {
          date,
          recurring: 'yes',
          repeats: 'WEEKLY',
          times: '5',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: [
              { href: '#appointment-type', text: 'Select the type of appointment' },
              { href: '#location', text: 'Select the location' },
              { href: '#start-time-hours', text: 'Select the appointment start time' },
            ],
            endOfPeriod: 'Friday 26 April 2019',
          })
        )

        const spy = jest.spyOn(Date, 'now')
        spy.mockRestore()
      })

      it('should validate missing answer for a recurring appointment', async () => {
        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { href: '#recurring', text: 'Select yes if this is a recurring appointment' },
            ]),
          })
        )
      })

      it('should return validation messages for start times being in the past', async () => {
        const date = moment().format(DAY_MONTH_YEAR)
        const fiveMinutesPrior = moment().subtract(5, 'minutes')
        const startTimeHours = fiveMinutesPrior.hour()
        const startTimeMinutes = fiveMinutesPrior.minute()

        req.body = {
          date,
          startTimeHours,
          startTimeMinutes,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { text: 'Select an appointment start time that is not in the past', href: '#start-time-hours' },
            ]),
          })
        )
      })

      it('should validate that the end time comes after the start time', async () => {
        const twoHoursPrior = moment().subtract(2, 'hours')
        const endTimeHours = twoHoursPrior.hour()
        const endTimeMinutes = twoHoursPrior.minute()

        const fiverMinutesHence = moment().add(5, 'minutes')
        const startTimeHours = fiverMinutesHence.hour()
        const startTimeMinutes = fiverMinutesHence.minute()

        req.body = {
          date: moment().format(DAY_MONTH_YEAR),
          startTimeHours,
          startTimeMinutes,
          endTimeHours,
          endTimeMinutes,
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { text: 'Select an appointment end time that is not in the past', href: '#end-time-hours' },
            ]),
          })
        )
      })

      it('should validate maximum length of comments', async () => {
        req.body = {
          comments: [...Array(3601).keys()].map((_) => 'A').join(''),
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { href: '#comments', text: 'Maximum length should not exceed 3600 characters' },
            ]),
          })
        )
      })

      it('should validate end time is required if video link appointment', async () => {
        req.body = {
          appointmentType: 'VLB',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([{ href: '#end-time-hours', text: 'Select an appointment end time' }]),
          })
        )
      })

      it('should not validate end time is required if not a video link appointment', async () => {
        req.body = {
          appointmentType: 'AP1',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            errors: expect.not.arrayContaining([{ href: '#end-time-hours', text: 'Select an end time' }]),
          })
        )
      })

      it('should return events at location on validation error', async () => {
        req.body.location = 12
        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            locationName: 'Gym',
            locationEvents: [{ eventId: 1 }, { eventId: 2 }],
          })
        )
      })

      it('should not make a request for events at location on validation error', async () => {
        req.body.location = 0
        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            locationName: undefined,
            locationEvents: [],
          })
        )

        expect(prisonApi.getLocation.mock.calls.length).toBe(0)
        expect(existingEventsService.getExistingEventsForOffender.mock.calls.length).toBe(0)
      })

      it('should return prisoner name for John Smith', async () => {
        prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'John', lastName: 'Smith' })

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addAppointment.njk',
          expect.objectContaining({
            prisonerName: 'John Smith',
          })
        )
      })

      describe('and there are existing events for an offender and a location', () => {
        it('should still show the offender and location events along with the validation messages', async () => {
          jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
          const offenderEvents = [
            { eventDescription: '**Court visit scheduled**' },
            {
              locationId: 2,
              eventDescription: 'Office 1 - An appointment',
              startTime: '12:00',
              endTime: '13:00',
            },
          ]
          const locationEvents = [
            {
              locationId: 3,
              eventDescription: 'Doctors - An appointment',
              startTime: '12:00',
              endTime: '13:00',
            },
          ]
          const date = moment().format(DAY_MONTH_YEAR)
          const fiveMinutesPrior = moment().subtract(5, 'minutes')
          const startTimeHours = fiveMinutesPrior.hour()
          const startTimeMinutes = fiveMinutesPrior.minute()

          req.body = {
            date,
            startTimeHours,
            startTimeMinutes,
            appointmentType: 'VLB',
            location: '3',
          }

          existingEventsService.getExistingEventsForOffender.mockReturnValue(offenderEvents)
          existingEventsService.getExistingEventsForLocation.mockReturnValue(locationEvents)
          prisonApi.getLocation.mockReturnValue({ userDescription: 'Test location' })

          await controller.post(req, res)

          expect(existingEventsService.getExistingEventsForOffender).toHaveBeenCalledWith(
            {},
            'MDI',
            '29/03/2019',
            'ABC123'
          )
          expect(existingEventsService.getExistingEventsForLocation).toHaveBeenCalledWith({}, 'MDI', 3, '29/03/2019')

          expect(res.render).toHaveBeenCalledWith(
            'addAppointment/addAppointment.njk',
            expect.objectContaining({
              locationName: 'Test location',
              errors: expect.arrayContaining([
                { text: 'Select an appointment start time that is not in the past', href: '#start-time-hours' },
              ]),
              offenderEvents,
              locationEvents,
            })
          )
        })
      })
    })
  })
})
