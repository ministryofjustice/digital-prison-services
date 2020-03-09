const moment = require('moment')
const checkAppointmentRooms = require('./checkAppointmentRooms')
const { DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC } = require('../../src/dateHelpers')

const existingEventsService = {}
const availableSlotsService = {}
const req = {
  session: {
    userDetails: {},
  },
  params: {
    offenderNo: 'A12345',
    agencyId: 'MDI',
  },
}
const res = { locals: {}, send: jest.fn(), redirect: jest.fn() }

const bookingId = 1
const appointmentDetails = {
  bookingId,
  offenderNo: 'A12345',
  firstName: 'john',
  lastName: 'doe',
  appointmentType: 'VLB',
  locationId: 1,
  startTime: '2017-01-01T12:00',
  endTime: '2017-01-01T13:00',
  startTimeHours: '12',
  startTimeMinutes: '00',
  endTimeHours: '13',
  endTimeMinutes: '00',
  recurring: 'No',
  comment: 'Test',
  locationDescription: 'Room 3',
  appointmentTypeDescription: 'VideoLink',
  locationTypes: [{ value: 1, text: 'Room 3' }, { value: 2, text: 'Room 2' }, { value: 3, text: 'Room 3' }],
  date: '01/01/2017',
  preAppointmentRequired: 'yes',
  postAppointmentRequired: 'yes',
  court: 'Leeds',
}

