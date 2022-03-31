import attendanceChangeRouter from '../routes/attendanceChangesRouter'

describe('Attendance change router', () => {
  const prisonApi = {}
  const whereaboutsApi = {}
  const oauthApi = {}
  const res = {
    locals: {},
  }

  let req
  let router
  let logError

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceChanges' does not exist on ... Remove this comment to see the full error message
    whereaboutsApi.getAttendanceChanges = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getScheduledActivities' does not exist o... Remove this comment to see the full error message
    prisonApi.getScheduledActivities = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userDetails' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getUserDetailsList = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceChanges' does not exist on ... Remove this comment to see the full error message
    whereaboutsApi.getAttendanceChanges.mockReturnValue({ changes: [] })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getScheduledActivities' does not exist o... Remove this comment to see the full error message
    prisonApi.getScheduledActivities.mockReturnValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userDetails' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getUserDetailsList.mockReturnValue([
      {
        username: 'username1',
        firstName: 'First name',
        lastName: 'Last name',
      },
    ])

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; whereaboutsApi:... Remove this comment to see the full error message
    router = attendanceChangeRouter({ prisonApi, whereaboutsApi, oauthApi, logError })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
    res.redirect = jest.fn()

    req = {
      originalUrl: 'http://localhost',
      query: {
        agencyId: 'MDI',
        fromDateTime: '2020-10-03T00:00',
        toDateTime: '2020-10-03T12:00',
        subHeading: '3 November 2020 - AM + PM',
      },
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    res.status = jest.fn()
  })

  it('should request changes for a given date time range', async () => {
    await router(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceChanges' does not exist on ... Remove this comment to see the full error message
    expect(whereaboutsApi.getAttendanceChanges).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        fromDateTime: '2020-10-03T00:00',
        toDateTime: '2020-10-03T12:00',
      })
    )
  })

  it('should make a request for scheduled activity that has been changed', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceChanges' does not exist on ... Remove this comment to see the full error message
    whereaboutsApi.getAttendanceChanges.mockReturnValue({
      changes: [{ eventId: 1 }, { eventId: 1 }, { eventId: 2 }],
    })

    await router(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getScheduledActivities' does not exist o... Remove this comment to see the full error message
    expect(prisonApi.getScheduledActivities).toHaveBeenCalledWith({}, { agencyId: 'MDI', eventIds: [1, 2] })
  })

  it('should make a request to get user details', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceChanges' does not exist on ... Remove this comment to see the full error message
    whereaboutsApi.getAttendanceChanges.mockReturnValue({
      changes: [
        { eventId: 1, changedBy: 'username1', prisonId: 'MDI' },
        { eventId: 2, changedBy: 'username2', prisonId: 'MDI' },
        { eventId: 3, changedBy: 'username2', prisonId: 'MDI' },
      ],
    })

    await router(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userDetails' does not exist on type '{}'... Remove this comment to see the full error message
    expect(prisonApi.getUserDetailsList).toHaveBeenCalledWith({}, ['username1', 'username2'])
  })

  it('should return table rows in the right order and format', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceChanges' does not exist on ... Remove this comment to see the full error message
    whereaboutsApi.getAttendanceChanges.mockReturnValue({
      changes: [
        {
          eventId: 1,
          changedBy: 'username',
          changedFrom: 'Refused',
          changedTo: 'Attended',
          changedOn: '2020-10-02T17:00',
          prisonId: 'MDI',
        },
        {
          eventId: 2,
          changedBy: 'username',
          changedFrom: 'AcceptableAbsence',
          changedTo: 'Refused',
          changedOn: '2020-10-02T11:00',
          prisonId: 'MDI',
        },
      ],
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getScheduledActivities' does not exist o... Remove this comment to see the full error message
    prisonApi.getScheduledActivities.mockReturnValue([
      { eventId: 1, firstName: 'first name 1', lastName: 'last name', comment: 'Wood work', offenderNo: 'A123456' },
      { eventId: 2, firstName: 'first name 2', lastName: 'last name', comment: 'Kitchen', offenderNo: 'A23457' },
    ])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userDetails' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getUserDetailsList.mockReturnValue([
      {
        firstName: 'Peter',
        lastName: 'Parker',
        username: 'username',
      },
    ])

    await router(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith(
      'attendanceChanges.njk',
      expect.objectContaining({
        subHeading: '3 November 2020 - AM + PM',
        attendanceChanges: [
          [
            {
              attributes: { 'data-sort-value': 'last name' },
              html: '<a href="/prisoner/A23457" class="govuk-link">Last name, First name 2</a>',
            },
            { text: 'A23457' },
            { text: 'Kitchen' },
            { text: 'Acceptable absence' },
            { text: 'Refused' },
            { attributes: { 'data-sort-value': expect.any(Number) }, text: '2 October 2020 - 11:00' },
            { text: 'Peter Parker' },
          ],
          [
            {
              attributes: { 'data-sort-value': 'last name' },
              html: '<a href="/prisoner/A123456" class="govuk-link">Last name, First name 1</a>',
            },
            { text: 'A123456' },
            { text: 'Wood work' },
            { text: 'Refused' },
            { text: 'Attended' },
            { attributes: { 'data-sort-value': expect.any(Number) }, text: '2 October 2020 - 17:00' },
            { text: 'Peter Parker' },
          ],
        ],
      })
    )
  })

  it('should redirect back to the attendance dashboard when any query parameters are missing', async () => {
    req.query = {}
    await router(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
    expect(res.redirect).toHaveBeenCalledWith('/manage-prisoner-whereabouts/attendance-reason-statistics')
  })

  it('should render page when there are no changes', async () => {
    await router(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
    expect(res.redirect).toHaveBeenCalledTimes(0)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith(
      'attendanceChanges.njk',
      expect.objectContaining({
        attendanceChanges: [],
        subHeading: '3 November 2020 - AM + PM',
      })
    )
  })

  it('should only show changes from the requested agency', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceChanges' does not exist on ... Remove this comment to see the full error message
    whereaboutsApi.getAttendanceChanges.mockReturnValue({
      changes: [
        {
          eventId: 1,
          prisonId: 'LEI',
          changedBy: 'username',
          changedFrom: 'Refused',
          changedTo: 'Attended',
          changedOn: '2020-10-02T17:00',
        },
        {
          eventId: 2,
          prisonId: 'MDI',
          changedBy: 'username',
          changedFrom: 'AcceptableAbsence',
          changedTo: 'Refused',
          changedOn: '2020-10-02T11:00',
        },
      ],
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getScheduledActivities' does not exist o... Remove this comment to see the full error message
    prisonApi.getScheduledActivities.mockReturnValue([
      { eventId: 1, firstName: 'first name 1', lastName: 'last name', comment: 'Wood work', offenderNo: 'A123456' },
      { eventId: 2, firstName: 'first name 2', lastName: 'last name', comment: 'Kitchen', offenderNo: 'A23457' },
    ])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userDetails' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getUserDetailsList.mockReturnValue([{ firstName: 'Steve', lastName: 'Walsh', username: 'username' }])

    await router(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith(
      'attendanceChanges.njk',
      expect.objectContaining({
        subHeading: '3 November 2020 - AM + PM',
        attendanceChanges: [
          [
            {
              attributes: { 'data-sort-value': 'last name' },
              html: '<a href="/prisoner/A23457" class="govuk-link">Last name, First name 2</a>',
            },
            { text: 'A23457' },
            { text: 'Kitchen' },
            { text: 'Acceptable absence' },
            { text: 'Refused' },
            { attributes: { 'data-sort-value': expect.any(Number) }, text: '2 October 2020 - 11:00' },
            { text: 'Steve Walsh' },
          ],
        ],
      })
    )
  })
})
