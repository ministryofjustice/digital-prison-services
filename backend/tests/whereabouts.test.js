import { whereaboutsDashboardFactory } from '../controllers/whereabouts'

describe('Whereabouts dashbaord', () => {
  const context = {}

  describe('service', () => {
    const oauthApi = {}
    const elite2Api = {}
    const whereaboutsApi = {}

    beforeEach(() => {
      oauthApi.currentUser = jest.fn()
      elite2Api.userCaseLoads = jest.fn()
      oauthApi.userRoles = jest.fn()
      whereaboutsApi.getAbsenceReasons = jest.fn()
      whereaboutsApi.getPrisonAttendance = jest.fn()
    })

    it('should call getPrisonAttendance with the correct parameters', async () => {
        const { service } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)
        const agencyId = 'LEI'
        const date = '2019-10-10'
        const period = 'AM'

        await service.getCountsOfPaidReasons(context, {agencyId, date, period})
        
        expect(whereaboutsApi.getPrisonAttendance).toHaveBeenCalledWith(agencyId, date, period)
    })
    it('should count paid reasons', async () => {
      const { service } = whereaboutsDashboardFactory(oauthApi, elite2Api, whereaboutsApi)
      const agencyId = 'LEI'
      const date = '2019-10-10'
      const period = 'AM'

      whereaboutsApi.getPrisonAttendance.mockReturnValue([
        {
          attended: true,
          paid: true,
        },
        {
            attended: false,
            paid: true,
            absentReason: 'NotRequired'
        },
        {
            attended: false,
            paid: true,
            absentReason: 'AcceptableAbsence'
        },
        {
            attended: false,
            paid: true,
            absentReason: 'ApprovedCourse'
        }
      ])

      const paidCounts = await service.getCountsOfPaidReasons(context, { agencyId, date, period })

      expect(paidCounts).toEqual({
        attended: 1,
        notRequired: 1,
        acceptableAbsence: 1,
        approvedCourse: 1
      })
    })
  })
})