describe('Room check middleware', () => {
  let middleware
  let logError
  let next

  beforeEach(() => {
    availableSlotsService.getAvailableRooms = jest.fn()
    existingEventsService.getAvailableLocationsForVLB = jest.fn()

    availableSlotsService.getAvailableRooms.mockReturnValue([])

    res.render = jest.fn()
    res.send = jest.fn()
    res.redirect = jest.fn()
    req.flash = jest.fn()
    logError = jest.fn()
    next = jest.fn()

    req.flash.mockImplementation(() => [appointmentDetails])

    middleware = checkAppointmentRooms(existingEventsService, availableSlotsService, logError)
  })

  afterEach(() => {
    if (Date.now.mockRestore) Date.now.mockRestore()
  })

  describe('when there are rooms available', () => {
    it('should place appointment details into flash and continue to next middleware', async () => {
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [{ value: 1, text: 'Room 1' }],
        preLocations: [{ value: 2, text: 'Room 2' }, { value: 22, text: 'Room 22' }],
        postLocations: [{ value: 3, text: 'Room 3' }, { value: 33, text: 'Room 33' }],
      })

      const tomorrow = moment().add(1, 'day')
      req.body = {
        bookingId: 1,
        date: tomorrow.format(DAY_MONTH_YEAR),
        startTimeHours: '00',
        startTimeMinutes: '01',
        endTimeHours: '00',
        endTimeMinutes: '01',
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
      }

      await middleware(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('when there are no rooms available', () => {
    beforeEach(() => {
      req.body = {
        bookingId,
        date: moment().format(DAY_MONTH_YEAR),
        preAppointmentRequired: 'yes',
        postAppointmentRequired: 'yes',
      }
    })

    it('should include pre and post time when checking for availability', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000) // 2017-01-01T00:00:00.000Z
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [],
        preLocations: [],
        postLocations: [],
      })

      await middleware(req, res, next)

      const mainStartTime = moment()
        .hour(12)
        .minute(0)

      const mainEndTime = moment()
        .hour(13)
        .minute(0)

      const startTime = moment(mainStartTime)
        .subtract(20, 'minutes')
        .format(DATE_TIME_FORMAT_SPEC)
      const endTime = moment(mainEndTime)
        .add(20, 'minutes')
        .format(DATE_TIME_FORMAT_SPEC)

      expect(availableSlotsService.getAvailableRooms).toHaveBeenCalledWith(
        {},
        {
          agencyId: 'MDI',
          startTime,
          endTime,
        }
      )
    })

    it('should return the availability for the whole day screen when there is less than two available rooms', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [],
        preLocations: [],
        postLocations: [],
      })

      availableSlotsService.getAvailableRooms.mockReturnValue([{ value: 1 }])

      await middleware(req, res, next)

      expect(res.render).toHaveBeenCalledWith('noAppointmentsForWholeDay.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
        date: 'Sunday 1 January 2017',
        homeUrl: '/videolink',
      })
    })

    it('should return the availability for date time screen when there is more or equal to two available rooms', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [],
        preLocations: [],
        postLocations: [],
      })

      availableSlotsService.getAvailableRooms.mockReturnValue([{ value: 1 }, { value: 2 }])

      await middleware(req, res, next)

      expect(res.render).toHaveBeenCalledWith('noAppointmentsForDateTime.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment',
        date: 'Sunday 1 January 2017',
        endTime: '13:20',
        startTime: '11:40',
        homeUrl: '/videolink',
      })
    })

    it('should continue with the journey if a pre appointment not required', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [{ value: 1, text: 'Room 1' }],
        preLocations: [],
        postLocations: [{ value: 3, text: 'Room 3' }, { value: 4, text: 'Room 4' }],
      })

      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preAppointmentRequired: 'no',
        },
      ])

      await middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should continue with the journey if a post appointment not required', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        mainLocations: [{ value: 1, text: 'Room 1' }],
        preLocations: [{ value: 3, text: 'Room 3' }, { value: 4, text: 'Room 4' }],
        postLocations: [],
      })

      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          postAppointmentRequired: 'no',
        },
      ])

      await middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('when selected rooms are still available', () => {
    it('should call the next middleware', async () => {
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        preLocations: [{ value: 1, text: 'Room 1' }, { value: 3, text: 'Room 3' }],
        mainLocations: [{ value: 2, text: 'Room 2' }],
        postLocations: [{ value: 1, text: 'Room 1' }, { value: 3, text: 'Room 3' }],
      })

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      middleware = checkAppointmentRooms(existingEventsService, availableSlotsService, logError)
      await middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('when selected rooms are no longer available', () => {
    it('should render room not available page if originaly selected main room is not available', async () => {
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        preLocations: [{ value: 1, text: 'Room 1' }, { value: 3, text: 'Room 3' }],
        mainLocations: [{ value: 4, text: 'Room 4' }],
        postLocations: [{ value: 1, text: 'Room 1' }, { value: 3, text: 'Room 3' }],
      })

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      middleware = checkAppointmentRooms(existingEventsService, availableSlotsService, logError)
      await middleware(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
      expect(res.render).toHaveBeenCalledWith('appointmentRoomNoLongerAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
      })
    })

    it('should render room not available page if originally selected pre room is not available', async () => {
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        preLocations: [{ value: 2, text: 'Room 2' }, { value: 3, text: 'Room 3' }],
        mainLocations: [{ value: 2, text: 'Room 2' }],
        postLocations: [{ value: 2, text: 'Room 2' }, { value: 3, text: 'Room 3' }],
      })

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      middleware = checkAppointmentRooms(existingEventsService, availableSlotsService, logError)
      await middleware(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
      expect(res.render).toHaveBeenCalledWith('appointmentRoomNoLongerAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
      })
    })

    it('should render room not available page if originally selected post room is not available', async () => {
      existingEventsService.getAvailableLocationsForVLB.mockReturnValue({
        preLocations: [{ value: 2, text: 'Room 2' }, { value: 4, text: 'Room 4' }],
        mainLocations: [{ value: 2, text: 'Room 2' }],
        postLocations: [{ value: 2, text: 'Room 2' }, { value: 4, text: 'Room 4' }],
      })

      req.body = {
        selectPreAppointmentLocation: '1',
        selectMainAppointmentLocation: '2',
        selectPostAppointmentLocation: '3',
        comment: 'Test',
      }

      middleware = checkAppointmentRooms(existingEventsService, availableSlotsService, logError)
      await middleware(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('appointmentDetails', appointmentDetails)
      expect(res.render).toHaveBeenCalledWith('appointmentRoomNoLongerAvailable.njk', {
        continueLink: '/MDI/offenders/A12345/add-court-appointment/select-rooms',
      })
    })
  })
})
