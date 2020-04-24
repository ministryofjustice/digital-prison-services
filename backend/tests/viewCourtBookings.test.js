const viewCourtBookingsRouter = require('../routes/appointments/viewCourtBookingsRouter')
const { serviceUnavailableMessage } = require('../common-messages')

describe('View court bookings', () => {
  const elite2Api = {}
  const whereaboutsApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      query: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          name: 'Test User',
        },
      },
    }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    elite2Api.getAppointmentsForAgency = jest.fn()

    elite2Api.getAppointmentsForAgency.mockReturnValue([])

    whereaboutsApi.getVideoLinkAppointments = jest.fn()
    whereaboutsApi.getVideoLinkAppointments.mockReturnValue({ appointments: [] })

    whereaboutsApi.getCourtLocations = jest.fn()
    whereaboutsApi.getCourtLocations.mockReturnValue({ courtLocations: [] })

    controller = viewCourtBookingsRouter({ elite2Api, whereaboutsApi, logError })
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

      expect(elite2Api.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
        agencyId: 'WWI',
        date: '2020-01-01',
      })
      expect(whereaboutsApi.getVideoLinkAppointments).toHaveBeenCalledWith(res.locals, [])
      expect(whereaboutsApi.getCourtLocations).toHaveBeenCalledWith(res.locals)
    })

    it('should render the correct template information', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('viewCourtBookings.njk', {
        appointmentRows: [],
        date: '01/01/2020',
        title: 'Video link bookings for 1 January 2020',
        courtOption: undefined,
        courts: [{ value: 'Other', text: 'Other' }],
        user: { displayName: 'Test User' },
        homeUrl: '/videolink',
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
            agencyId: 'WWI',
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
            agencyId: 'WWI',
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
            agencyId: 'WWI',
          },
          {
            id: 4,
            offenderNo: 'ABC456',
            firstName: 'OFFENDER',
            lastName: 'FOUR',
            date: '2020-01-02',
            startTime: '2020-01-02T13:30:00',
            endTime: '2020-01-02T14:30:00',
            appointmentTypeDescription: 'Video Link booking',
            appointmentTypeCode: 'VLB',
            locationDescription: 'VCC ROOM',
            locationId: 456,
            auditUserId: 'STAFF_2',
            agencyId: 'WWI',
          },
          {
            id: 5,
            offenderNo: 'ABC456',
            firstName: 'OFFENDER',
            lastName: 'FIVE',
            date: '2020-01-02',
            startTime: '2020-01-02T15:30:00',
            endTime: '2020-01-02T16:30:00',
            appointmentTypeDescription: 'Video Link booking',
            appointmentTypeCode: 'VLB',
            locationDescription: 'VCC ROOM',
            locationId: 456,
            auditUserId: 'STAFF_2',
            agencyId: 'WWI',
          },
        ])

        whereaboutsApi.getVideoLinkAppointments.mockReturnValue({
          appointments: [
            {
              id: 1,
              bookingId: 1,
              appointmentId: 3,
              court: 'Wimbledon',
              hearingType: 'MAIN',
              createdByUsername: 'username1',
              madeByTheCourt: true,
            },
            {
              id: 2,
              bookingId: 1,
              appointmentId: 4,
              court: 'A Different Court',
              hearingType: 'MAIN',
              createdByUsername: 'username1',
              madeByTheCourt: true,
            },
            {
              id: 3,
              bookingId: 1,
              appointmentId: 5,
              hearingType: 'MAIN',
              createdByUsername: 'username1',
              madeByTheCourt: true,
            },
          ],
        })

        whereaboutsApi.getCourtLocations.mockReturnValue({
          courtLocations: ['Wimbledon', 'Southwark'],
        })

        req.query = {
          date: '02/01/2020',
        }
      })
      it('should make the correct API calls', async () => {
        await controller(req, res)

        expect(elite2Api.getAppointmentsForAgency).toHaveBeenCalledWith(res.locals, {
          agencyId: 'WWI',
          date: '2020-01-02',
        })
        expect(whereaboutsApi.getVideoLinkAppointments).toHaveBeenCalledWith(res.locals, [3, 4, 5])
        expect(whereaboutsApi.getCourtLocations).toHaveBeenCalledWith(res.locals)
      })

      it('should render the correct template information', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'viewCourtBookings.njk',
          expect.objectContaining({
            appointmentRows: [
              [
                { text: '13:30 to 14:30' },
                {
                  text: 'Offender Four',
                },
                { text: 'VCC ROOM' },
                { text: 'A Different Court' },
              ],
              [
                { text: '14:30 to 15:30' },
                {
                  text: 'Offender Three',
                },
                { text: 'VCC ROOM' },
                { text: 'Wimbledon' },
              ],
              [
                { text: '15:30 to 16:30' },
                {
                  text: 'Offender Five',
                },
                { text: 'VCC ROOM' },
                { text: 'Not available' },
              ],
            ],
            date: '02/01/2020',
            title: 'Video link bookings for 2 January 2020',
            courtOption: undefined,
            courts: [
              { text: 'Southwark', value: 'Southwark' },
              { text: 'Wimbledon', value: 'Wimbledon' },
              { text: 'Other', value: 'Other' },
            ],
            homeUrl: '/videolink',
            user: { displayName: 'Test User' },
          })
        )
      })

      it('should only return appointments for a selected court', async () => {
        req.query = {
          ...req.query,
          courtOption: 'Wimbledon',
        }

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'viewCourtBookings.njk',
          expect.objectContaining({
            appointmentRows: [
              [
                { text: '14:30 to 15:30' },
                {
                  text: 'Offender Three',
                },
                { text: 'VCC ROOM' },
                { text: 'Wimbledon' },
              ],
            ],
          })
        )
      })

      it('should only return appointments in unsupported courts when Other is selected', async () => {
        req.query = {
          ...req.query,
          courtOption: 'Other',
        }

        await controller(req, res)

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'viewCourtBookings.njk',
          expect.objectContaining({
            appointmentRows: [
              [
                { text: '13:30 to 14:30' },
                {
                  text: 'Offender Four',
                },
                { text: 'VCC ROOM' },
                { text: 'A Different Court' },
              ],
              [
                { text: '15:30 to 16:30' },
                {
                  text: 'Offender Five',
                },
                { text: 'VCC ROOM' },
                { text: 'Not available' },
              ],
            ],
            title: 'Video link bookings for 2 January 2020 - Other',
          })
        )
      })
    })

    describe('when there is an error retrieving information', () => {
      it('should render the error template', async () => {
        whereaboutsApi.getCourtLocations.mockRejectedValue(new Error('Problem retrieving courts'))

        await controller(req, res)

        expect(logError).toHaveBeenCalledWith(
          'http://localhost',
          new Error('Problem retrieving courts'),
          serviceUnavailableMessage
        )
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/videolink/bookings' })
      })
    })
  })
})
