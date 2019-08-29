import { attendanceStatisticsFactory } from '../controllers/attendanceStatistics'

describe('Attendance reason statistics', () => {
  const context = {}
  const oauthApi = {}
  const elite2Api = {}
  const whereaboutsApi = {}
  const agencyId = 'LEI'
  const date = '2019-10-10'
  const period = 'AM'
  const absenceReasons = [
    'NotRequired',
    'AcceptableAbsence',
    'ApprovedCourse',
    'Sick',
    'Refused',
    'SessionCancelled',
    'UnacceptableAbsence',
    'RestDay',
    'RestInCell',
  ]

  describe('Controller', () => {
    beforeEach(() => {
      oauthApi.currentUser = jest.fn()
      elite2Api.userCaseLoads = jest.fn()
      elite2Api.getOffenderActivities = jest.fn()
      oauthApi.userRoles = jest.fn()
      whereaboutsApi.getAbsenceReasons = jest.fn()
      whereaboutsApi.getPrisonAttendance = jest.fn()
    })

    it('should redirect to /attendance-reason-statistics with default parameters when none was present', async () => {
      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)

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

      await attendanceStatistics(req, res)

      expect(res.redirect(`/attendance-reason-statistics?agencyId=${agencyId}&date=${date}&period=${period}`))

      Date.now.mockRestore()
    })

    it('should try render the whereabouts...', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([
        {
          offenderNo: 'G8974UK',
          eventId: 3,
          locationId: 27219,
        },
      ])
      whereaboutsApi.getPrisonAttendance.mockReturnValue([
        {
          id: 5812,
          bookingId: 1133341,
          eventId: 3,
          eventLocationId: 26149,
          period: 'AM',
          prisonId: 'MDI',
          attended: true,
          paid: true,
        },
      ])
      elite2Api.userCaseLoads.mockReturnValue([
        {
          caseLoadId: 'LEI',
          description: 'Leeds (HMP)',
          currentlyActive: true,
        },
      ])
      oauthApi.currentUser.mockReturnValue({
        username: 'USER_ADM',
        active: true,
        name: 'User Name',
        activeCaseLoadId: 'LEI',
      })
      whereaboutsApi.getAbsenceReasons.mockReturnValue({
        paidReasons: ['AcceptableAbsence', 'ApprovedCourse', 'NotRequired'],
        unpaidReasons: ['Refused', 'SessionCancelled', 'RestInCell', 'RestDay', 'UnacceptableAbsence', 'Sick'],
      })
      const logError = jest.fn()
      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, logError)
      const res = {
        render: jest.fn(),
      }

      await attendanceStatistics({ query: { agencyId, date, period } }, res)

      expect(res.render).toHaveBeenCalledWith('attendanceStatistics.njk', {
        allCaseloads: [
          {
            caseLoadId: 'LEI',
            currentlyActive: true,
            description: 'Leeds (HMP)',
          },
        ],
        caseLoadId: 'LEI',
        dashboardStats: {
          acceptableabsence: 0,
          approvedcourse: 0,
          attended: 1,
          missing: 1,
          notrequired: 0,
          refused: 0,
          restday: 0,
          restincell: 0,
          sessioncancelled: 0,
          sick: 0,
          unacceptableabsence: 0,
        },
        date: '2019-10-10',
        formattedReasons: {
          paidReasons: [
            { acceptableabsence: 'Acceptable absence' },
            { approvedcourse: 'Approved course' },
            {
              notrequired: 'Not required',
            },
          ],
          unpaidReasons: [
            { refused: 'Refused' },
            { sessioncancelled: 'Session cancelled' },
            { restincell: 'Rest in cell' },
            { restday: 'Rest day' },
            { unacceptableabsence: 'Unacceptable absence' },
            { sick: 'Sick' },
          ],
        },
        inactiveCaseLoads: [],
        period: 'AM',
        title: 'Attendance reason statistics',
        user: {
          activeCaseLoad: {
            description: 'Leeds (HMP)',
            id: 'LEI',
          },
          displayName: 'User Name',
        },
        userRoles: undefined,
      })
    })

    it('should try render the error template on error', async () => {
      const logError = jest.fn()
      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, logError)
      const res = {
        render: jest.fn(),
      }

      await attendanceStatistics({ query: { agencyId, date, period } }, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', {
        message: 'We have encountered a problem loading this page.  Please try again.',
        title: 'Attendance reason statistics',
      })
    })

    it('should log the correct error', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue([])
      elite2Api.userCaseLoads.mockReturnValue([])
      oauthApi.currentUser.mockReturnValue({})
      const logError = jest.fn()

      whereaboutsApi.getPrisonAttendance.mockImplementation(() => {
        throw new Error('something is wrong')
      })

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, logError)
      const res = {
        render: jest.fn(),
      }

      await attendanceStatistics({ query: { agencyId, date, period } }, res)

      expect(logError).toHaveBeenCalledWith(
        '/attendance-reason-statistics',
        new Error('something is wrong'),
        'There has been an error'
      )
    })
  })

  describe('Dashboard stats ', () => {
    beforeEach(() => {
      oauthApi.currentUser = jest.fn()
      elite2Api.userCaseLoads = jest.fn()
      elite2Api.getOffenderActivities = jest.fn()
      oauthApi.userRoles = jest.fn()
      whereaboutsApi.getPrisonAttendance = jest.fn()
    })

    it('should call eliteApi and whereaboutsApi with the correct parameters', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue([])

      const { getDashboardStats } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)
      await getDashboardStats(context, { agencyId, date, period, absenceReasons })

      expect(elite2Api.getOffenderActivities).toHaveBeenCalledWith(context, { agencyId, date, period })
      expect(whereaboutsApi.getPrisonAttendance).toHaveBeenCalledWith(context, { agencyId, date, period })
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

      const { getDashboardStats } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)

      const { attended, notrequired, acceptableabsence, approvedcourse } = await getDashboardStats(context, {
        agencyId,
        date,
        period,
        absenceReasons,
      })

      expect(attended).toBe(1)
      expect(notrequired).toBe(1)
      expect(acceptableabsence).toBe(1)
      expect(approvedcourse).toBe(1)
    })

    it('should count not paid reasons', async () => {
      const { getDashboardStats } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)

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
        { agencyId, date, period, absenceReasons }
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
      const { getDashboardStats } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)

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

      const { missing } = await getDashboardStats(context, { agencyId, date, period, absenceReasons })

      expect({
        missing,
      }).toEqual({
        missing: 2,
      })
    })
  })
})
