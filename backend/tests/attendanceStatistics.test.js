import moment from 'moment'
import { attendanceStatisticsFactory } from '../controllers/attendanceStatistics'

const mockDateToSunday012017 = () => jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000) // Sunday 2017-01-01T00:00:00.000Z

describe('Attendance reason statistics', () => {
  const context = {}
  const oauthApi = {}
  const elite2Api = {}
  const whereaboutsApi = {}
  const agencyId = 'LEI'
  const date = '10/10/2019'
  const fromDate = '10/10/2019'
  const toDate = '11/10/2019'
  const period = 'AM'
  const stats = {
    notRecorded: 0,
    paidReasons: {
      acceptableAbsence: 0,
      approvedCourse: 0,
      attended: 0,
      notRequired: 0,
    },
    scheduleActivities: 0,
    unpaidReasons: {
      refused: 0,
      restDay: 0,
      restInCell: 0,
      sessionCancelled: 0,
      sick: 0,
      unacceptableAbsence: 0,
    },
  }

  beforeEach(() => {
    oauthApi.currentUser = jest.fn()
    elite2Api.userCaseLoads = jest.fn()
    oauthApi.userRoles = jest.fn()
    whereaboutsApi.getAttendanceStats = jest.fn()
    whereaboutsApi.getAbsences = jest.fn()

    elite2Api.userCaseLoads.mockReturnValue([{ caseLoadId: 'LEI', description: 'Leeds (HMP)', currentlyActive: true }])
    oauthApi.currentUser.mockReturnValue({
      username: 'USER_ADM',
      active: true,
      name: 'User Name',
      activeCaseLoadId: 'LEI',
    })
  })

  afterEach(() => {
    if (Date.now.mockRestore) Date.now.mockRestore()
  })

  describe('Dashboard Controller', () => {
    const mockReq = { originalUrl: '/manage-prisoner-whereabouts/attendance-reason-statistics' }

    it('should redirect to /manage-prisoner-whereabouts/attendance-reason-statistics with default parameters when none was present', async () => {
      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi)

      mockDateToSunday012017()

      elite2Api.userCaseLoads.mockReturnValue([
        {
          currentlyActive: true,
          caseLoadId: 'LEI',
        },
      ])

      const req = {}
      const res = { redirect: jest.fn() }

      await attendanceStatistics(req, res)

      expect(
        res.redirect(
          `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&date=${date}&period=${period}`
        )
      )
    })

    it('should use current period by default when date is present and period is missing', async () => {
      mockDateToSunday012017()

      whereaboutsApi.getAttendanceStats.mockReturnValue(stats)

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())

      const req = { query: { agencyId, toDate, fromDate, period: null } }
      const res = { render: jest.fn(), locals: context }

      await attendanceStatistics(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'attendanceStatistics.njk',
        expect.objectContaining({
          period: 'AM',
          displayPeriod: 'AM',
        })
      )
    })

    it('should validate against future fromDate', async () => {
      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())

      const tomorrow = moment()
        .add(1, 'days')
        .format('DD/MM/YYYY')

      const req = { query: { agencyId, toDate: tomorrow, fromDate: tomorrow, period } }
      const res = { render: jest.fn(), locals: context }

      await attendanceStatistics(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'attendanceStatistics.njk',
        expect.objectContaining({
          errors: [
            { href: '#fromDate', text: 'Select a date range that is not in the future' },
            { href: '#toDate', text: 'Select a date range that is not in the future' },
          ],
        })
      )
    })

    it('should return a valid url for current week stats', async () => {
      mockDateToSunday012017()
      whereaboutsApi.getAttendanceStats.mockReturnValue(stats)

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())

      const req = { query: { agencyId, toDate, fromDate, period } }
      const res = { render: jest.fn(), locals: context }

      await attendanceStatistics(req, res)

      const sunday = '01/01/2017'
      const saturday = '07/01/2017'

      expect(res.render).toHaveBeenCalledWith(
        'attendanceStatistics.njk',
        expect.objectContaining({
          statsForCurrentWeek: `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=AM_PM&fromDate=${sunday}&toDate=${saturday}`,
        })
      )
    })

    it('should return a valid url for previous week stats', async () => {
      mockDateToSunday012017()
      whereaboutsApi.getAttendanceStats.mockReturnValue(stats)

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())

      const req = { query: { agencyId, toDate, fromDate, period } }
      const res = { render: jest.fn(), locals: context }

      await attendanceStatistics(req, res)

      const sunday = '25/12/2016'
      const saturday = '31/12/2016'

      expect(res.render).toHaveBeenCalledWith(
        'attendanceStatistics.njk',
        expect.objectContaining({
          statsForPreviousWeek: `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=AM_PM&fromDate=${sunday}&toDate=${saturday}`,
        })
      )
    })

    it('should return a valid url for 2 weeks stats, current week plus previous week', async () => {
      mockDateToSunday012017()

      whereaboutsApi.getAttendanceStats.mockReturnValue(stats)

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())

      const req = { query: { agencyId, toDate, fromDate, period } }
      const res = { render: jest.fn(), locals: context }

      await attendanceStatistics(req, res)

      const sunday = '25/12/2016'
      const saturday = '07/01/2017'

      expect(res.render).toHaveBeenCalledWith(
        'attendanceStatistics.njk',
        expect.objectContaining({
          statsFor2Weeks: `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=AM_PM&fromDate=${sunday}&toDate=${saturday}`,
        })
      )
    })

    it('should validate that the date range does not exceed two weeks', async () => {
      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())

      const today = moment()
      const threeWeeksAgo = moment().subtract(3, 'week')

      const req = { query: { agencyId, toDate: today, fromDate: threeWeeksAgo, period } }
      const res = { render: jest.fn(), locals: context }

      await attendanceStatistics(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'attendanceStatistics.njk',
        expect.objectContaining({
          errors: [{ href: '#fromDate', text: 'Select a date range that does not exceed two weeks' }],
        })
      )
    })

    it('should call whereabouts stats api with the correct parameters', async () => {
      whereaboutsApi.getAttendanceStats.mockReturnValue({})
      oauthApi.userRoles.mockReturnValue({})

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())
      const res = { render: jest.fn(), locals: context }
      const req = { query: { agencyId, fromDate, toDate, period } }

      await attendanceStatistics(req, res)

      expect(whereaboutsApi.getAttendanceStats).toHaveBeenCalledWith(context, {
        agencyId: 'LEI',
        fromDate: '2019-10-10',
        period: 'AM',
        toDate: '2019-10-11',
      })
    })

    it('should call whereabouts stats api leaving period blank when am and pm is selected', async () => {
      whereaboutsApi.getAttendanceStats.mockReturnValue({})
      oauthApi.userRoles.mockReturnValue({})

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())
      const req = { query: { agencyId, fromDate, toDate, period: 'AM_PM' } }
      const res = { render: jest.fn(), locals: context }

      await attendanceStatistics(req, res)

      expect(whereaboutsApi.getAttendanceStats).toHaveBeenCalledWith(context, {
        agencyId: 'LEI',
        fromDate: '2019-10-10',
        period: '',
        toDate: '2019-10-11',
      })
    })

    it('should remove the leading zeros from display date', async () => {
      whereaboutsApi.getAttendanceStats.mockReturnValue(stats)

      mockDateToSunday012017()

      const now = moment().format('DD/MM/YYYY')
      const nowPlus1 = moment()
        .add(1, 'day')
        .format('DD/MM/YYYY')

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())
      const req = { query: { agencyId, fromDate: now, toDate: nowPlus1, period: 'AM_PM' } }
      const res = { render: jest.fn() }

      await attendanceStatistics(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'attendanceStatistics.njk',
        expect.objectContaining({
          displayDate: '1 January 2017 to 2 January 2017',
        })
      )
    })

    it('should render the attendance reasons statistics view with the correctly formatted parameters', async () => {
      whereaboutsApi.getAttendanceStats.mockReturnValue(stats)

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())
      const req = { query: { agencyId, fromDate, toDate, period: 'AM_PM' } }
      const res = { render: jest.fn() }

      await attendanceStatistics(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'attendanceStatistics.njk',
        expect.objectContaining({
          allCaseloads: [
            {
              caseLoadId: 'LEI',
              currentlyActive: true,
              description: 'Leeds (HMP)',
            },
          ],
          caseLoadId: 'LEI',
          dashboardStats: {
            notRecorded: 0,
            attended: 0,
            paidReasons: [
              { id: 'AcceptableAbsence', name: 'Acceptable absence', value: 0 },
              { id: 'ApprovedCourse', name: 'Approved course', value: 0 },
              { id: 'NotRequired', name: 'Not required', value: 0 },
            ],
            scheduleActivities: 0,
            unpaidReasons: [
              { id: 'Refused', name: 'Refused', value: 0 },
              { id: 'RestDay', name: 'Rest day', value: 0 },
              { id: 'RestInCell', name: 'Rest in cell', value: 0 },
              { id: 'SessionCancelled', name: 'Session cancelled', value: 0 },
              { id: 'Sick', name: 'Sick', value: 0 },
              { id: 'UnacceptableAbsence', name: 'Unacceptable absence', value: 0 },
            ],
          },
          shouldClearFormValues: true,
          toDate: '11/10/2019',
          displayDate: '10 October 2019 to 11 October 2019',
          displayPeriod: 'AM + PM',
          inactiveCaseLoads: [],
          title: 'Attendance reason statistics',
          user: {
            activeCaseLoad: {
              description: 'Leeds (HMP)',
              id: 'LEI',
            },
            displayName: 'User Name',
          },
          clickThrough: {
            fromDate,
            toDate,
            period: 'AM_PM',
          },
          userRoles: undefined,
        })
      )
    })

    it('should try render the error template on error', async () => {
      const logError = jest.fn()
      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, logError)

      const req = { query: { agencyId, date, period } }
      const res = { render: jest.fn() }

      await attendanceStatistics(req, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', {
        url: '/manage-prisoner-whereabouts/attendance-reason-statistics',
      })
    })

    it('should log the correct error', async () => {
      const logError = jest.fn()

      whereaboutsApi.getAttendanceStats.mockImplementation(() => {
        throw new Error('something is wrong')
      })

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, logError)

      const req = { ...mockReq, query: { agencyId, fromDate, period } }
      const res = { render: jest.fn() }

      await attendanceStatistics(req, res)

      expect(logError).toHaveBeenCalledWith(
        '/manage-prisoner-whereabouts/attendance-reason-statistics',
        new Error('something is wrong'),
        'Sorry, the service is unavailable'
      )
    })

    it('should clear the date and period from a from and to date have been passed', async () => {
      whereaboutsApi.getAttendanceStats.mockReturnValue(stats)

      const { attendanceStatistics } = attendanceStatisticsFactory(oauthApi, elite2Api, whereaboutsApi, jest.fn())
      const req = { query: { agencyId, fromDate, toDate, period: 'AM_PM' } }
      const res = { render: jest.fn() }

      await attendanceStatistics(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'attendanceStatistics.njk',
        expect.objectContaining({
          shouldClearFormValues: true,
        })
      )
    })
  })

  describe('Absence Reasons Controller', () => {
    const mockReq = { originalUrl: '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/' }
    it('should render the list of offenders who were absent for specified reason when offender in caseload', async () => {
      whereaboutsApi.getAbsences.mockReturnValue({
        absences: [
          {
            offenderNo: 'G8974UK',
            eventId: 3,
            bookingId: 1133341,
            locationId: 27219,
            firstName: 'Adam',
            lastName: 'Smith',
            cellLocation: 'LEI-1',
            eventDescription: 'Cleaner',
            eventOutcome: 'ACC',
            id: 5812,
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

      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        elite2Api,
        whereaboutsApi,
        jest.fn()
      )

      const req = { query: { agencyId, fromDate, toDate, period }, params: { reason: 'AcceptableAbsence' } }
      const res = { render: jest.fn() }

      await attendanceStatisticsOffendersList(req, res)

      expect(res.render).toHaveBeenCalledWith('attendanceStatisticsOffendersList.njk', {
        user: {
          activeCaseLoad: {
            description: 'Leeds (HMP)',
            id: 'LEI',
          },
          displayName: 'User Name',
        },
        allCaseloads: [
          {
            caseLoadId: 'LEI',
            currentlyActive: true,
            description: 'Leeds (HMP)',
          },
        ],
        dashboardUrl:
          '/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=LEI&period=AM&fromDate=10/10/2019&toDate=11/10/2019',
        caseLoadId: 'LEI',
        title: 'Acceptable absence',
        reason: 'Acceptable absence',
        displayDate: '10 October 2019 to 11 October 2019',
        displayPeriod: 'AM',
        offenders: [
          [
            { html: '<a href=http://localhost:3000/offenders/G8974UK/quick-look target="_blank">Smith, Adam</a>' },
            { text: 'G8974UK' },
            { text: '1' },
            { text: 'Cleaner' },
            { text: 'Asked nicely.' },
          ],
        ],
        sortOptions: [
          { text: 'Name (A-Z)', value: '0_ascending' },
          { text: 'Name (Z-A)', value: '0_descending' },
          { text: 'Location (A-Z)', value: '2_ascending' },
          { text: 'Location (Z-A)', value: '2_descending' },
          { text: 'Activity (A-Z)', value: '3_ascending' },
          { text: 'Activity (Z-A)', value: '3_descending' },
        ],
        userRoles: undefined,
      })
    })

    it('should render the list of offenders who were absent for specified reason when offender is not in caseload anymore but was on date', async () => {
      whereaboutsApi.getAbsences.mockReturnValue({
        absences: [
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
            offenderNo: 'G8974UK',
            locationId: 27219,
            firstName: 'Adam',
            lastName: 'Smith',
            cellLocation: 'MDI-1',
            eventDescription: 'Cleaner',
            eventOutcome: 'ACC',
          },
        ],
      })

      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        elite2Api,
        whereaboutsApi,
        jest.fn()
      )
      const req = { query: { agencyId, fromDate, toDate, period: 'AM_PM' }, params: { reason: 'AcceptableAbsence' } }
      const res = {
        render: jest.fn(),
      }

      await attendanceStatisticsOffendersList(req, res)

      expect(res.render).toHaveBeenCalledWith('attendanceStatisticsOffendersList.njk', {
        allCaseloads: [
          {
            caseLoadId: 'LEI',
            currentlyActive: true,
            description: 'Leeds (HMP)',
          },
        ],
        dashboardUrl:
          '/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=LEI&period=AM_PM&fromDate=10/10/2019&toDate=11/10/2019',
        caseLoadId: 'LEI',
        title: 'Acceptable absence',
        reason: 'Acceptable absence',
        displayDate: '10 October 2019 to 11 October 2019',
        displayPeriod: 'AM + PM',
        offenders: [
          [
            { html: 'Smith, Adam' },
            { text: 'G8974UK' },
            { text: '--' },
            { text: 'Cleaner' },
            { text: 'Asked nicely.' },
          ],
        ],
        sortOptions: [
          { text: 'Name (A-Z)', value: '0_ascending' },
          { text: 'Name (Z-A)', value: '0_descending' },
          { text: 'Location (A-Z)', value: '2_ascending' },
          { text: 'Location (Z-A)', value: '2_descending' },
          { text: 'Activity (A-Z)', value: '3_ascending' },
          { text: 'Activity (Z-A)', value: '3_descending' },
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

      const req = { query: { agencyId, date, period }, params: { reason: 'AcceptableAbsence' } }
      const res = { render: jest.fn() }

      await attendanceStatisticsOffendersList(req, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', {
        url: '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/AcceptableAbsence',
      })
    })

    it('should log the correct error', async () => {
      const logError = jest.fn()

      oauthApi.currentUser.mockImplementation(() => {
        throw new Error('something is wrong')
      })

      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        elite2Api,
        whereaboutsApi,
        logError
      )
      const req = { ...mockReq, query: { agencyId, date, period }, params: { reason: 'AcceptableAbsence' } }
      const res = { render: jest.fn() }

      await attendanceStatisticsOffendersList(req, res)

      expect(logError).toHaveBeenCalledWith(
        '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/',
        new Error('something is wrong'),
        'Sorry, the service is unavailable'
      )
    })
  })
})
