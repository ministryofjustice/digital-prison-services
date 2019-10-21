import { attendanceStatisticsFactory } from '../controllers/attendanceStatistics'

describe('Attendance reason statistics', () => {
  const context = {}
  const oauthApi = {}
  const elite2Api = {}
  const whereaboutsApi = {}
  const agencyId = 'LEI'
  const date = '10/10/2019'
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

  describe('Dashboard Controller', () => {
    const mockReq = { originalUrl: '/manage-prisoner-whereabouts/attendance-reason-statistics' }
    beforeEach(() => {
      oauthApi.currentUser = jest.fn()
      elite2Api.userCaseLoads = jest.fn()
      elite2Api.getOffenderActivities = jest.fn()
      oauthApi.userRoles = jest.fn()
      whereaboutsApi.getAbsenceReasons = jest.fn()
      whereaboutsApi.getPrisonAttendance = jest.fn()
    })

    it('should redirect to /manage-prisoner-whereabouts/attendance-reason-statistics with default parameters when none was present', async () => {
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

      expect(
        res.redirect(
          `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&date=${date}&period=${period}`
        )
      )

      Date.now.mockRestore()
    })

    it('should render the attendance reasons statistics view with the correctly formatted parameters', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([
        {
          offenderNo: 'G8974UK',
          eventId: 3,
          locationId: 27219,
        },
      ])
      whereaboutsApi.getPrisonAttendance.mockReturnValue({
        attendances: [
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
        ],
      })
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
          AcceptableAbsence: 0,
          ApprovedCourse: 0,
          attended: 1,
          unaccountedFor: 1,
          NotRequired: 0,
          Refused: 0,
          RestDay: 0,
          RestInCell: 0,
          SessionCancelled: 0,
          Sick: 0,
          UnacceptableAbsence: 0,
        },
        date: '10/10/2019',
        displayDate: '10 October 2019',
        formattedReasons: {
          paidReasons: [
            {
              name: 'Acceptable absence',
              value: 'AcceptableAbsence',
            },
            {
              name: 'Approved course',
              value: 'ApprovedCourse',
            },
            {
              name: 'Not required',
              value: 'NotRequired',
            },
          ],
          unpaidReasons: [
            {
              name: 'Refused',
              value: 'Refused',
            },
            {
              name: 'Session cancelled',
              value: 'SessionCancelled',
            },
            {
              name: 'Rest in cell',
              value: 'RestInCell',
            },
            {
              name: 'Rest day',
              value: 'RestDay',
            },
            {
              name: 'Unacceptable absence',
              value: 'UnacceptableAbsence',
            },
            {
              name: 'Sick',
              value: 'Sick',
            },
          ],
        },
        inactiveCaseLoads: [],
        isFuturePeriod: false,
        period: 'AM',
        periodString: 'Morning',
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
        url: '/manage-prisoner-whereabouts/attendance-reason-statistics',
      })
    })

    it('should log the correct error', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue({ attendances: [] })
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

      const req = { ...mockReq, query: { agencyId, date, period } }

      await attendanceStatistics(req, res)

      expect(logError).toHaveBeenCalledWith(
        '/manage-prisoner-whereabouts/attendance-reason-statistics',
        new Error('something is wrong'),
        'Sorry, the service is unavailable'
      )
    })
  })

  describe('Absence Reasons Controller', () => {
    const mockReq = { originalUrl: '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/' }
    beforeEach(() => {
      elite2Api.getOffenderActivities = jest.fn()
      whereaboutsApi.getAbsences = jest.fn()
      oauthApi.currentUser = jest.fn()
      elite2Api.userCaseLoads = jest.fn()
      oauthApi.userRoles = jest.fn()
    })

    it('should render the list of offenders who were absent for specified reason when offender in caseload', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([
        {
          offenderNo: 'G8974UK',
          eventId: 3,
          bookingId: 1133341,
          locationId: 27219,
          firstName: 'Adam',
          lastName: 'Smith',
          cellLocation: 'LEI-1',
          comment: 'Cleaner',
          eventOutcome: 'ACC',
        },
      ])
      whereaboutsApi.getPrisonAttendance.mockReturnValue({
        attendances: [
          {
            id: 5812,
            bookingId: 1133341,
            eventId: 3,
            eventLocationId: 26149,
            period: 'AM',
            prisonId: 'LEI',
            attended: true,
            paid: true,
            absentReason: 'AcceptableAbsence',
            comments: 'Asked nicely.',
          },
        ],
      })
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
      const logError = jest.fn()
      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        elite2Api,
        whereaboutsApi,
        logError
      )
      const res = {
        render: jest.fn(),
      }

      await attendanceStatisticsOffendersList(
        { query: { agencyId, date, period }, params: { reason: 'AcceptableAbsence' } },
        res
      )

      expect(res.render).toHaveBeenCalledWith('attendanceStatisticsOffendersList.njk', {
        allCaseloads: [
          {
            caseLoadId: 'LEI',
            currentlyActive: true,
            description: 'Leeds (HMP)',
          },
        ],
        dashboardUrl:
          '/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=LEI&period=AM&date=10/10/2019',
        caseLoadId: 'LEI',
        title: 'Acceptable absence',
        reason: 'Acceptable absence',
        displayDate: '10 October 2019',
        displayPeriod: 'Morning',
        offenders: [
          [
            {
              html: '<a href=http://localhost:3000/offenders/G8974UK/quick-look target="_blank">Smith, Adam</a>',
            },
            {
              text: 'G8974UK',
            },
            {
              text: '1',
            },
            {
              text: 'Cleaner',
            },
            {
              text: 'Asked nicely.',
            },
          ],
        ],
        sortOptions: [
          {
            text: 'Name (A-Z)',
            value: '0_ascending',
          },
          {
            text: 'Name (Z-A)',
            value: '0_descending',
          },
          {
            text: 'Location (A-Z)',
            value: '2_ascending',
          },
          {
            text: 'Location (Z-A)',
            value: '2_descending',
          },
          {
            text: 'Activity (A-Z)',
            value: '3_ascending',
          },
          {
            text: 'Activity (Z-A)',
            value: '3_descending',
          },
        ],
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

    it('should render the list of offenders who were absent for specified reason when offender is not in caseload anymore but was on date', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([
        {
          offenderNo: 'G8974UK',
          eventId: 3,
          bookingId: 1133341,
          locationId: 27219,
          firstName: 'Adam',
          lastName: 'Smith',
          cellLocation: 'MDI-1',
          comment: 'Cleaner',
          eventOutcome: 'ACC',
        },
      ])
      whereaboutsApi.getPrisonAttendance.mockReturnValue({
        attendances: [
          {
            id: 5812,
            bookingId: 1133341,
            eventId: 3,
            eventLocationId: 26149,
            period: 'AM',
            prisonId: 'LEI',
            attended: true,
            paid: true,
            absentReason: 'AcceptableAbsence',
            comments: 'Asked nicely.',
          },
        ],
      })
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
      const logError = jest.fn()
      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        elite2Api,
        whereaboutsApi,
        logError
      )
      const res = {
        render: jest.fn(),
      }

      await attendanceStatisticsOffendersList(
        { query: { agencyId, date, period }, params: { reason: 'AcceptableAbsence' } },
        res
      )

      expect(res.render).toHaveBeenCalledWith('attendanceStatisticsOffendersList.njk', {
        allCaseloads: [
          {
            caseLoadId: 'LEI',
            currentlyActive: true,
            description: 'Leeds (HMP)',
          },
        ],
        dashboardUrl:
          '/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=LEI&period=AM&date=10/10/2019',
        caseLoadId: 'LEI',
        title: 'Acceptable absence',
        reason: 'Acceptable absence',
        displayDate: '10 October 2019',
        displayPeriod: 'Morning',
        offenders: [
          [
            {
              html: 'Smith, Adam',
            },
            {
              text: 'G8974UK',
            },
            {
              text: '--',
            },
            {
              text: 'Cleaner',
            },
            {
              text: 'Asked nicely.',
            },
          ],
        ],
        sortOptions: [
          {
            text: 'Name (A-Z)',
            value: '0_ascending',
          },
          {
            text: 'Name (Z-A)',
            value: '0_descending',
          },
          {
            text: 'Location (A-Z)',
            value: '2_ascending',
          },
          {
            text: 'Location (Z-A)',
            value: '2_descending',
          },
          {
            text: 'Activity (A-Z)',
            value: '3_ascending',
          },
          {
            text: 'Activity (Z-A)',
            value: '3_descending',
          },
        ],
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
      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        elite2Api,
        whereaboutsApi,
        logError
      )
      const res = {
        render: jest.fn(),
      }

      await attendanceStatisticsOffendersList(
        { query: { agencyId, date, period }, params: { reason: 'AcceptableAbsence' } },
        res
      )

      expect(res.render).toHaveBeenCalledWith('error.njk', {
        url: '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/AcceptableAbsence',
      })
    })

    it('should log the correct error', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([])
      elite2Api.userCaseLoads.mockReturnValue([])
      oauthApi.currentUser.mockReturnValue({})
      const logError = jest.fn()

      whereaboutsApi.getPrisonAttendance.mockImplementation(() => {
        throw new Error('something is wrong')
      })

      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        elite2Api,
        whereaboutsApi,
        logError
      )
      const res = {
        render: jest.fn(),
      }

      const req = { ...mockReq, query: { agencyId, date, period }, params: { reason: 'AcceptableAbsence' } }

      await attendanceStatisticsOffendersList(req, res)

      expect(logError).toHaveBeenCalledWith(
        '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/',
        new Error('something is wrong'),
        'Sorry, the service is unavailable'
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
      whereaboutsApi.getPrisonAttendance.mockReturnValue({ attendances: [] })

      const { getDashboardStats } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)
      await getDashboardStats(context, { agencyId, date, period, absenceReasons })

      expect(elite2Api.getOffenderActivities).toHaveBeenCalledWith(context, { agencyId, date, period })
      expect(whereaboutsApi.getPrisonAttendance).toHaveBeenCalledWith(context, { agencyId, date, period })
    })

    it('should count paid reasons', async () => {
      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue({
        attendances: [
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
        ],
      })

      const { getDashboardStats } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)

      const { attended, NotRequired, AcceptableAbsence, ApprovedCourse } = await getDashboardStats(context, {
        agencyId,
        date,
        period,
        absenceReasons,
      })

      expect(attended).toBe(1)
      expect(NotRequired).toBe(1)
      expect(AcceptableAbsence).toBe(1)
      expect(ApprovedCourse).toBe(1)
    })

    it('should count not paid reasons', async () => {
      const { getDashboardStats } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)

      elite2Api.getOffenderActivities.mockReturnValue([])
      whereaboutsApi.getPrisonAttendance.mockReturnValue({
        attendances: [
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
        ],
      })

      const { SessionCancelled, Sick, UnacceptableAbsence, RestDay, Refused, RestInCell } = await getDashboardStats(
        context,
        { agencyId, date, period, absenceReasons }
      )

      expect({
        SessionCancelled,
        Sick,
        UnacceptableAbsence,
        RestDay,
        Refused,
        RestInCell,
      }).toEqual({
        SessionCancelled: 1,
        Sick: 1,
        UnacceptableAbsence: 1,
        RestDay: 1,
        Refused: 1,
        RestInCell: 1,
      })
    })

    it('should count unaccounted for prisoners', async () => {
      const { getDashboardStats } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)

      whereaboutsApi.getPrisonAttendance.mockReturnValue({
        attendances: [
          {
            bookingId: 1,
            attended: true,
          },
        ],
      })
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

      const { unaccountedFor } = await getDashboardStats(context, { agencyId, date, period, absenceReasons })

      expect({
        unaccountedFor,
      }).toEqual({
        unaccountedFor: 2,
      })
    })
  })
})
