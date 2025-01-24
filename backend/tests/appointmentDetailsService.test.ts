import { makeNotFoundError } from './helpers'

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

  const prisonApi = {}
  const videoLinkBookingService = { getVideoLinkBookingFromAppointmentId: jest.fn(), bookingIsAmendable: jest.fn() }
  const locationsInsidePrisonApi = { getLocationByKey: jest.fn() }
  const nomisMapping = { getNomisLocationMappingByDpsLocationId: jest.fn() }
  const getClientCredentialsTokens = jest.fn()

  let res
  let service

  beforeEach(() => {
    res = { locals: { user: { username: 'USER' } }, render: jest.fn() }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'BARRY',
      lastName: 'SMITH',
      offenderNo: 'ABC123',
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLocationsForAppointments' does not ex... Remove this comment to see the full error message
    prisonApi.getLocationsForAppointments = jest.fn().mockResolvedValue([
      { locationPrefix: 'ROOM1', userDescription: 'VCC Room 1', locationId: '1' },
      { locationPrefix: 'ROOM2', userDescription: 'Gymnasium', locationId: '2' },
      { locationPrefix: 'ROOM3', userDescription: 'VCC Room 2', locationId: '3' },
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

    locationsInsidePrisonApi.getLocationByKey.mockResolvedValue({ id: 'abc-123' })
    locationsInsidePrisonApi.getLocationByKey.mockImplementation((_, id) =>
      Promise.resolve(
        {
          ROOM2: { id: 'abc-123' },
          ROOM3: { id: 'zyx-321' },
        }[id]
      )
    )
    nomisMapping.getNomisLocationMappingByDpsLocationId.mockImplementation((_, id) =>
      Promise.resolve(
        {
          'abc-123': { nomisLocationId: 2 },
          'zyx-321': { nomisLocationId: 3 },
        }[id]
      )
    )

    service = appointmentDetailsServiceFactory({
      prisonApi,
      videoLinkBookingService,
      locationsInsidePrisonApi,
      nomisMapping,
      getClientCredentialsTokens,
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('an appointment view model request', () => {
    it('should call the correct prison api methods', async () => {
      await service.getAppointmentViewModel(res, testAppointment, 'MDI')

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

      const appointmentDetails = await service.getAppointmentViewModel(res, testAppointment, 'MDI')

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
      const appointmentDetails = await service.getAppointmentViewModel(res, testAppointment, 'MDI')

      expect(appointmentDetails).toEqual({
        isRecurring: false,
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
        recurringDetails: {
          recurring: 'No',
        },
        timeDetails: {
          startTime: '13:00',
          endTime: 'Not entered',
        },
        canAmendVlb: true,
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
      const appointmentDetails = await service.getAppointmentViewModel(res, recurringAppointment, 'MDI')

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

    const buildVideoLinkBooking = (bookingType, createdByPrison) => ({
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

      const appointmentDetails = await service.getAppointmentViewModel(res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          hearingType: 'Application',
          courtLocation: 'Aberystwyth Family',
          courtHearingLink: 'Not yet known',
          comments: 'Test appointment comments',
          addedBy: 'Court',
        },
        basicDetails: {
          date: '20 May 2021',
          location: 'VCC Room 2',
          type: 'Video link booking',
        },
        timeDetails: {
          startTime: '10:00',
          endTime: '11:00',
        },
        prepostData: {
          'pre-court hearing briefing': 'Gymnasium - 09:45 to 10:00',
          'post-court hearing briefing': 'Gymnasium - 11:00 to 11:15',
        },
      })
    })

    it('should render with probation team and correct vlb locations and types', async () => {
      videoLinkBookingService.getVideoLinkBookingFromAppointmentId.mockResolvedValue(
        buildVideoLinkBooking('PROBATION', false)
      )

      const appointmentDetails = await service.getAppointmentViewModel(res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          meetingType: 'Post sentence recall',
          probationTeam: 'Blackpool',
          comments: 'Test appointment comments',
          addedBy: 'Probation team',
        },
        basicDetails: {
          date: '20 May 2021',
          location: 'VCC Room 2',
          type: 'Video link booking',
        },
        timeDetails: {
          startTime: '10:00',
          endTime: '11:00',
        },
      })
    })

    it('should render addedBy with the correct username', async () => {
      videoLinkBookingService.getVideoLinkBookingFromAppointmentId.mockResolvedValue(
        buildVideoLinkBooking('COURT', true)
      )

      const appointmentDetails = await service.getAppointmentViewModel(res, videoLinkBookingAppointment, 'MDI')

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
          appointmentTypeCode: 'VLB',
          startTime: '2021-05-20T13:00:00',
          endTime: '2021-05-20T14:00:00',
          comment: 'Test appointment comments',
        },
      }
    })

    it('should render with court location and correct vlb locations and types', async () => {
      const appointmentDetails = await service.getAppointmentViewModel(res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          meetingType: 'Recall hearing',
          probationTeam: 'Aberystwyth Family',
          comments: 'Test appointment comments',
          addedBy: 'Test User',
        },
        basicDetails: {
          date: '20 May 2021',
          location: 'VCC Room 2',
          type: 'Video link booking',
        },
        timeDetails: {
          startTime: '10:00',
          endTime: '11:00',
        },
      })
    })
  })
})
