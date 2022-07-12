import { raiseAnalyticsEvent } from '../raiseAnalyticsEvent'
import { bulkAppointmentsClashesFactory } from '../controllers/appointments/bulkAppointmentsClashes'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const prisonApi = {}

jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

let req
let res
let logError
let controller

beforeEach(() => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
  prisonApi.addAppointments = jest.fn([])
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisits' does not exist on type '{}'.
  prisonApi.getVisits = jest.fn().mockResolvedValue([
    {
      offenderNo: 'G4803UT',
      locationId: 456,
      firstName: 'Bobby',
      lastName: 'Abdulkadir',
      event: 'VISIT',
      eventDescription: 'Visit',
      eventLocation: 'Visiting room',
      comment: 'A comment.',
      startTime: '2019-09-23T15:00:00',
      endTime: '2019-09-23T16:00:00',
    },
  ])
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointments' does not exist on type ... Remove this comment to see the full error message
  prisonApi.getAppointments = jest.fn().mockResolvedValue([
    {
      offenderNo: 'G1683VN',
      locationId: 123,
      firstName: 'Elton',
      lastName: 'Abbatiello',
      event: 'APPT',
      eventDescription: 'An appointment',
      eventLocation: 'Office 1',
      comment: 'A comment.',
      startTime: '2019-09-23T15:00:00',
      endTime: '2019-09-23T16:00:00',
    },
  ])
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
  prisonApi.getExternalTransfers = jest.fn().mockResolvedValue([
    {
      offenderNo: 'G5402VR',
      locationId: 101,
      firstName: 'Gabriel',
      lastName: 'Agugliaro',
      event: 'TRANS',
      eventDescription: 'Transfer',
      eventLocation: 'Somewhere else',
      comment: 'A comment.',
      startTime: '2019-09-23T15:00:00',
      endTime: '2019-09-23T16:00:00',
    },
  ])
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
  prisonApi.getCourtEvents = jest.fn().mockResolvedValue([
    {
      offenderNo: 'G1683VN',
      locationId: 789,
      firstName: 'Elton',
      lastName: 'Abbatiello',
      event: 'COURT',
      eventDescription: 'Court event',
      eventLocation: 'Court',
      comment: 'A comment.',
      startTime: '2019-09-23T15:00:00',
      endTime: '2019-09-23T16:00:00',
    },
  ])

  req = {
    originalUrl: '/bulk-appointments/confirm-appointment/',
    session: {
      userDetails: {
        activeCaseLoadId: 'LEI',
      },
    },
    body: {},
    flash: jest.fn(),
  }
  res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
  logError = jest.fn()
  controller = bulkAppointmentsClashesFactory(prisonApi, logError)
})

const appointmentDetails = {
  appointmentType: 'TEST',
  appointmentTypeDescription: 'Test Type',
  location: 1,
  locationDescription: 'Chapel',
  date: '23/09/2019',
  startTime: '2019-09-23T15:30:00',
  endTime: '2019-09-30T16:30:00',
  comments: 'Activity comment',
  prisonersNotFound: [],
  prisonersListed: [
    {
      bookingId: '111',
      offenderNo: 'G1683VN',
      firstName: 'Elton',
      lastName: 'Abbatiello',
    },
    {
      bookingId: '222',
      offenderNo: 'G4803UT',
      firstName: 'Bobby',
      lastName: 'Abdulkadir',
    },
    {
      bookingId: '333',
      offenderNo: 'G4346UT',
      firstName: 'Dewey',
      lastName: 'Affolter',
    },
    {
      bookingId: '444',
      offenderNo: 'G5402VR',
      firstName: 'Gabriel',
      lastName: 'Agugliaro',
    },
  ],
}

