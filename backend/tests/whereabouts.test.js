import { whereaboutsDashboardFactory } from '../controllers/whereabouts'

describe('Whereabouts dashbaord', () => {
  const context = {}

  describe('service', () => {
    const oauthApi = {}
    const elite2Api = {}
    const whereaboutsApi = {}

    const agencyId = 'LEI'
    const date = '2019-10-10'
    const period = 'AM'

    beforeEach(() => {
      oauthApi.currentUser = jest.fn()
      elite2Api.userCaseLoads = jest.fn()
      elite2Api.getOffenderActivities = jest.fn()
      oauthApi.userRoles = jest.fn()
      whereaboutsApi.getAbsenceReasons = jest.fn()
      whereaboutsApi.getPrisonAttendance = jest.fn()
    })
    it('should count paid reasons', async () => {
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

      const { getDashboardViewModel } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)

      const { attended, notrequired, acceptableabsence, approvedcourse } = await getDashboardViewModel(context, {
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
      const { getDashboardViewModel } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)

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

      const { sessioncancelled, sick, unacceptableabsence, restday, refused, restincell } = await getDashboardViewModel(
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

    it('should call elite2Api.getOffenderActivities with the correct params', async () => {
      const { getDashboardViewModel } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)

      whereaboutsApi.getPrisonAttendance.mockReturnValue([])
      elite2Api.getOffenderActivities.mockReturnValue([])

      await getDashboardViewModel(context, { agencyId, date, period })

      expect(elite2Api.getOffenderActivities).toHaveBeenCalledWith(context, { agencyId, date, period })
      expect(whereaboutsApi.getPrisonAttendance).toHaveBeenCalledWith(context, { agencyId, date, period })
    })

    it('should count unaccounted for prisoners', async () => {
      const { getDashboardViewModel } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)

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

      const { missing } = await getDashboardViewModel(context, { agencyId, date, period })

      expect({
        missing,
      }).toEqual({
        missing: 2,
      })
    })

    it('should call eliteApi and whereaboutsApi with the correct parameters', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue([])
      const { getDashboardViewModel } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)

      await getDashboardViewModel(context, { agencyId, date, period })

      expect(elite2Api.getOffenderActivities).toHaveBeenCalledWith(context, { agencyId, date, period })
      expect(whereaboutsApi.getPrisonAttendance).toHaveBeenCalledWith(context, { agencyId, date, period })
    })
  })
})
