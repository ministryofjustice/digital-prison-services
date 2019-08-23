import { whereaboutsDashboardFactory } from '../controllers/whereabouts'

describe('Whereabouts dashboard', () => {
  const context = {}
  const oauthApi = {}
  const elite2Api = {}
  const whereaboutsApi = {}
  const agencyId = 'LEI'
  const date = '2019-10-10'
  const period = 'AM'

  describe('Controller', () => {
    beforeEach(() => {
      oauthApi.currentUser = jest.fn()
      elite2Api.userCaseLoads = jest.fn()
      elite2Api.getOffenderActivities = jest.fn()
      oauthApi.userRoles = jest.fn()
      whereaboutsApi.getAbsenceReasons = jest.fn()
      whereaboutsApi.getPrisonAttendance = jest.fn()
    })

    it('should redirect to /whereabouts with default parameters when none was present', async () => {
      const { whereaboutsDashboard } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)

      jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000) // Sunday 2017-01-01T00:00:00.000Z
      elite2Api.userCaseLoads.mockReturnValue([
        {
          currentlyActive: true,
          caseLoadId: 'LEI',
        },
      ])

      const req = {}
      const res = {
        redirect: jest.fn(),
      }

      await whereaboutsDashboard(req, res)

      expect(res.redirect(`/whereabouts?agencyId=${agencyId}&date=${date}&period=${period}`))

      Date.now.mockRestore()
    })

    it('should try render the error template on error', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue([])
      elite2Api.userCaseLoads.mockReturnValue([])
      oauthApi.currentUser.mockReturnValue({})

      const { whereaboutsDashboard } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)
      const res = {
        render: jest.fn(),
      }

      whereaboutsApi.getPrisonAttendance.mockImplementation(() => new Error('something is wrong'))

      await whereaboutsDashboard({ query: { agencyId, date, period } }, res)

      expect(res.render).toHaveBeenCalled() // todo check params
    })
  })

  describe('Dashboard stats ', () => {
    beforeEach(() => {
      oauthApi.currentUser = jest.fn()
      elite2Api.userCaseLoads = jest.fn()
      elite2Api.getOffenderActivities = jest.fn()
      oauthApi.userRoles = jest.fn()
      whereaboutsApi.getAbsenceReasons = jest.fn()
      whereaboutsApi.getPrisonAttendance = jest.fn()
      whereaboutsApi.getAbsenceReasons.mockReturnValue([
        'NotRequired',
        'AcceptableAbsence',
        'ApprovedCourse',
        'Sick',
        'Refused',
        'SessionCancelled',
        'UnacceptableAbsence',
        'RestDay',
        'RestInCell',
      ])
    })

    it('should call eliteApi and whereaboutsApi with the correct parameters', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue([])

      const { getDashboardStats } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)
      await getDashboardStats(context, { agencyId, date, period })

      expect(elite2Api.getOffenderActivities).toHaveBeenCalledWith(context, { agencyId, date, period })
      expect(whereaboutsApi.getPrisonAttendance).toHaveBeenCalledWith(context, { agencyId, date, period })
      expect(whereaboutsApi.getAbsenceReasons).toHaveBeenCalledWith(context)
    })

    it('should count paid reasons', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue([
        {
          attended: true,
          paid: true,
        },
        {
          attended: false,
          paid: true,
          absentReason: 'NotRequired',
        },
        {
          attended: false,
          paid: true,
          absentReason: 'AcceptableAbsence',
        },
        {
          attended: false,
          paid: true,
          absentReason: 'ApprovedCourse',
        },
      ])

      const { getDashboardStats } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)

      const { attended, notrequired, acceptableabsence, approvedcourse } = await getDashboardStats(context, {
        agencyId,
        date,
        period,
      })

      expect(attended).toBe(1)
      expect(notrequired).toBe(1)
      expect(acceptableabsence).toBe(1)
      expect(approvedcourse).toBe(1)
    })

    it('should count not paid reasons', async () => {
      const { getDashboardStats } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)

      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue([
        {
          attended: false,
          paid: false,
          absentReason: 'SessionCancelled',
        },
        {
          attended: false,
          paid: false,
          absentReason: 'Sick',
        },
        {
          attended: false,
          paid: false,
          absentReason: 'UnacceptableAbsence',
        },
        {
          attended: false,
          paid: false,
          absentReason: 'RestDay',
        },
        {
          attended: false,
          paid: false,
          absentReason: 'Refused',
        },
        {
          attended: false,
          paid: false,
          absentReason: 'RestInCell',
        },
      ])

      const { sessioncancelled, sick, unacceptableabsence, restday, refused, restincell } = await getDashboardStats(
        context,
        { agencyId, date, period }
      )

      expect({
        sessioncancelled,
        sick,
        unacceptableabsence,
        restday,
        refused,
        restincell,
      }).toEqual({
        sessioncancelled: 1,
        sick: 1,
        unacceptableabsence: 1,
        restday: 1,
        refused: 1,
        restincell: 1,
      })
    })

    it('should count unaccounted for prisoners', async () => {
      const { getDashboardStats } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)

      whereaboutsApi.getPrisonAttendance.mockReturnValue([
        {
          bookingId: 1,
          attended: true,
        },
      ])
      elite2Api.getOffenderActivities.mockReturnValue([
        {
          eventId: 1,
          bookingId: 1,
        },
        {
          eventId: 2,
          bookingId: 2,
        },
        {
          bookingId: 10,
          eventId: 5,
        },
      ])

      const { missing } = await getDashboardStats(context, { agencyId, date, period })

      expect({
        missing,
      }).toEqual({
        missing: 2,
      })
    })
  })
})
