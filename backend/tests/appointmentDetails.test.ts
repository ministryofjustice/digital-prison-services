import { makeNotFoundError } from './helpers'
import { prisonApiFactory } from '../api/prisonApi'

import appointmentDetails from '../controllers/appointmentDetails'
import appointmentDetailsServiceFactory from '../services/appointmentDetailsService'
import { oauthApiFactory } from '../api/oauthApi'
import { whereaboutsApiFactory } from '../api/whereaboutsApi'
import VideoLinkBookingService from '../services/videoLinkBookingService'
import { locationsInsidePrisonApiFactory, NonResidentialUsageType } from '../api/locationsInsidePrisonApi'
import { nomisMappingClientFactory } from '../api/nomisMappingClient'

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

  const oauthApi: Partial<ReturnType<typeof oauthApiFactory>> = {}
  const prisonApi: Partial<ReturnType<typeof prisonApiFactory>> = {}
  const whereaboutsApi: Partial<ReturnType<typeof whereaboutsApiFactory>> = {}
  const videoLinkBookingService: Partial<ReturnType<typeof VideoLinkBookingService>> = {}
  const locationsInsidePrisonApi: Partial<ReturnType<typeof locationsInsidePrisonApiFactory>> = {}
  const nomisMapping: Partial<ReturnType<typeof nomisMappingClientFactory>> = {}
  const getClientCredentialsTokens = jest.fn()
  const systemOauthClient = { getClientCredentialsTokens }
  const context = {}

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
    res = { render: jest.fn(), locals: { user: { username: 'jbloggs' } } }

    oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'INACTIVE_BOOKINGS' }, { roleCode: 'ACTIVITY_HUB' }])

    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'BARRY',
      lastName: 'SMITH',
      offenderNo: 'ABC123',
    })
    prisonApi.getAppointmentTypes = jest.fn().mockResolvedValue([
      { code: 'GYM', description: 'Gym' },
      { description: 'Video link booking', code: 'VLB' },
    ])
    prisonApi.getStaffDetails = jest
      .fn()
      .mockResolvedValue({ username: 'TEST_USER', firstName: 'TEST', lastName: 'USER' })

    whereaboutsApi.getAppointment = jest.fn().mockResolvedValue(testAppointment)

    locationsInsidePrisonApi.getLocationByKey = jest.fn(
      async (_, key) => ({ LOCATION_1: { id: 'abc-1' }, LOCATION_3: { id: 'abc-3' } }[key])
    )
    locationsInsidePrisonApi.getLocationsByNonResidentialUsageType = jest.fn().mockResolvedValue([
      { localName: 'VCC Room 1', id: 'abc-1' },
      { localName: 'Gymnasium', id: 'abc-2' },
      { localName: 'VCC Room 2', id: 'abc-3' },
    ])

    nomisMapping.getNomisLocationMappingByDpsLocationId = jest.fn(
      async (_, id) =>
        ({
          'abc-1': { nomisLocationId: 1, dpsLocationId: 'abc-1' },
          'abc-2': { nomisLocationId: 2, dpsLocationId: 'abc-2' },
          'abc-3': { nomisLocationId: 3, dpsLocationId: 'abc-3' },
        }[id])
    )

    videoLinkBookingService.bookingIsAmendable = jest.fn(() => true)
    getClientCredentialsTokens.mockReturnValue(context)

    appointmentDetailsService = appointmentDetailsServiceFactory({
      prisonApi: prisonApi as ReturnType<typeof prisonApiFactory>,
      videoLinkBookingService: videoLinkBookingService as ReturnType<typeof VideoLinkBookingService>,
      locationsInsidePrisonApi: locationsInsidePrisonApi as ReturnType<typeof locationsInsidePrisonApiFactory>,
      nomisMapping: nomisMapping as ReturnType<typeof nomisMappingClientFactory>,
      getClientCredentialsTokens,
    })

    controller = appointmentDetails({
      oauthApi,
      prisonApi,
      whereaboutsApi,
      appointmentDetailsService,
      systemOauthClient,
    })
  })

  describe('viewAppointment', () => {
    it('should make the correct calls', async () => {
      await controller(req, res)

      expect(oauthApi.userRoles).toHaveBeenCalledWith(res.locals)
      expect(whereaboutsApi.getAppointment).toHaveBeenCalledWith(res.locals, 1)
      expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, 'ABC123')
      expect(locationsInsidePrisonApi.getLocationsByNonResidentialUsageType).toHaveBeenCalledWith(
        context,
        'MDI',
        NonResidentialUsageType.APPOINTMENT
      )
      expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(res.locals)
      expect(prisonApi.getStaffDetails).toHaveBeenCalledWith(res.locals, 'TEST_USER')
    })

    it('should fall back to the user id if there are errors fetching the user details', async () => {
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
        appointmentConfirmDeletionLink: '/appointment-details/1/confirm-deletion',
        appointmentAmendLink: false, // Not allowed to edit non-vlb appointments
        additionalDetails: {
          comments: 'Not entered',
          addedBy: 'Test User',
        },
        basicDetails: {
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
          date: '20 May 2021',
          startTime: '13:00',
          endTime: 'Not entered',
        },
      })
    })

    describe('with activity hub role', () => {
      beforeEach(() => {
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
      let videoLinkBooking

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
        }

        videoLinkBooking = {
          bookingType: 'COURT',
          courtDescription: 'Nottingham Justice Centre',
          courtHearingTypeDescription: 'Appeal',
          prisonAppointments: [
            { appointmentType: 'VLB_COURT_MAIN', prisonLocKey: 'LOCATION_1', startTime: '13:00', endTime: '14:00' },
          ],
          comments: 'VLB comments',
        }

        whereaboutsApi.getAppointment = jest.fn().mockResolvedValue(videoLinkBookingAppointment)

        videoLinkBookingService.getVideoLinkBookingFromAppointmentId = jest.fn().mockResolvedValue(videoLinkBooking)
      })

      it('should render with court location and correct vlb locations and types', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({
            appointmentAmendLink: 'http://localhost:3000/prisoner/ABC123/edit-appointment/1', // Allowed to edit VLB appointments
            additionalDetails: {
              courtHearingLink: 'None entered',
              comments: 'VLB comments',
              addedBy: 'Court',
            },
            basicDetails: {
              location: 'VCC Room 1',
              type: 'Video link booking',
              courtLocation: 'Nottingham Justice Centre',
              hearingType: 'Appeal',
            },
            timeDetails: {
              date: '20 May 2021',
              startTime: '13:00',
              endTime: '14:00',
            },
          })
        )
      })

      describe('with pre appointment', () => {
        beforeEach(() => {
          videoLinkBooking.prisonAppointments.push({
            appointmentType: 'VLB_COURT_PRE',
            prisonLocKey: 'LOCATION_3',
            startTime: '12:45',
            endTime: '13:00',
          })

          videoLinkBookingService.getVideoLinkBookingFromAppointmentId = jest.fn().mockResolvedValue(videoLinkBooking)
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
          videoLinkBooking.prisonAppointments.push({
            appointmentType: 'VLB_COURT_POST',
            prisonLocKey: 'LOCATION_3',
            startTime: '14:00',
            endTime: '14:15',
          })

          videoLinkBookingService.getVideoLinkBookingFromAppointmentId = jest.fn().mockResolvedValue(videoLinkBooking)
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
