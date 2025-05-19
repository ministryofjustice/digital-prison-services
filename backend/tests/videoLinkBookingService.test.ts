import moment from 'moment'
import videoLinkBookingService from '../services/videoLinkBookingService'

jest.mock('../utils', () => ({
  getWith404AsNull: jest.fn().mockImplementation((a) => a),
}))
jest.mock('../config', () => ({
  app: {
    bvlsMasteredAppointmentTypes: ['VLB'],
  },
  apis: {
    bookAVideoLinkApi: { enabled: true },
  },
}))

const whereaboutsApi = {
  getAppointment: jest.fn(),
}
const bookAVideoLinkApi = {
  matchAppointmentToVideoLinkBooking: jest.fn(),
  deleteVideoLinkBooking: jest.fn(),
}
const locationsInsidePrisonApi = {
  getLocationById: jest.fn(),
}
const nomisMapping = {
  getNomisLocationMappingByNomisLocationId: jest.fn(),
}

const context = {}

describe('Video Link Booking Service', () => {
  const { getVideoLinkBookingFromAppointmentId, deleteVideoLinkBooking, bookingIsAmendable } = videoLinkBookingService({
    whereaboutsApi,
    bookAVideoLinkApi,
    locationsInsidePrisonApi,
    nomisMapping,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getVideoLinkBookingFromAppointmentId', () => {
    it('should return video link booking when appointment type is mastered in BVLS and API is enabled', async () => {
      const appointmentDetails = {
        appointment: {
          locationId: 123,
          appointmentTypeCode: 'VLB',
        },
      }
      const location = { id: 456 }
      const videoLinkBooking = { videoLinkBookingId: 789 }

      whereaboutsApi.getAppointment.mockResolvedValue(appointmentDetails)
      nomisMapping.getNomisLocationMappingByNomisLocationId.mockResolvedValue({ dpsLocationId: 456 })
      locationsInsidePrisonApi.getLocationById.mockResolvedValue(location)
      bookAVideoLinkApi.matchAppointmentToVideoLinkBooking.mockResolvedValue(videoLinkBooking)

      const result = await getVideoLinkBookingFromAppointmentId(context, 1)

      expect(whereaboutsApi.getAppointment).toHaveBeenCalledWith(context, 1)
      expect(nomisMapping.getNomisLocationMappingByNomisLocationId).toHaveBeenCalledWith(context, 123)
      expect(locationsInsidePrisonApi.getLocationById).toHaveBeenCalledWith(context, 456)
      expect(bookAVideoLinkApi.matchAppointmentToVideoLinkBooking).toHaveBeenCalledWith(
        context,
        appointmentDetails.appointment,
        location
      )
      expect(result).toEqual(videoLinkBooking)
    })

    it('should return null when appointment type is not mastered in BVLS', async () => {
      const appointmentDetails = {
        appointment: {
          locationId: 123,
          appointmentTypeCode: 'OTHER',
        },
      }

      whereaboutsApi.getAppointment.mockResolvedValue(appointmentDetails)

      const result = await getVideoLinkBookingFromAppointmentId(context, 1)

      expect(result).toBeNull()
    })
  })

  describe('deleteVideoLinkBooking', () => {
    it('should call deleteVideoLinkBooking with correct parameters', async () => {
      await deleteVideoLinkBooking(context, 123)

      expect(bookAVideoLinkApi.deleteVideoLinkBooking).toHaveBeenCalledWith(context, 123)
    })
  })

  describe('bookingIsAmendable', () => {
    it('should return true when booking is amendable', () => {
      const appointment = {
        preAppointment: null,
        mainAppointment: {
          appointmentDate: moment().add(1, 'day').format('YYYY-MM-DD'),
          startTime: '10:00',
        },
      }
      const bookingStatus = 'ACTIVE'

      const result = bookingIsAmendable(appointment, bookingStatus)

      expect(result).toBe(true)
    })

    it('should return false when booking status is CANCELLED', () => {
      const appointment = {
        preAppointment: null,
        mainAppointment: {
          appointmentDate: moment().add(1, 'day').format('YYYY-MM-DD'),
          startTime: '10:00',
        },
      }
      const bookingStatus = 'CANCELLED'

      const result = bookingIsAmendable(appointment, bookingStatus)

      expect(result).toBe(false)
    })

    it('should return false when the earliest appointment time is in the past', () => {
      const appointment = {
        preAppointment: {
          appointmentDate: moment().format('YYYY-MM-DD'),
          startTime: moment().subtract(1, 'hour').format('HH:mm'),
        },
        mainAppointment: {
          appointmentDate: moment().format('YYYY-MM-DD'),
          startTime: moment().add(1, 'hour').format('HH:mm'),
        },
      }
      const bookingStatus = 'ACTIVE'

      const result = bookingIsAmendable(appointment, bookingStatus)

      expect(result).toBe(false)
    })
  })
})
