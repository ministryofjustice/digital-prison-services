const viewAppointmentsRouter = require('../routes/appointments/viewAppointmentsRouter.js')
const { serviceUnavailableMessage } = require('../common-messages')

describe('View appointments', () => {
  const elite2Api = {}
  const whereaboutsApi = {}

  let req
  let res
  let logError
  let controller

  const activeCaseLoadId = 'MDI'

  beforeEach(() => {
    req = {
      query: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          activeCaseLoadId,
        },
      },
    }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    elite2Api.getAppointmentTypes = jest.fn()
    elite2Api.getLocationsForAppointments = jest.fn()
    elite2Api.getAppointmentsForAgency = jest.fn()
    elite2Api.getStaffDetails = jest.fn()

    elite2Api.getAppointmentTypes.mockReturnValue([{ description: 'Video link booking', code: 'VLB' }])
    elite2Api.getLocationsForAppointments.mockReturnValue([{ userDescription: 'VCC Room 1', locationId: '1' }])
    elite2Api.getAppointmentsForAgency.mockReturnValue([])
    elite2Api.getStaffDetails.mockResolvedValue([])

    whereaboutsApi.getVideoLinkAppointments = jest.fn()
    whereaboutsApi.getVideoLinkAppointments.mockReturnValue([])

    controller = viewAppointmentsRouter({ elite2Api, whereaboutsApi, logError })
  })

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1577869200000) // 2020-01-01 09:00:00
  })

  afterAll(() => {
    Date.now.mockRestore()
  })

  describe('when the page is first loaded with no results', () => {
    it('should make the correct API calls', async () => {
      await controller(req, res)

      expect(elite2Api.getAppointmentTypes).toHaveBeenCalledWith(res.locals)
      expect(elite2Api.getLocationsForAppointments).toHaveBeenCalledWith(res.locals, activeCaseLoadId)
      expect(elite2Api.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
        agencyId: activeCaseLoadId,
        date: '2020-01-01',
        timeSlot: 'AM',
      })
      expect(whereaboutsApi.getVideoLinkAppointments).toHaveBeenCalledWith(res.locals, [])
      expect(elite2Api.getStaffDetails).not.toHaveBeenCalled()
    })

    it('should render the correct template information', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewAppointments.njk', {
        appointmentRows: [],
        date: '01/01/2020',
        formattedDate: '1 January 2020',
        locations: [{ text: 'VCC Room 1', value: '1' }],
        timeSlot: 'AM',
        types: [{ text: 'Video link booking', value: 'VLB' }],
      })
    })

    it('should request data for the PM period in the afternoon', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1577880000000) // 2020-01-01 12:00:00

      await controller(req, res)

      expect(elite2Api.getAppointmentsForAgency).toHaveBeenCalledWith(
        res.locals,
        expect.objectContaining({
          timeSlot: 'PM',
        })
      )
      expect(res.render).toHaveBeenCalledWith(
        'viewAppointments.njk',
        expect.objectContaining({
          timeSlot: 'PM',
        })
      )
    })

    it('should request data for the ED period in the evening', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1577898000000) // 2020-01-01 17:00:00

      await controller(req, res)

      expect(elite2Api.getAppointmentsForAgency).toHaveBeenCalledWith(
        res.locals,
        expect.objectContaining({
          timeSlot: 'ED',
        })
      )
      expect(res.render).toHaveBeenCalledWith(
        'viewAppointments.njk',
        expect.objectContaining({
          timeSlot: 'ED',
        })
      )
    })
  })

  describe('when there are selected search parameters with results', () => {
    beforeEach(() => {
      elite2Api.getAppointmentsForAgency.mockReturnValue([
        {
          id: 1,
          offenderNo: 'ABC123',
          firstName: 'OFFENDER',
          lastName: 'ONE',
          date: '2020-01-02',
          startTime: '2020-01-02T12:30:00',
          appointmentTypeDescription: 'Medical - Other',
          appointmentTypeCode: 'MEOT',
          locationDescription: 'HEALTH CARE',
          locationId: 123,
          auditUserId: 'STAFF_1',
          agencyId: 'MDI',
        },
        {
          id: 2,
          offenderNo: 'ABC456',
          firstName: 'OFFENDER',
          lastName: 'TWO',
          date: '2020-01-02',
          startTime: '2020-01-02T13:30:00',
          endTime: '2020-01-02T14:30:00',
          appointmentTypeDescription: 'Gym - Exercise',
          appointmentTypeCode: 'GYM',
          locationDescription: 'GYM',
          locationId: 456,
          auditUserId: 'STAFF_2',
          agencyId: 'MDI',
        },
        {
          id: 3,
          offenderNo: 'ABC789',
          firstName: 'OFFENDER',
          lastName: 'THREE',
          date: '2020-01-02',
          startTime: '2020-01-02T14:30:00',
          endTime: '2020-01-02T15:30:00',
          appointmentTypeDescription: 'Video Link booking',
          appointmentTypeCode: 'VLB',
          locationDescription: 'VCC ROOM',
          locationId: 789,
          auditUserId: 'STAFF_3',
          agencyId: 'MDI',
        },
      ])

      elite2Api.getStaffDetails
        .mockResolvedValueOnce({
          staffId: 1,
          username: 'STAFF_1',
          firstName: 'STAFF',
          lastName: 'ONE',
        })
        .mockRejectedValueOnce(new Error('Staff member no longer exists'))
        .mockResolvedValueOnce({
          staffId: 3,
          username: 'STAFF_3',
          firstName: 'STAFF',
          lastName: 'THREE',
        })

      whereaboutsApi.getVideoLinkAppointments.mockReturnValue({
        appointments: [
          {
            id: 1,
            bookingId: 1,
            appointmentId: 3,
            court: 'Wimbledon',
            hearingType: 'MAIN',
          },
        ],
      })

      req.query = {
        date: '02/01/2020',
        timeSlot: 'PM',
      }
    })
    it('should make the correct API calls', async () => {
      await controller(req, res)

      expect(elite2Api.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
        agencyId: activeCaseLoadId,
        date: '2020-01-02',
        timeSlot: 'PM',
      })
      expect(whereaboutsApi.getVideoLinkAppointments).toHaveBeenCalledWith(res.locals, [3])
      expect(elite2Api.getStaffDetails).toHaveBeenCalledTimes(3)
    })

    it('should render the correct template information', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewAppointments.njk', {
        appointmentRows: [
          [
            { text: '12:30' },
            {
              html: '<a href="http://localhost:3000/offenders/ABC123" class="govuk-link">One, Offender</a>',
              attributes: {
                'data-sort-value': 'ONE',
              },
            },
            { text: 'ABC123' },
            { text: 'Medical - Other' },
            { text: 'HEALTH CARE' },
            { text: 'Staff One' },
          ],
          [
            { text: '13:30 to 14:30' },
            {
              html: '<a href="http://localhost:3000/offenders/ABC456" class="govuk-link">Two, Offender</a>',
              attributes: {
                'data-sort-value': 'TWO',
              },
            },
            { text: 'ABC456' },
            { text: 'Gym - Exercise' },
            { text: 'GYM' },
            { text: '--' },
          ],
          [
            { text: '14:30 to 15:30' },
            {
              html: '<a href="http://localhost:3000/offenders/ABC789" class="govuk-link">Three, Offender</a>',
              attributes: {
                'data-sort-value': 'THREE',
              },
            },
            { text: 'ABC789' },
            { text: 'Video Link booking' },
            { text: 'VCC ROOM' },
            { text: 'Wimbledon' },
          ],
        ],
        date: '02/01/2020',
        formattedDate: '2 January 2020',
        locations: [{ text: 'VCC Room 1', value: '1' }],
        timeSlot: 'PM',
        types: [{ text: 'Video link booking', value: 'VLB' }],
      })
    })

    it('should only return appointments with selected appointment type', async () => {
      req.query = {
        ...req.query,
        type: 'GYM',
      }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'viewAppointments.njk',
        expect.objectContaining({
          appointmentRows: [
            [
              { text: '13:30 to 14:30' },
              {
                html: '<a href="http://localhost:3000/offenders/ABC456" class="govuk-link">Two, Offender</a>',
                attributes: {
                  'data-sort-value': 'TWO',
                },
              },
              { text: 'ABC456' },
              { text: 'Gym - Exercise' },
              { text: 'GYM' },
              { text: 'Staff One' },
            ],
          ],
          type: 'GYM',
        })
      )
    })

    it('should not specify a timeSlot when All is selected for period', async () => {
      req.query = {
        ...req.query,
        timeSlot: 'All',
      }

      await controller(req, res)

      expect(elite2Api.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
        agencyId: activeCaseLoadId,
        date: '2020-01-02',
      })
    })
  })

  describe('when there is an error retrieving information', () => {
    it('should render the error template', async () => {
      elite2Api.getAppointmentTypes.mockRejectedValue(new Error('Problem retrieving appointment types'))

      await controller(req, res)

      expect(logError).toHaveBeenCalledWith(
        'http://localhost',
        new Error('Problem retrieving appointment types'),
        serviceUnavailableMessage
      )
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/appointments' })
    })
  })
})