describe('appointment clashes', () => {
  describe('and viewing page', () => {
    describe('and there is data', () => {
      beforeEach(() => {
        req.session.data = { ...appointmentDetails }
      })

      it('should call the appropiate endpoints with the correct search criteria', async () => {
        const searchCriteria = {
          agencyId: 'LEI',
          date: '2019-09-23',
          offenderNumbers: ['G1683VN', 'G4803UT', 'G4346UT', 'G5402VR'],
        }

        await controller.index(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisits' does not exist on type '{}'.
        expect(prisonApi.getVisits).toHaveBeenCalledWith({}, searchCriteria)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointments' does not exist on type ... Remove this comment to see the full error message
        expect(prisonApi.getAppointments).toHaveBeenCalledWith({}, searchCriteria)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
        expect(prisonApi.getExternalTransfers).toHaveBeenCalledWith({}, searchCriteria)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
        expect(prisonApi.getCourtEvents).toHaveBeenCalledWith({}, searchCriteria)
      })

      it('should render the appointments clashes page with the correct data', async () => {
        await controller.index(req, res)

        const expectedTemplateObject = {
          appointmentDetails,
          prisonersWithClashes: [
            {
              bookingId: '111',
              clashes: [
                {
                  comment: 'A comment.',
                  endTime: '2019-09-23T16:00:00',
                  event: 'APPT',
                  eventDescription: 'An appointment',
                  eventLocation: 'Office 1',
                  firstName: 'Elton',
                  lastName: 'Abbatiello',
                  locationId: 123,
                  offenderNo: 'G1683VN',
                  startTime: '2019-09-23T15:00:00',
                },
                {
                  comment: 'A comment.',
                  endTime: '2019-09-23T16:00:00',
                  event: 'COURT',
                  eventDescription: 'Court event',
                  eventLocation: 'Court',
                  firstName: 'Elton',
                  lastName: 'Abbatiello',
                  locationId: 789,
                  offenderNo: 'G1683VN',
                  startTime: '2019-09-23T15:00:00',
                },
              ],
              firstName: 'Elton',
              lastName: 'Abbatiello',
              offenderNo: 'G1683VN',
            },
            {
              bookingId: '222',
              clashes: [
                {
                  comment: 'A comment.',
                  endTime: '2019-09-23T16:00:00',
                  event: 'VISIT',
                  eventDescription: 'Visit',
                  eventLocation: 'Visiting room',
                  firstName: 'Bobby',
                  lastName: 'Abdulkadir',
                  locationId: 456,
                  offenderNo: 'G4803UT',
                  startTime: '2019-09-23T15:00:00',
                },
              ],
              firstName: 'Bobby',
              lastName: 'Abdulkadir',
              offenderNo: 'G4803UT',
            },
            {
              bookingId: '444',
              clashes: [
                {
                  comment: 'A comment.',
                  endTime: '2019-09-23T16:00:00',
                  event: 'TRANS',
                  eventDescription: 'Transfer',
                  eventLocation: 'Somewhere else',
                  firstName: 'Gabriel',
                  lastName: 'Agugliaro',
                  locationId: 101,
                  offenderNo: 'G5402VR',
                  startTime: '2019-09-23T15:00:00',
                },
              ],
              firstName: 'Gabriel',
              lastName: 'Agugliaro',
              offenderNo: 'G5402VR',
            },
          ],
        }
        expect(res.render).toBeCalledWith('bulkAppointmentsClashes.njk', expectedTemplateObject)
      })
    })

    describe('and there is no data', () => {
      it('should redirect to the add appointment page', async () => {
        await controller.index(req, res)

        expect(res.redirect).toBeCalledWith('/bulk-appointments/add-appointment-details')
      })
    })

    describe('and there is an issue with getting other events', () => {
      const error = new Error('There has been an error')

      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisits' does not exist on type '{}'.
        prisonApi.getVisits = jest.fn().mockRejectedValue(error)
      })

      it('should log an error and render the error page', async () => {
        req.session.data = { ...appointmentDetails }
        res.status = jest.fn()

        await expect(controller.index(req, res)).rejects.toThrowError(error)
        expect(res.locals.redirectUrl).toBe('/bulk-appointments/need-to-upload-file')
      })
    })
  })

  describe('and submitting the data', () => {
    describe('and the start times are the same', () => {
      describe('and some prisoners have been selected for removal', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          prisonApi.addAppointments = jest.fn().mockReturnValue('All good')
          req.session.data = { ...appointmentDetails }
        })

        it('should submit the correct data, clear the session data, and redirect to the appointments added page', async () => {
          req.body = { G1683VN: 'remove', G4803UT: 'remove' }

          await controller.post(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          expect(prisonApi.addAppointments).toBeCalledWith(res.locals, {
            appointmentDefaults: {
              appointmentType: 'TEST',
              locationId: 1,
              comment: 'Activity comment',
              endTime: '2019-09-30T16:30:00',
              startTime: '2019-09-23T15:30:00',
            },
            appointments: [{ bookingId: '333' }, { bookingId: '444' }],
          })

          expect(req.session.data).toEqual(null)

          expect(req.session.appointmentSlipsData).toEqual({
            appointmentDetails: {
              appointmentTypeDescription: appointmentDetails.appointmentTypeDescription,
              comments: appointmentDetails.comments,
              endTime: appointmentDetails.endTime,
              locationDescription: appointmentDetails.locationDescription,
              startTime: appointmentDetails.startTime,
            },
            prisonersListed: [
              {
                bookingId: '333',
                firstName: 'Dewey',
                lastName: 'Affolter',
                offenderNo: 'G4346UT',
              },
              {
                bookingId: '444',
                firstName: 'Gabriel',
                lastName: 'Agugliaro',
                offenderNo: 'G5402VR',
              },
            ],
          })
          expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')

          expect(raiseAnalyticsEvent).toBeCalledWith(
            'Bulk Appointments',
            `Appointments created at ${req.session.userDetails.activeCaseLoadId}`,
            `Appointment type - ${appointmentDetails.appointmentTypeDescription}`,
            2
          )
        })
      })

      describe('and all prisoners have been selected for removal', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          prisonApi.addAppointments = jest.fn().mockReturnValue('All good')
          req.session.data = { ...appointmentDetails }
        })

        it('should not submit any appointments and redirect to the no appointments added page', async () => {
          req.body = { G1683VN: 'remove', G4803UT: 'remove', G4346UT: 'remove', G5402VR: 'remove' }

          await controller.post(req, res)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          expect(prisonApi.addAppointments).not.toBeCalled()
          expect(res.redirect).toBeCalledWith('/bulk-appointments/no-appointments-added?reason=removedAllClashes')
        })
      })

      describe('and there are recurring appointments', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          prisonApi.addAppointments = jest.fn().mockReturnValue('All good')
          req.session.data = {
            ...appointmentDetails,
            recurring: 'yes',
            times: '5',
            repeats: 'WEEKLY',
          }
        })

        it('should submit the correct data and redirect to the appointments added page', async () => {
          await controller.post(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          expect(prisonApi.addAppointments).toBeCalledWith(res.locals, {
            appointmentDefaults: {
              appointmentType: 'TEST',
              comment: 'Activity comment',
              locationId: 1,
              startTime: '2019-09-23T15:30:00',
              endTime: '2019-09-30T16:30:00',
            },
            appointments: [{ bookingId: '111' }, { bookingId: '222' }, { bookingId: '333' }, { bookingId: '444' }],
            repeat: {
              count: 5,
              repeatPeriod: 'WEEKLY',
            },
          })

          expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')

          expect(raiseAnalyticsEvent).toBeCalledWith(
            'Bulk Appointments',
            `Appointments created at ${req.session.userDetails.activeCaseLoadId}`,
            `Appointment type - ${appointmentDetails.appointmentTypeDescription}`,
            20
          )
        })
      })
    })

    describe('and there are individual start and end times', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
        prisonApi.addAppointments = jest.fn().mockReturnValue('All good')
        req.session.data = {
          appointmentType: 'TEST',
          location: 1,
          date: '27/09/2019',
          sameTimeAppointments: 'no',
          comments: 'Activity comment',
          prisonersNotFound: [],
          prisonersListed: [
            {
              bookingId: '111',
              offenderNo: 'G1683VN',
              firstName: 'Elton',
              lastName: 'Abbatiello',
              startTimeHours: '18',
              startTimeMinutes: '45',
              endTimeHours: '19',
              endTimeMinutes: '10',
              startTime: '2019-10-08T18:45:00',
              endTime: '2019-10-08T19:10:00',
            },
            {
              bookingId: '222',
              offenderNo: 'G4803UT',
              firstName: 'Bobby',
              lastName: 'Abdulkadir',
              startTimeHours: '18',
              startTimeMinutes: '50',
              endTimeHours: '19',
              endTimeMinutes: '15',
              startTime: '2019-10-08T18:50:00',
              endTime: '2019-10-08T19:15:00',
            },
          ],
        }
      })

      it('submit the data and redirect to the appointments added page', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1569481200000) // Thursday 2019-09-26T07:00:00.000Z

        await controller.post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
        expect(prisonApi.addAppointments).toBeCalledWith(res.locals, {
          appointmentDefaults: {
            appointmentType: 'TEST',
            comment: 'Activity comment',
            locationId: 1,
            startTime: '2019-09-27T23:59:00',
            endTime: undefined,
          },
          appointments: [
            { bookingId: '111', startTime: '2019-10-08T18:45:00', endTime: '2019-10-08T19:10:00' },
            { bookingId: '222', startTime: '2019-10-08T18:50:00', endTime: '2019-10-08T19:15:00' },
          ],
        })

        expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockRestore' does not exist on type '() ... Remove this comment to see the full error message
        Date.now.mockRestore()
      })
    })
  })
})
