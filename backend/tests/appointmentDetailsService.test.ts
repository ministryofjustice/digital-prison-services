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
  const videoLinkBookingService = {}
  const getClientCredentialsTokens = {}

  let res
  let service

  beforeEach(() => {
    res = { render: jest.fn() }

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

    service = appointmentDetailsServiceFactory({ prisonApi, videoLinkBookingService, getClientCredentialsTokens })
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

    beforeEach(() => {
      videoLinkBookingAppointment = {
        appointment: {
          ...testAppointment.appointment,
          locationId: 1,
          appointmentTypeCode: 'VLB',
          startTime: '2021-05-20T13:00:00',
          endTime: '2021-05-20T14:00:00',
          comment: 'Test appointment comments',
          addedBy: 'Test User',
        },
        videoLinkBooking: {
          main: {
            court: 'Nottingham Justice Centre',
            hearingType: 'MAIN',
            locationId: 1,
            startTime: '2021-05-20T13:00:00',
            endTime: '2021-05-20T14:00:00',
            createdByUsername: 'AUSER',
            madeByTheCourt: false,
          },
        },
      }
    })

    it('should render with court location and correct vlb locations and types', async () => {
      const appointmentDetails = await service.getAppointmentViewModel(res, videoLinkBookingAppointment, 'MDI')

      expect(appointmentDetails).toMatchObject({
        additionalDetails: {
          courtLocation: 'Nottingham Justice Centre',
          comments: 'Test appointment comments',
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
    })

    describe('with pre appointment', () => {
      beforeEach(() => {
        videoLinkBookingAppointment.videoLinkBooking.pre = {
          court: 'Nottingham Justice Centre',
          hearingType: 'PRE',
          locationId: 3,
          startTime: '2021-05-20T12:45:00',
          endTime: '2021-05-20T13:00:00',
          createdByUsername: 'AUSER',
          madeByTheCourt: false,
        }
      })

      it('should render with the correct pre appointment details', async () => {
        const appointmentDetails = await service.getAppointmentViewModel(res, videoLinkBookingAppointment, 'MDI')

        expect(appointmentDetails).toMatchObject({
          prepostData: {
            'pre-court hearing briefing': 'VCC Room 2 - 12:45 to 13:00',
          },
        })
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
          createdByUsername: 'AUSER',
          madeByTheCourt: false,
        }
      })

      it('should render with the correct post appointment details', async () => {
        const appointmentDetails = await service.getAppointmentViewModel(res, videoLinkBookingAppointment, 'MDI')

        expect(appointmentDetails).toMatchObject({
          prepostData: {
            'post-court hearing briefing': 'VCC Room 2 - 14:00 to 14:15',
          },
        })
      })
    })

    describe('with VLB appointment made by a court user', () => {
      beforeEach(() => {
        videoLinkBookingAppointment.videoLinkBooking.main = {
          court: 'Nottingham Justice Centre',
          hearingType: 'POST',
          locationId: 3,
          startTime: '2021-05-20T14:00:00',
          endTime: '2021-05-20T14:15:00',
          createdByUsername: 'VLB_COURT',
          madeByTheCourt: true,
        }
      })

      it('should render with the added by of Court', async () => {
        const appointmentDetails = await service.getAppointmentViewModel(res, videoLinkBookingAppointment, 'MDI')

        expect(appointmentDetails).toMatchObject({
          additionalDetails: {
            comments: 'Test appointment comments',
            addedBy: 'Court',
          },
        })
      })
    })
  })
})
