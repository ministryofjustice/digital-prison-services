import moment from 'moment'
import { attendanceStatisticsFactory } from '../controllers/attendance/attendanceStatistics'

const mockDateToSunday012017 = () => jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000) // Sunday 2017-01-01T00:00:00.000Z

describe('Attendance reason statistics', () => {
  const context = {}
  const oauthApi = {
    userRoles: jest.fn(),
  }
  const hmppsManageUsersApi = {
    currentUser: jest.fn(),
  }
  const prisonApi = {
    userCaseLoads: jest.fn(),
    getOffenderSuspendedActivitiesOverDateRange: jest.fn(),
  }
  const whereaboutsApi = {
    getAttendanceStats: jest.fn(),
    getAbsences: jest.fn(),
    getAttendanceForBookingsOverDateRange: jest.fn(),
    getAttendanceChanges: jest.fn(),
  }
  const agencyId = 'LEI'
  const date = '10/10/2019'
  const fromDate = '10/10/2019'
  const toDate = '11/10/2019'
  const period = 'AM'
  const stats = {
    notRecorded: 0,
    paidReasons: {
      attended: 2,
      approvedCourse: 0,
      notRequired: 0,
      acceptableAbsence: 0,
      acceptableAbsenceDescription: 'Acceptable absence',
      approvedCourseDescription: 'Approved course',
      notRequiredDescription: 'Not required to attend',
    },
    scheduleActivities: 0,
    unpaidReasons: {
      restDay: 0,
      restInCellOrSick: 0,
      refused: 0,
      refusedIncentiveLevelWarning: 0,
      sessionCancelled: 0,
      unacceptableAbsence: 0,
      unacceptableAbsenceIncentiveLevelWarning: 0,
      refusedDescription: 'Refused to attend',
      refusedIncentiveLevelWarningDescription: 'Refused to attend with warning',
      sessionCancelledDescription: 'Session cancelled',
      unacceptableAbsenceDescription: 'Unacceptable absence',
      unacceptableAbsenceIncentiveLevelWarningDescription: 'Unacceptable absence with warning',
      restDayDescription: 'Rest day',
      restInCellOrSickDescription: 'Rest in cell or sick',
    },
    suspended: 0,
    attended: 1,
  }

  beforeEach(() => {
    hmppsManageUsersApi.currentUser = jest.fn()
    prisonApi.userCaseLoads = jest.fn()
    prisonApi.getOffenderSuspendedActivitiesOverDateRange = jest.fn()
    oauthApi.userRoles = jest.fn()
    whereaboutsApi.getAttendanceStats = jest.fn()
    whereaboutsApi.getAbsences = jest.fn()
    whereaboutsApi.getAttendanceForBookingsOverDateRange = jest.fn()
    whereaboutsApi.getAttendanceChanges = jest.fn()

    whereaboutsApi.getAttendanceChanges.mockReturnValue({ changes: [] })

    prisonApi.userCaseLoads.mockReturnValue([{ caseLoadId: 'LEI', description: 'Leeds (HMP)', currentlyActive: true }])
    prisonApi.getOffenderSuspendedActivitiesOverDateRange.mockReturnValue([])
    hmppsManageUsersApi.currentUser.mockReturnValue({
      username: 'USER_ADM',
      active: true,
      name: 'User Name',
      activeCaseLoadId: 'LEI',
    })

    whereaboutsApi.getAttendanceForBookingsOverDateRange.mockReturnValue({ attendances: [] })
  })

  const spy = jest.spyOn(Date, 'now')
  afterEach(() => {
    if (spy) spy.mockRestore()
  })

  describe('Dashboard Controller', () => {
    const mockReq = { originalUrl: '/manage-prisoner-whereabouts/attendance-reason-statistics' }

    it('should redirect to /manage-prisoner-whereabouts/attendance-reason-statistics with default parameters when none was present', async () => {
      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

      mockDateToSunday012017()

      prisonApi.userCaseLoads.mockReturnValue([
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

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

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
      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

      const tomorrow = moment().add(1, 'days').format('DD/MM/YYYY')

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

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

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

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

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

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

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
      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

      const today = moment().format('DD/MM/YYYY')
      const threeWeeksAgo = moment().subtract(3, 'weeks').format('DD/MM/YYYY')

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
      whereaboutsApi.getAttendanceStats.mockReturnValue({ paidReasons: {} })
      oauthApi.userRoles.mockReturnValue({})

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )
      const res = { render: jest.fn(), locals: context, status: jest.fn() }
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

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )
      const req = { query: { agencyId, fromDate, toDate, period: 'AM_PM' } }
      const res = { render: jest.fn(), locals: context, status: jest.fn() }

      await attendanceStatistics(req, res)

      expect(whereaboutsApi.getAttendanceStats).toHaveBeenCalledWith(context, {
        agencyId: 'LEI',
        fromDate: '2019-10-10',
        period: '',
        toDate: '2019-10-11',
      })
    })

    it('should call whereabouts attendance changes api with the correct parameters for AM+PM', async () => {
      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )
      const req = { query: { agencyId, fromDate, toDate, period: 'AM_PM' } }
      const res = { render: jest.fn(), locals: context, status: jest.fn() }

      await attendanceStatistics(req, res)

      expect(whereaboutsApi.getAttendanceChanges).toHaveBeenCalledWith(
        {},
        { fromDateTime: '2019-10-10T00:00', toDateTime: '2019-10-11T23:59' },
        'LEI'
      )
    })

    it('should call whereabouts attendance changes api with the correct parameters for AM', async () => {
      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )
      const req = { query: { agencyId, fromDate, toDate, period: 'AM' } }
      const res = { render: jest.fn(), locals: context, status: jest.fn() }

      await attendanceStatistics(req, res)

      expect(whereaboutsApi.getAttendanceChanges).toHaveBeenCalledWith(
        {},
        { fromDateTime: '2019-10-10T00:00', toDateTime: '2019-10-11T11:59' },
        'LEI'
      )
    })

    it('should call whereabouts attendance changes api with the correct parameters for PM', async () => {
      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )
      const req = { query: { agencyId, fromDate, toDate, period: 'PM' } }
      const res = { render: jest.fn(), locals: context, status: jest.fn() }

      await attendanceStatistics(req, res)

      expect(whereaboutsApi.getAttendanceChanges).toHaveBeenCalledWith(
        {},
        { fromDateTime: '2019-10-10T12:00', toDateTime: '2019-10-11T16:59' },
        'LEI'
      )
    })

    it('should remove the leading zeros from display date', async () => {
      whereaboutsApi.getAttendanceStats.mockReturnValue(stats)

      mockDateToSunday012017()

      const now = moment().format('DD/MM/YYYY')
      const nowPlus1 = moment().add(1, 'day').format('DD/MM/YYYY')

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )
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
      whereaboutsApi.getAttendanceChanges.mockReturnValue({ changes: [{ prisonId: 'LEI' }] })

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )
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
          changeClickThrough: {
            fromDateTime: '2019-10-10T00:00',
            subHeading: '10 October 2019  to 11 October 2019  - AM and PM',
            toDateTime: '2019-10-11T23:59',
          },
          dashboardStats: {
            notRecorded: 0,
            attended: 1,
            paidReasons: [
              { id: 'ApprovedCourse', name: 'Approved course', value: 0 },
              { id: 'NotRequired', name: 'Not required to attend', value: 0 },
              { id: 'AcceptableAbsence', name: 'Acceptable absence', value: 0 },
            ],
            scheduleActivities: 0,
            unpaidReasons: [
              { id: 'RestDay', name: 'Rest day', value: 0 },
              { id: 'RestInCellOrSick', name: 'Rest in cell or sick', value: 0 },
              { id: 'Refused', name: 'Refused to attend', value: 0 },
              { id: 'RefusedIncentiveLevelWarning', name: 'Refused to attend with warning', value: 0 },
              { id: 'SessionCancelled', name: 'Session cancelled', value: 0 },
              { id: 'UnacceptableAbsence', name: 'Unacceptable absence', value: 0 },
              { id: 'UnacceptableAbsenceIncentiveLevelWarning', name: 'Unacceptable absence with warning', value: 0 },
            ],
            suspended: 0,
            changes: 1,
          },
          shouldClearFormValues: true,
          toDate: '11/10/2019',
          displayDate: '10 October 2019 to 11 October 2019',
          displayPeriod: 'AM and PM',
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

    it('should log the correct error', async () => {
      const error = new Error('something is wrong')
      whereaboutsApi.getAttendanceStats.mockRejectedValue(error)

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

      const req = { ...mockReq, query: { agencyId, fromDate, period } }
      const res = { render: jest.fn(), status: jest.fn() }

      await expect(attendanceStatistics(req, res)).rejects.toThrowError(error)
    })

    it('should clear the date and period from a from and to date have been passed', async () => {
      whereaboutsApi.getAttendanceStats.mockReturnValue(stats)

      const { attendanceStatistics } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )
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
            reason: 'AcceptableAbsence',
            comments: 'Asked nicely.',
            suspended: true,
          },
        ],
        description: 'Unacceptable absence with warning',
      })

      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

      const req = {
        query: { agencyId, fromDate, toDate, period },
        params: { reason: 'UnacceptableAbsenceIncentiveLevelWarning' },
      }
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
        title: 'Unacceptable absence with warning',
        reason: 'Unacceptable absence with warning',
        displayDate: '10 October 2019 to 11 October 2019',
        displayPeriod: 'AM',
        offenders: [
          [
            {
              html: '<a href=/prisoner/G8974UK class="govuk-link" target="_blank" rel="noopener noreferrer">Smith, Adam</a>',
            },
            { text: 'G8974UK' },
            { text: '1' },
            { html: '<span class="suspended">Suspended</span>' },
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
        totalOffenders: 1,
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
            reason: 'AcceptableAbsence',
            subReason: 'Courses',
            subReasonDescription: 'Courses, programmes and interventions',
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
        description: 'Acceptable absence',
      })

      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
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
        displayPeriod: 'AM and PM',
        offenders: [
          [
            { html: 'Smith, Adam' },
            { text: 'G8974UK' },
            { text: '--' },
            { html: '' },
            { text: 'Cleaner' },
            { text: 'Courses, programmes and interventions: Asked nicely.' },
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
        totalOffenders: 1,
      })
    })

    it('should log the correct error', async () => {
      const error = new Error('something is wrong')

      hmppsManageUsersApi.currentUser.mockRejectedValueOnce(error)

      const { attendanceStatisticsOffendersList } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )
      const req = { ...mockReq, query: { agencyId, date, period }, params: { reason: 'AcceptableAbsence' } }
      const res = { render: jest.fn(), status: jest.fn(), locals: { redirectUrl: jest.fn() } }

      await expect(attendanceStatisticsOffendersList(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe(
        '/manage-prisoner-whereabouts/attendance-reason-statistics/reason/AcceptableAbsence'
      )
    })
  })

  describe('Suspended Controller', () => {
    beforeEach(() => {
      prisonApi.getOffenderSuspendedActivitiesOverDateRange.mockReturnValueOnce([
        {
          bookingId: 1133341,
          offenderNo: 'G8974UK',
          eventId: 3,
          cellLocation: 'LEI-1',
          startTime: '2019-10-10T10:00:00',
          timeSlot: 'AM',
          firstName: 'Adam',
          lastName: 'Smith',
          comment: 'Cleaner',
          suspended: true,
        },
        {
          bookingId: 1133342,
          offenderNo: 'G8975UK',
          eventId: 4,
          cellLocation: 'LEI-2',
          startTime: '2019-10-10T11:00:00',
          timeSlot: 'AM',
          firstName: 'Offender',
          lastName: 'Two',
          comment: 'Cleaner',
          suspended: true,
        },
        {
          bookingId: 1133343,
          offenderNo: 'G8976UK',
          eventId: 5,
          cellLocation: 'LEI-3',
          startTime: '2019-10-10T09:00:00',
          timeSlot: 'AM',
          firstName: 'Offender',
          lastName: 'Three',
          comment: 'Cleaner',
          suspended: true,
        },
      ])
      prisonApi.getOffenderSuspendedActivitiesOverDateRange.mockReturnValueOnce([
        {
          bookingId: 1133344,
          offenderNo: 'G8976UK',
          eventId: 6,
          cellLocation: 'LEI-3',
          startTime: '2019-10-10T14:00:00',
          timeSlot: 'PM',
          firstName: 'Offender',
          lastName: 'Four',
          comment: 'Cleaner',
          suspended: true,
        },
        {
          bookingId: 1133345,
          offenderNo: 'G8976UK',
          eventId: 7,
          cellLocation: 'LEI-3',
          startTime: '2019-10-10T16:00:00',
          timeSlot: 'PM',
          firstName: 'Offender',
          lastName: 'Five',
          comment: 'Cleaner',
          suspended: true,
        },
      ])
      whereaboutsApi.getAttendanceForBookingsOverDateRange.mockReturnValue({
        attendances: [
          {
            eventId: 3,
            bookingId: 1133341,
            eventDate: '2019-10-10',
            attended: false,
            paid: true,
            absentReason: 'AcceptableAbsence',
            comments: 'Asked nicely.',
          },
          {
            eventId: 4,
            bookingId: 1133342,
            eventDate: '2019-10-10',
            attended: false,
            paid: false,
            absentReason: 'Refused',
            comments: 'Did not ask nicely',
          },
          {
            eventId: 5,
            bookingId: 1133343,
            eventDate: '2019-10-10',
            attended: true,
            paid: true,
            absentReason: undefined,
            comments: '',
          },
          {
            eventId: 6,
            bookingId: 1133344,
            eventDate: '2019-10-10',
            attended: false,
            paid: true,
            absentReason: 'AcceptableAbsence',
            comments: 'Asked nicely.',
          },
          {
            eventId: 7,
            bookingId: 1133345,
            eventDate: '2019-10-10',
            attended: false,
            paid: false,
            absentReason: 'Refused',
            comments: 'Did not ask nicely',
          },
          {
            eventId: 8,
            bookingId: 1133346,
            eventDate: '2019-10-10',
            attended: true,
            paid: true,
            absentReason: undefined,
            comments: '',
          },
        ],
      })
    })

    it('should call the right APIs with the right data', async () => {
      const req = { query: { agencyId, fromDate, toDate, period } }
      const res = { locals: {}, render: jest.fn() }

      const { attendanceStatisticsSuspendedList } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

      await attendanceStatisticsSuspendedList(req, res)

      expect(prisonApi.getOffenderSuspendedActivitiesOverDateRange).toHaveBeenCalledWith(res.locals, {
        agencyId,
        fromDate: '2019-10-10',
        toDate: '2019-10-11',
        period,
      })
      expect(whereaboutsApi.getAttendanceForBookingsOverDateRange).toHaveBeenCalledWith(res.locals, {
        agencyId,
        period,
        bookings: [1133341, 1133342, 1133343],
        fromDate: '2019-10-10',
        toDate: '2019-10-11',
      })
    })

    it('should render the list of offenders who are suspended on the given date and period', async () => {
      const { attendanceStatisticsSuspendedList } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

      const req = { query: { agencyId, fromDate, toDate, period } }
      const res = { render: jest.fn() }

      await attendanceStatisticsSuspendedList(req, res)

      expect(res.render).toHaveBeenCalledWith('attendanceStatisticsSuspendedList.njk', {
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
        title: 'Suspended',
        displayDate: '10 October 2019 to 11 October 2019',
        displayPeriod: 'AM',
        offendersData: [
          [
            {
              html: '<a href="/prisoner/G8974UK" class="govuk-link">Smith, Adam</a>',
              attributes: {
                'data-sort-value': 'Smith',
              },
            },
            { text: 'G8974UK' },
            { text: 'LEI-1' },
            { text: 'Cleaner' },
            { text: 'Yes - acceptable absence' },
          ],
          [
            {
              html: '<a href="/prisoner/G8975UK" class="govuk-link">Two, Offender</a>',
              attributes: {
                'data-sort-value': 'Two',
              },
            },
            { text: 'G8975UK' },
            { text: 'LEI-2' },
            { text: 'Cleaner' },
            { text: 'No - refused' },
          ],
          [
            {
              html: '<a href="/prisoner/G8976UK" class="govuk-link">Three, Offender</a>',
              attributes: {
                'data-sort-value': 'Three',
              },
            },
            { text: 'G8976UK' },
            { text: 'LEI-3' },
            { text: 'Cleaner' },
            { text: 'Yes' },
          ],
        ],

        totalRecords: 3,
        totalOffenders: 3,
        userRoles: undefined,
      })
    })
    it('should recieve the correct number of suspended activites for the chosen AM_PM period, not including ED', async () => {
      const req = { query: { agencyId, fromDate, toDate, period: 'AM_PM' } }
      const res = { locals: {}, render: jest.fn() }

      const { attendanceStatisticsSuspendedList } = attendanceStatisticsFactory(
        oauthApi,
        hmppsManageUsersApi,
        prisonApi,
        whereaboutsApi
      )

      await attendanceStatisticsSuspendedList(req, res)

      expect(prisonApi.getOffenderSuspendedActivitiesOverDateRange).toHaveBeenCalledWith(res.locals, {
        agencyId,
        fromDate: '2019-10-10',
        toDate: '2019-10-11',
        period: 'AM',
      })
      expect(prisonApi.getOffenderSuspendedActivitiesOverDateRange).toHaveBeenCalledWith(res.locals, {
        agencyId,
        fromDate: '2019-10-10',
        toDate: '2019-10-11',
        period: 'PM',
      })
      expect(prisonApi.getOffenderSuspendedActivitiesOverDateRange).toHaveBeenCalledTimes(2)
      expect(res.render).toHaveBeenCalledWith('attendanceStatisticsSuspendedList.njk', {
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
          '/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=LEI&period=AM_PM&fromDate=10/10/2019&toDate=11/10/2019',
        caseLoadId: 'LEI',
        title: 'Suspended',
        displayDate: '10 October 2019 to 11 October 2019',
        displayPeriod: 'AM and PM',
        offendersData: [
          [
            {
              html: '<a href="/prisoner/G8974UK" class="govuk-link">Smith, Adam</a>',
              attributes: {
                'data-sort-value': 'Smith',
              },
            },
            { text: 'G8974UK' },
            { text: 'LEI-1' },
            { text: 'Cleaner' },
            { text: 'Yes - acceptable absence' },
          ],
          [
            {
              html: '<a href="/prisoner/G8975UK" class="govuk-link">Two, Offender</a>',
              attributes: {
                'data-sort-value': 'Two',
              },
            },
            { text: 'G8975UK' },
            { text: 'LEI-2' },
            { text: 'Cleaner' },
            { text: 'No - refused' },
          ],
          [
            {
              html: '<a href="/prisoner/G8976UK" class="govuk-link">Three, Offender</a>',
              attributes: {
                'data-sort-value': 'Three',
              },
            },
            { text: 'G8976UK' },
            { text: 'LEI-3' },
            { text: 'Cleaner' },
            { text: 'Yes' },
          ],
          [
            {
              attributes: {
                'data-sort-value': 'Four',
              },
              html: '<a href="/prisoner/G8976UK" class="govuk-link">Four, Offender</a>',
            },
            { text: 'G8976UK' },
            { text: 'LEI-3' },
            { text: 'Cleaner' },
            { text: 'Yes - acceptable absence' },
          ],
          [
            {
              attributes: {
                'data-sort-value': 'Five',
              },
              html: '<a href="/prisoner/G8976UK" class="govuk-link">Five, Offender</a>',
            },
            { text: 'G8976UK' },
            { text: 'LEI-3' },
            { text: 'Cleaner' },
            { text: 'No - refused' },
          ],
        ],

        totalRecords: 5,
        totalOffenders: 5,
        userRoles: undefined,
      })
    })
  })
})
