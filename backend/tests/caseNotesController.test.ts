import controllerFactory from '../controllers/prisonerProfile/prisonerCaseNotes'

const caseNotesApiResponse = [
  {
    caseNoteId: 12311312,
    offenderIdentifier: 'A1234AA',
    type: 'KA',
    typeDescription: 'Key Worker',
    subType: 'KS',
    subTypeDescription: 'Key Worker Session',
    source: 'INST',
    creationDateTime: '2017-10-31T01:30:00',
    occurrenceDateTime: '2017-10-31T01:30:00',
    authorName: 'Smith, John',
    authorUserId: 12345,
    text: 'This is some text',
    locationId: 'MDI',
    amendments: [
      {
        caseNoteAmendmentId: 123232,
        sequence: 1,
        creationDateTime: '2018-12-01T13:45:00',
        authorUserName: 'USER1',
        authorName: 'Mouse, Mickey',
        additionalNoteText: 'Some Additional Text',
        authorUserId: 12345,
      },
    ],
    eventId: -23,
  },
]

describe('Case notes controller', () => {
  const caseNotesApi = {}
  const prisonerProfileService = {}
  const paginationService = {}
  const nunjucks = {}
  const oauthApi = {}
  const systemOauthClient = {}
  const restrictedPatientApi = {}

  let controller
  let logError
  const res = {
    locals: {
      user: { activeCaseLoad: { caseLoadId: 'MDI' } },
    },
  }

  const reqDefault = {
    originalUrl: 'http://localhost',
    params: { offenderNo: 'A12345' },
    session: {
      userDetails: {
        username: 'user1',
      },
    },
    get: () => {},
    query: { pageOffsetOption: '0' },
  }

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.userRoles = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNotes' does not exist on type '{}... Remove this comment to see the full error message
    caseNotesApi.getCaseNotes = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNoteTypes' does not exist on type... Remove this comment to see the full error message
    caseNotesApi.getCaseNoteTypes = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    prisonerProfileService.getPrisonerProfileData = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPagination' does not exist on type '{... Remove this comment to see the full error message
    paginationService.getPagination = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPagination' does not exist on type '{... Remove this comment to see the full error message
    paginationService.getPagination.mockReturnValue({})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNoteTypes' does not exist on type... Remove this comment to see the full error message
    caseNotesApi.getCaseNoteTypes.mockReturnValue([
      {
        code: 'type1',
        description: 'Type one',
        subCodes: [{ code: 'subType1', description: 'Sub type' }],
      },
    ])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNotes' does not exist on type '{}... Remove this comment to see the full error message
    caseNotesApi.getCaseNotes.mockReturnValue({ content: caseNotesApiResponse })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    prisonerProfileService.getPrisonerProfileData.mockReturnValue({})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
    res.redirect = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'send' does not exist on type '{ locals: ... Remove this comment to see the full error message
    res.send = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    res.status = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    nunjucks.render = jest.fn()
    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles = jest.fn().mockResolvedValue([{ roleCode: 'INACTIVE_BOOKINGS' }])

    controller = controllerFactory({
      caseNotesApi,
      prisonerProfileService,
      nunjucks,
      paginationService,
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ caseNotesApi: {}; prisonerProf... Remove this comment to see the full error message
      logError,
      oauthApi,
      systemOauthClient,
      restrictedPatientApi,
    })
  })

  it('should request case notes without filters', async () => {
    await controller(reqDefault, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNotes' does not exist on type '{}... Remove this comment to see the full error message
    expect(caseNotesApi.getCaseNotes).toHaveBeenCalledWith(res.locals, 'A12345', {
      endDate: undefined,
      pageNumber: 0,
      perPage: 20,
      startDate: undefined,
      subType: undefined,
      type: undefined,
    })
  })

  it('should request case notes with filters', async () => {
    const req = {
      ...reqDefault,
      query: {
        pageOffsetOption: 10,
        type: 'type1',
        subType: 'subType2',
        fromDate: '10/10/2010',
        toDate: '11/10/2020',
      },
    }
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNotes' does not exist on type '{}... Remove this comment to see the full error message
    expect(caseNotesApi.getCaseNotes).toHaveBeenCalledWith(
      res.locals,
      'A12345',
      expect.objectContaining({
        endDate: '11/10/2020',
        pageNumber: 0,
        perPage: 20,
        startDate: '10/10/2010',
        subType: 'subType2',
        type: 'type1',
      })
    )
  })

  it('should handle ajax request', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    nunjucks.render.mockReturnValue('<div>test</div>')
    const req = {
      ...reqDefault,
      query: {
        typeCode: 'type1',
      },
      xhr: true,
    }

    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    expect(nunjucks.render).toHaveBeenCalledWith('prisonerProfile/prisonerCaseNotes/partials/subTypesSelect.njk', {
      subTypes: [
        {
          text: 'Sub type',
          type: 'type1',
          value: 'subType1',
        },
      ],
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'send' does not exist on type '{ locals: ... Remove this comment to see the full error message
    expect(res.send).toHaveBeenCalledWith('<div>test</div>')
  })

  it('should render view with offender case notes', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    nunjucks.render.mockReturnValue('<div>Test</div>')

    const req = {
      ...reqDefault,
      query: {
        pageOffsetOption: '0',
        type: 'type1',
        subType: 'subType2',
        fromDate: '10/10/2010',
        toDate: '11/10/2020',
      },
    }
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerCaseNotes/caseNotes.njk', {
      viewAllCaseNotesUrl:
        '/prisoner/A12345/case-notes?showAll=true&pageOffsetOption=0&type=type1&subType=subType2&fromDate=10%2F10%2F2010&toDate=11%2F10%2F2020',
      caseNoteViewData: [
        {
          caseNoteDetailColumn: {
            amendLink: undefined,
            amendments: [
              {
                authorName: 'Mickey Mouse',
                date: '1 December 2018',
                day: 'Saturday',
                deleteLink: false,
                text: 'Some Additional Text',
                time: '13:45',
              },
            ],
            deleteLink: false,
            occurrenceDateTime: 'Tuesday 31 October 2017 - 01:30',
            printIncentiveLink: false,
            subTypeDescription: 'Key Worker Session',
            text: 'This is some text',
            typeDescription: 'Key Worker',
          },
          createdByColumn: {
            authorName: 'John Smith',
            date: '31 October 2017',
            day: 'Tuesday',
            time: '01:30',
          },
        },
      ],
      caseNotesRootUrl: '/prisoner/A12345/case-notes',
      formValues: {
        fromDate: '10/10/2010',
        subType: 'subType2',
        toDate: '11/10/2020',
        type: 'type1',
      },
      pagination: {},
      prisonerProfileData: {},
      showAll: undefined,
      subTypes: [
        {
          text: 'Sub type',
          type: 'type1',
          value: 'subType1',
        },
      ],
      types: [
        {
          text: 'Type one',
          value: 'type1',
        },
      ],
    })
  })
})
