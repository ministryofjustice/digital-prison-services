import { makeNotFoundError } from './helpers'

import appointmentDetails from '../controllers/appointmentDetails'
import appointmentDetailsServiceFactory from '../services/appointmentDetailsService'

describe('appointment details', () => {
  const testAppointment = {
    appointment: {
      offenderNo: 'ABC123',
      id: 1,
      agencyId: 'MDI',
      locationId: 2,
      appointmentTypeCode: 'GYM',
      startTime: '2021-05-20T13:00:00',
      createUserId: 'TEST_USER',
    },
    recurring: null,
    videoLinkBooking: null,
  }

  const oauthApi = {}
  const prisonApi = {}
  const whereaboutsApi = {}
  const videoLinkBookingService = {}
  const locationsInsidePrisonApi = {}
  const nomisMapping = {}
  const getClientCredentialsTokens = {}

  let req
  let res
  let controller

  let appointmentDetailsService

  beforeEach(() => {
    req = {
      params: { id: 1 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn(),
    }
    res = { render: jest.fn() }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'INACTIVE_BOOKINGS' }])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'BARRY',
      lastName: 'SMITH',
      offenderNo: 'ABC123',
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocationsForAppointments' does not ex... Remove this comment to see the full error message
    prisonApi.getLocationsForAppointments = jest.fn().mockResolvedValue([
      { userDescription: 'VCC Room 1', locationId: '1' },
      { userDescription: 'Gymnasium', locationId: '2' },
      { userDescription: 'VCC Room 2', locationId: '3' },
    ])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentTypes' does not exist on t... Remove this comment to see the full error message
    prisonApi.getAppointmentTypes = jest.fn().mockResolvedValue([
      { code: 'GYM', description: 'Gym' },
      { description: 'Video link booking', code: 'VLB' },
    ])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
    prisonApi.getStaffDetails = jest
      .fn()
      .mockResolvedValue({ username: 'TEST_USER', firstName: 'TEST', lastName: 'USER' })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
    whereaboutsApi.getAppointment = jest.fn().mockResolvedValue(testAppointment)

    appointmentDetailsService = appointmentDetailsServiceFactory({
      prisonApi,
      videoLinkBookingService,
      locationsInsidePrisonApi,
      nomisMapping,
      getClientCredentialsTokens,
    })

    controller = appointmentDetails({ oauthApi, prisonApi, whereaboutsApi, appointmentDetailsService })
  })

  describe('viewAppointment', () => {
    it('should make the correct calls', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      expect(oauthApi.userRoles).toHaveBeenCalledWith(res.locals)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
      expect(whereaboutsApi.getAppointment).toHaveBeenCalledWith(res.locals, 1)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, 'ABC123')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocationsForAppointments' does not ex... Remove this comment to see the full error message
      expect(prisonApi.getLocationsForAppointments).toHaveBeenCalledWith(res.locals, 'MDI')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentTypes' does not exist on t... Remove this comment to see the full error message
      expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(res.locals)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
      expect(prisonApi.getStaffDetails).toHaveBeenCalledWith(res.locals, 'TEST_USER')
    })

    it('should fall back to the user id if there are errors fetching the user details', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getStaffDetails = jest.fn().mockRejectedValue(makeNotFoundError())

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'appointmentDetails',
        expect.objectContaining({
          additionalDetails: {
            comments: 'Not entered',
            addedBy: 'TEST_USER',
          },
        })
      )
    })

    it('should render with the correct appointment', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('appointmentDetails', {
        appointmentConfirmDeletionLink: false,
        additionalDetails: {
          comments: 'Not entered',
          addedBy: 'Test User',
        },
        basicDetails: {
          date: '20 May 2021',
          location: 'Gymnasium',
          type: 'Gym',
        },
        prepostData: {},
        prisoner: {
          name: 'Barry Smith',
          number: 'ABC123',
        },
        recurringDetails: {
          recurring: 'No',
        },
        timeDetails: {
          startTime: '13:00',
          endTime: 'Not entered',
        },
      })
    })

    describe('with activity hub role', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'ACTIVITY_HUB' }])
      })

      it('should supply delete button link', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({
            appointmentConfirmDeletionLink: '/appointment-details/1/confirm-deletion',
          })
        )
      })
    })

    describe('with delete-a-prisoners-appointment role', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'DELETE_A_PRISONERS_APPOINTMENT' }])
      })

      it('should supply delete button link', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({
            appointmentConfirmDeletionLink: '/appointment-details/1/confirm-deletion',
          })
        )
      })
    })

    describe('recurring appointment', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
        whereaboutsApi.getAppointment = jest.fn().mockResolvedValue({
          ...testAppointment,
          recurring: {
            id: 100,
            repeatPeriod: 'WEEKLY',
            count: 10,
            startTime: testAppointment.appointment.startTime,
          },
        })
      })

      it('should render with the recurring details', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({
            recurringDetails: {
              lastAppointment: '22 July 2021',
              recurring: 'Yes',
              repeats: 'Weekly',
            },
          })
        )
      })
    })

    describe('video link appointments', () => {
      let videoLinkBookingAppointment

      beforeEach(() => {
        videoLinkBookingAppointment = {
          appointment: {
            ...testAppointment.appointment,
            locationId: 1,
            appointmentTypeCode: 'VLB',
            startTime: '2021-05-20T13:00:00',
            endTime: '2021-05-20T14:00:00',
            comment: 'Test appointment comments',
          },
          videoLinkBooking: {
            main: {
              court: 'Nottingham Justice Centre',
              hearingType: 'MAIN',
              locationId: 1,
              startTime: '2021-05-20T13:00:00',
              endTime: '2021-05-20T14:00:00',
            },
          },
        }

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
        whereaboutsApi.getAppointment = jest.fn().mockResolvedValue(videoLinkBookingAppointment)
      })

      it('should render with court location and correct vlb locations and types', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({
            additionalDetails: {
              courtLocation: 'Nottingham Justice Centre',
              comments: 'Test appointment comments',
              addedBy: 'Test User',
            },
            basicDetails: {
              date: '20 May 2021',
              location: 'VCC Room 1',
              type: 'Video link booking',
            },
            timeDetails: {
              startTime: '13:00',
              endTime: '14:00',
            },
          })
        )
      })

      describe('with pre appointment', () => {
        beforeEach(() => {
          videoLinkBookingAppointment.videoLinkBooking.pre = {
            court: 'Nottingham Justice Centre',
            hearingType: 'PRE',
            locationId: 3,
            startTime: '2021-05-20T12:45:00',
            endTime: '2021-05-20T13:00:00',
          }
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
          whereaboutsApi.getAppointment = jest.fn().mockResolvedValue(videoLinkBookingAppointment)
        })

        it('should render with the correct pre appointment details', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'appointmentDetails',
            expect.objectContaining({
              prepostData: {
                'pre-court hearing briefing': 'VCC Room 2 - 12:45 to 13:00',
              },
            })
          )
        })
      })

      describe('with post appointment', () => {
        beforeEach(() => {
          videoLinkBookingAppointment.videoLinkBooking.post = {
            court: 'Nottingham Justice Centre',
            hearingType: 'POST',
            locationId: 3,
            startTime: '2021-05-20T14:00:00',
            endTime: '2021-05-20T14:15:00',
          }
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
          whereaboutsApi.getAppointment = jest.fn().mockResolvedValue(videoLinkBookingAppointment)
        })

        it('should render with the correct post appointment details', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'appointmentDetails',
            expect.objectContaining({
              prepostData: {
                'post-court hearing briefing': 'VCC Room 2 - 14:00 to 14:15',
              },
            })
          )
        })
      })
    })
  })
})
