const controllerFactory = require('../controllers/prisonerProfile/prisonerCaseNotes')

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
    authorName: 'John Smith',
    authorUserId: 12345,
    text: 'This is some text',
    locationId: 'MDI',
    amendments: [
      {
        caseNoteAmendmentId: 123232,
        sequence: 1,
        creationDateTime: '2018-12-01T13:45:00',
        authorUserName: 'USER1',
        authorName: 'Mickey Mouse',
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
  const nunjucks = {}

  let controller
  const res = { locals: {} }
  const params = {
    offenderNo: 'A12345',
  }

  beforeEach(() => {
    caseNotesApi.getCaseNotes = jest.fn()
    caseNotesApi.getCaseNoteTypes = jest.fn()
    prisonerProfileService.getPrisonerProfileData = jest.fn()

    caseNotesApi.getCaseNoteTypes.mockReturnValue([
      {
        code: 'type1',
        description: 'Type one',
        subCodes: [{ code: 'subType1', description: 'Sub type' }],
      },
    ])
    caseNotesApi.getCaseNotes.mockReturnValue({ content: caseNotesApiResponse })

    prisonerProfileService.getPrisonerProfileData.mockReturnValue({})

    res.render = jest.fn()
    res.send = jest.fn()
    nunjucks.render = jest.fn()

    controller = controllerFactory({ caseNotesApi, prisonerProfileService, nunjucks })
  })

  it('should request case notes without filters', async () => {
    const req = { params, query: {} }
    await controller(req, res)

    expect(caseNotesApi.getCaseNotes).toHaveBeenCalledWith({}, 'A12345', {})
  })

  it('should request case notes with filters', async () => {
    const req = {
      params,
      query: {
        perPage: 100,
        pageNumber: 10,
        type: 'type1',
        subType: 'subType2',
        fromDate: '10/10/2010',
        toDate: '11/10/2020',
      },
    }
    await controller(req, res)

    expect(caseNotesApi.getCaseNotes).toHaveBeenCalledWith(
      {},
      'A12345',
      expect.objectContaining({
        endDate: '11/10/2020',
        pageNumber: 10,
        perPage: 100,
        startDate: '10/10/2010',
        subType: 'subType2',
        type: 'type1',
      })
    )
  })

  it('should handle ajax request', async () => {
    nunjucks.render.mockReturnValue('<div>test</div>')
    const req = {
      params,
      query: {
        typeCode: 'type1',
      },
      xhr: true,
    }

    await controller(req, res)

    expect(nunjucks.render).toHaveBeenCalledWith('prisonerProfile/prisonerCaseNotes/partials/subTypesSelect.njk', {
      subTypes: [
        {
          text: 'Sub type',
          type: 'type1',
          value: 'subType1',
        },
      ],
    })

    expect(res.send).toHaveBeenCalledWith('<div>test</div>')
  })

  it('should render view with offender case notes', async () => {
    nunjucks.render.mockReturnValue('<div>Test</div>')

    const req = {
      params,
      query: {
        perPage: 100,
        pageNumber: 10,
        type: 'type1',
        subType: 'subType2',
        fromDate: '10/10/2010',
        toDate: '11/10/2020',
      },
    }
    await controller(req, res)

    expect(nunjucks.render).toHaveBeenCalledWith('prisonerProfile/prisonerCaseNotes/partials/createdColumn.njk', {
      authorName: 'John Smith',
      date: '31/10/2017',
      day: 'Tuesday',
      time: '01:30',
    })

    expect(nunjucks.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerCaseNotes/partials/caseNoteDetailColumn.njk',
      {
        occurrenceDateTime: '31/10/2017 - 01:30',
        subTypeDescription: 'Key Worker Session',
        text: 'This is some text',
        typeDescription: 'Key Worker',
      }
    )

    expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerCaseNotes/caseNotes.njk', {
      caseNoteRows: [[{ html: '<div>Test</div>' }, { html: '<div>Test</div>' }]],
      caseNotesRootUrl: '/prisoner/A12345/case-notes',
      formValues: { fromDate: '10/10/2010', subType: 'subType2', toDate: '11/10/2020', type: 'type1' },
      prisonerProfileData: {},
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
