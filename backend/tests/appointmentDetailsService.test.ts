import { makeNotFoundError } from './helpers'

import appointmentDetailsServiceFactory from '../services/appointmentDetailsService'
import config from '../config'
import { prisonApiFactory } from '../api/prisonApi'
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

  const prisonApi: Partial<ReturnType<typeof prisonApiFactory>> = {}

  const videoLinkBookingService: Partial<ReturnType<typeof VideoLinkBookingService>> & {
    getVideoLinkBookingFromAppointmentId: jest.Mock
    bookingIsAmendable: jest.Mock
  } = {
    getVideoLinkBookingFromAppointmentId: jest.fn(),
    bookingIsAmendable: jest.fn(),
  }

  const locationsInsidePrisonApi: Partial<ReturnType<typeof locationsInsidePrisonApiFactory>> & {
    getLocationByKey: jest.Mock
  } = {
    getLocationByKey: jest.fn(),
  }

  const nomisMapping: Partial<ReturnType<typeof nomisMappingClientFactory>> & {
    getNomisLocationMappingByDpsLocationId: jest.Mock
  } = {
    getNomisLocationMappingByDpsLocationId: jest.fn(),
  }

  const getClientCredentialsTokens = jest.fn()
  const context = {}

  let res
  let service

  beforeEach(() => {
    config.app.bvlsHmctsLinkGuestPin = false

    res = { locals: { user: { username: 'USER' } }, render: jest.fn() }

    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'BARRY',
      lastName: 'SMITH',
      offenderNo: 'ABC123',
    })

    prisonApi.getAppointmentTypes = jest.fn().mockResolvedValue([
      { code: 'GYM', description: 'Gym' },
      { description: 'Video Link - Court Hearing', code: 'VLB' },
      { description: 'Video Link - Probation Meeting', code: 'VLPM' },
    ])

    prisonApi.getStaffDetails = jest
      .fn()
      .mockResolvedValue({ username: 'TEST_USER', firstName: 'TEST', lastName: 'USER' })

    locationsInsidePrisonApi.getLocationByKey.mockResolvedValue({ id: 'abc-123' })

    locationsInsidePrisonApi.getLocationByKey.mockImplementation((_, id) =>
      Promise.resolve(
        {
          ROOM2: { id: 'cba-222' },
          ROOM3: { id: 'zyx-321' },
        }[id]
      )
    )

    locationsInsidePrisonApi.getLocationsByNonResidentialUsageType = jest.fn().mockResolvedValue([
      { key: 'ROOM1', localName: 'VCC Room 1', id: 'abc-123' },
      { key: 'ROOM2', localName: 'Gymnasium', id: 'cba-222' },
      { key: 'ROOM3', localName: 'VCC Room 2', id: 'zyx-321' },
    ])

    nomisMapping.getNomisLocationMappingByDpsLocationId.mockImplementation((_, id) =>
      Promise.resolve(
        {
          'abc-123': { nomisLocationId: 1, dpsLocationId: 'abc-123' },
          'cba-222': { nomisLocationId: 2, dpsLocationId: 'cba-222' },
          'zyx-321': { nomisLocationId: 3, dpsLocationId: 'zyx-321' },
        }[id]
      )
    )

    getClientCredentialsTokens.mockResolvedValue(context)

    service = appointmentDetailsServiceFactory({
      prisonApi: prisonApi as ReturnType<typeof prisonApiFactory>,
      videoLinkBookingService: videoLinkBookingService as ReturnType<typeof VideoLinkBookingService>,
      locationsInsidePrisonApi: locationsInsidePrisonApi as ReturnType<typeof locationsInsidePrisonApiFactory>,
      nomisMapping: nomisMapping as ReturnType<typeof nomisMappingClientFactory>,
      getClientCredentialsTokens,
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('an appointment view model request', () => {
    it('should call the correct prison api methods', async () => {
      await service.getAppointmentViewModel(context, res, testAppointment, 'MDI')

      expect(prisonApi.getAppointmentTypes).toHaveBeenCalledWith(res.locals)
      expect(prisonApi.getStaffDetails).toHaveBeenCalledWith(res.locals, 'TEST_USER')
      expect(locationsInsidePrisonApi.getLocationsByNonResidentialUsageType).toHaveBeenCalledWith(
        context,
        'MDI',
        NonResidentialUsageType.APPOINTMENT
      )
    })

    it('should fall back to the user id if there are errors fetching the user details', async () => {
      prisonApi.getStaffDetails = jest.fn().mockRejectedValue(makeNotFoundError())

      const appointmentDetails = await service.getAppointmentViewModel(context, res, testAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          comments: 'Not entered',
          addedBy: 'TEST_USER',
        },
      })
    })
  })

  describe('single appointment view model request', () => {
    it('should return the correct data', async () => {
      const appointmentDetails = await service.getAppointmentViewModel(context, res, testAppointment, 'MDI')

      expect(appointmentDetails).toEqual({
        isRecurring: false,
        additionalDetails: {
          comments: 'Not entered',
          addedBy: 'Test User',
        },
        basicDetails: {
          location: 'Gymnasium',
          type: 'Gym',
        },
        prepostData: {},
        recurringDetails: {
          recurring: 'No',
        },
        timeDetails: {
          date: '20 May 2021',
          startTime: '13:00',
          endTime: 'Not entered',
        },
        canAmendAppointment: false,
        canDeleteAppointment: true,
      })
    })
  })

  describe('recurring appointment view model request', () => {
    let recurringAppointment

    beforeEach(() => {
      recurringAppointment = {
        ...testAppointment,
        isRecurring: true,
        recurring: {
          id: 100,
          repeatPeriod: 'WEEKLY',
          count: 10,
          startTime: testAppointment.appointment.startTime,
        },
      }
    })

    it('should return the correct data', async () => {
      const appointmentDetails = await service.getAppointmentViewModel(context, res, recurringAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        recurringDetails: {
          lastAppointment: '22 July 2021',
          recurring: 'Yes',
          repeats: 'Weekly',
        },
      })
    })
  })

  describe('video link appointment view model request', () => {
    let videoLinkBookingAppointment

    const buildVideoLinkBooking = (
      bookingType: string,
      createdByPrison: boolean,
      hmctsNumber: string = undefined,
      videoLinkUrl: string = undefined,
      guestPin: string = undefined
    ) => ({
      bookingType,
      prisonAppointments:
        bookingType === 'COURT'
          ? [
              {
                appointmentType: 'VLB_COURT_PRE',
                prisonLocKey: 'ROOM2',
                appointmentDate: '2024-09-06',
                startTime: '09:45',
                endTime: '10:00',
              },
              {
                appointmentType: 'VLB_COURT_MAIN',
                prisonLocKey: 'ROOM3',
                appointmentDate: '2024-09-06',
                startTime: '10:00',
                endTime: '11:00',
              },
              {
                appointmentType: 'VLB_COURT_POST',
                prisonLocKey: 'ROOM2',
                appointmentDate: '2024-09-06',
                startTime: '11:00',
                endTime: '11:15',
              },
            ]
          : [
              {
                appointmentType: 'VLB_PROBATION',
                prisonLocKey: 'ROOM3',
                appointmentDate: '2024-09-06',
                startTime: '10:00',
                endTime: '11:00',
              },
            ],
      courtCode: bookingType === 'COURT' ? 'ABERFC' : undefined,
      courtDescription: bookingType === 'COURT' ? 'Aberystwyth Family' : undefined,
      courtHearingType: bookingType === 'COURT' ? 'APPLICATION' : undefined,
      courtHearingTypeDescription: bookingType === 'COURT' ? 'Application' : undefined,
      probationTeamCode: bookingType === 'PROBATION' ? 'BLAPP' : undefined,
      probationTeamDescription: bookingType === 'PROBATION' ? 'Blackpool' : undefined,
      probationMeetingType: bookingType === 'PROBATION' ? 'PSR' : undefined,
      probationMeetingTypeDescription: bookingType === 'PROBATION' ? 'Post sentence recall' : undefined,
      createdByPrison,
      createdBy: 'TEST_USER',
      hmctsNumber,
      videoLinkUrl,
      guestPin,
    })

    beforeEach(() => {
      videoLinkBookingAppointment = {
        appointment: {
          ...testAppointment.appointment,
          appointmentTypeCode: 'VLB',
          startTime: '2021-05-20T13:00:00',
          endTime: '2021-05-20T14:00:00',
          comment: 'Test appointment comments',
        },
      }
    })

    it('should render with court location and correct vlb locations and types', async () => {
      videoLinkBookingService.getVideoLinkBookingFromAppointmentId.mockResolvedValue(
        buildVideoLinkBooking('COURT', false)
      )

      const appointmentDetails = await service.getAppointmentViewModel(context, res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          courtHearingLink: 'None entered',
          addedBy: 'Court',
        },
        basicDetails: {
          location: 'VCC Room 2',
          type: 'Video Link - Court Hearing',
          courtLocation: 'Aberystwyth Family',
          hearingType: 'Application',
        },
        timeDetails: {
          date: '20 May 2021',
          startTime: '10:00',
          endTime: '11:00',
        },
        prepostData: {
          'pre-court hearing briefing': 'Gymnasium - 09:45 to 10:00',
          'post-court hearing briefing': 'Gymnasium - 11:00 to 11:15',
        },
      })
    })

    it('should render with court details with public private notes instead of comments', async () => {
      videoLinkBookingService.getVideoLinkBookingFromAppointmentId.mockResolvedValue(
        buildVideoLinkBooking('COURT', false)
      )

      const appointmentDetails = await service.getAppointmentViewModel(context, res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          courtHearingLink: 'None entered',
          notesForPrisonStaff: 'None entered',
          notesForPrisoner: 'None entered',
          addedBy: 'Court',
        },
        basicDetails: {
          location: 'VCC Room 2',
          type: 'Video Link - Court Hearing',
          courtLocation: 'Aberystwyth Family',
          hearingType: 'Application',
        },
        timeDetails: {
          date: '20 May 2021',
          startTime: '10:00',
          endTime: '11:00',
        },
        prepostData: {
          'pre-court hearing briefing': 'Gymnasium - 09:45 to 10:00',
          'post-court hearing briefing': 'Gymnasium - 11:00 to 11:15',
        },
      })
    })

    it('should render court details with a HMCTS number link', async () => {
      config.app.bvlsHmctsLinkGuestPin = true

      videoLinkBookingService.getVideoLinkBookingFromAppointmentId.mockResolvedValue(
        buildVideoLinkBooking('COURT', false, '12345')
      )

      const appointmentDetails = await service.getAppointmentViewModel(context, res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          courtHearingLink: 'HMCTS12345@meet.video.justice.gov.uk',
          notesForPrisonStaff: 'None entered',
          notesForPrisoner: 'None entered',
          addedBy: 'Court',
          guestPin: 'Not required',
        },
        basicDetails: {
          location: 'VCC Room 2',
          type: 'Video Link - Court Hearing',
          courtLocation: 'Aberystwyth Family',
          hearingType: 'Application',
        },
        timeDetails: {
          date: '20 May 2021',
          startTime: '10:00',
          endTime: '11:00',
        },
        prepostData: {
          'pre-court hearing briefing': 'Gymnasium - 09:45 to 10:00',
          'post-court hearing briefing': 'Gymnasium - 11:00 to 11:15',
        },
      })
    })

    it('should render court details with a video URL link', async () => {
      config.app.bvlsHmctsLinkGuestPin = true

      videoLinkBookingService.getVideoLinkBookingFromAppointmentId.mockResolvedValue(
        buildVideoLinkBooking('COURT', false, undefined, 'https://testlink')
      )

      const appointmentDetails = await service.getAppointmentViewModel(context, res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          courtHearingLink: 'https://testlink',
          notesForPrisonStaff: 'None entered',
          notesForPrisoner: 'None entered',
          addedBy: 'Court',
          guestPin: 'Not required',
        },
        basicDetails: {
          location: 'VCC Room 2',
          type: 'Video Link - Court Hearing',
          courtLocation: 'Aberystwyth Family',
          hearingType: 'Application',
        },
        timeDetails: {
          date: '20 May 2021',
          startTime: '10:00',
          endTime: '11:00',
        },
        prepostData: {
          'pre-court hearing briefing': 'Gymnasium - 09:45 to 10:00',
          'post-court hearing briefing': 'Gymnasium - 11:00 to 11:15',
        },
      })
    })

    it('should render court details with a guest pin and HMCTS number', async () => {
      config.app.bvlsHmctsLinkGuestPin = true

      videoLinkBookingService.getVideoLinkBookingFromAppointmentId.mockResolvedValue(
        buildVideoLinkBooking('COURT', false, '1234', undefined, '5678')
      )

      const appointmentDetails = await service.getAppointmentViewModel(context, res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          courtHearingLink: 'HMCTS1234@meet.video.justice.gov.uk',
          notesForPrisonStaff: 'None entered',
          notesForPrisoner: 'None entered',
          addedBy: 'Court',
          guestPin: '5678',
        },
        basicDetails: {
          location: 'VCC Room 2',
          type: 'Video Link - Court Hearing',
          courtLocation: 'Aberystwyth Family',
          hearingType: 'Application',
        },
        timeDetails: {
          date: '20 May 2021',
          startTime: '10:00',
          endTime: '11:00',
        },
        prepostData: {
          'pre-court hearing briefing': 'Gymnasium - 09:45 to 10:00',
          'post-court hearing briefing': 'Gymnasium - 11:00 to 11:15',
        },
      })
    })

    it('should render addedBy with the correct username', async () => {
      videoLinkBookingService.getVideoLinkBookingFromAppointmentId.mockResolvedValue(
        buildVideoLinkBooking('COURT', true)
      )

      const appointmentDetails = await service.getAppointmentViewModel(context, res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          addedBy: 'Test User',
        },
      })
    })
  })

  describe('video link appointment view model request - probation meeting', () => {
    let videoLinkBookingAppointment

    beforeEach(() => {
      config.app.bvlsMasteredAppointmentTypes = ['VLB', 'VLPM']

      videoLinkBookingService.getVideoLinkBookingFromAppointmentId.mockResolvedValue({
        bookingType: 'PROBATION',
        prisonAppointments: [
          {
            appointmentType: 'VLB_PROBATION',
            prisonLocKey: 'ROOM3',
            appointmentDate: '2024-09-06',
            startTime: '10:00',
            endTime: '11:00',
          },
        ],
        probationTeamCode: 'ABERFC',
        probationTeamDescription: 'Aberystwyth Family',
        probationMeetingType: 'PSR',
        probationMeetingTypeDescription: 'Recall hearing',
        createdByPrison: true,
        createdBy: 'TEST_USER',
      })

      videoLinkBookingAppointment = {
        appointment: {
          ...testAppointment.appointment,
          appointmentTypeCode: 'VLPM',
          startTime: '2021-05-20T13:00:00',
          endTime: '2021-05-20T14:00:00',
          comment: 'Test appointment comments',
        },
      }
    })

    it('should render with court location and correct vlb locations and types', async () => {
      const appointmentDetails = await service.getAppointmentViewModel(context, res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          addedBy: 'Test User',
        },
        basicDetails: {
          location: 'VCC Room 2',
          type: 'Video Link - Probation Meeting',
          meetingType: 'Recall hearing',
          probationTeam: 'Aberystwyth Family',
        },
        timeDetails: {
          date: '20 May 2021',
          startTime: '10:00',
          endTime: '11:00',
        },
      })
    })
  })
})
