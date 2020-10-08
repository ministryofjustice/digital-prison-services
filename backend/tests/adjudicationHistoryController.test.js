const adjudicationsHistoryController = require('../controllers/prisonerProfile/adjudicationHistory')

const offenderNo = 'A12345'

const adjudicationHistoryResponse = {
  results: [
    {
      adjudicationNumber: 1,
      reportDate: '10/10/2020',
      reportTime: '15:00',
      establishment: 'MDI',
      offenceDescription: 'offence 1',
      findingDescription: 'finding 1',
    },
    {
      adjudicationNumber: 2,
      reportDate: '10/10/2020',
      reportTime: '13:00',
      establishment: 'MDI',
      offenceDescription: 'offence 2',
      findingDescription: 'finding 2',
    },
    {
      adjudicationNumber: 3,
      reportDate: '11/10/2020',
      reportTime: '16:00',
      establishment: 'MDI',
      offenceDescription: 'offence 3',
      findingDescription: 'finding 3',
    },
  ],
  agencies: [{ agencyId: 'MDI', description: 'Moorland' }],
  findingTypes: [{ code: 'F1', description: 'finding description' }],
  pagination: {
    totalRecords: 3,
    pageOffset: 0,
  },
}

describe('Adjudications history controller', () => {
  const elite2Api = {}
  const adjudicationHistoryService = {}
  const paginationService = {}
  let req
  const res = { locals: {} }
  let logError
  let controller

  beforeEach(() => {
    paginationService.getPagination = jest.fn()
    elite2Api.getDetails = jest.fn().mockResolvedValue({ firstName: 'bob', lastName: 'doe' })
    adjudicationHistoryService.getAdjudications = jest.fn().mockResolvedValue(adjudicationHistoryResponse)

    logError = jest.fn()
    res.render = jest.fn()

    controller = adjudicationsHistoryController({ adjudicationHistoryService, paginationService, elite2Api, logError })

    req = { originalUrl: 'http://localhost', params: { offenderNo }, get: () => {} }
  })

  it('should make a call to get adjudications with the correct parameters', async () => {
    req.query = {
      agencyId: 'MDI',
      fromDate: '10/10/2020',
      toDate: '15/10/2020',
      finding: 12,
    }

    await controller(req, res)

    expect(adjudicationHistoryService.getAdjudications).toHaveBeenCalledWith(
      {},
      offenderNo,
      {
        agencyId: 'MDI',
        fromDate: '2020-10-10',
        toDate: '2020-10-15',
        finding: 12,
      },
      0,
      10
    )
  })

  it('should render view with the correct data in date time desc', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/adjudicationHistory.njk',
      expect.objectContaining({
        agencies: [
          {
            text: 'Moorland',
            value: 'MDI',
          },
        ],
        prisonerNameForBreadcrumb: 'Doe, Bob',
        errors: [],
        findingTypes: [
          {
            text: 'finding description',
            value: 'F1',
          },
        ],
        prisonerName: 'Bob Doe',
        formValues: undefined,
        noRecordsFoundMessage: null,
        prisonerProfileLink: `/prisoner/${offenderNo}/`,
        rows: [
          [
            {
              html: '<a href="/prisoner/A12345/adjudications/3" class="govuk-link"> 3 </a>',
            },
            {
              text: '11/10/2020 16:00',
            },
            {
              text: 'MDI',
            },
            {
              text: 'offence 3',
            },
            {
              text: 'finding 3',
            },
          ],
          [
            {
              html: '<a href="/prisoner/A12345/adjudications/1" class="govuk-link"> 1 </a>',
            },
            {
              text: '10/10/2020 15:00',
            },
            {
              text: 'MDI',
            },
            {
              text: 'offence 1',
            },
            {
              text: 'finding 1',
            },
          ],
          [
            {
              html: '<a href="/prisoner/A12345/adjudications/2" class="govuk-link"> 2 </a>',
            },
            {
              text: '10/10/2020 13:00',
            },
            {
              text: 'MDI',
            },
            {
              text: 'offence 2',
            },
            {
              text: 'finding 2',
            },
          ],
        ],
      })
    )
  })

  it('should log the error and render the error page', async () => {
    const error = new Error('network error')

    adjudicationHistoryService.getAdjudications.mockRejectedValue(error)

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith('http://localhost', error, 'Failed to load adjudication history page')
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      homeUrl: '/prisoner/A12345',
      url: '/offenders/A12345/adjudications',
    })
  })

  it('should convert the date format into iso format before requesting adjudications', async () => {
    req.query = {
      fromDate: '10/12/2020',
      toDate: '11/12/2020',
    }

    await controller(req, res)

    expect(adjudicationHistoryService.getAdjudications).toHaveBeenCalledWith(
      {},
      offenderNo,
      {
        fromDate: '2020-12-10',
        toDate: '2020-12-11',
      },
      0,
      10
    )
  })

  it('should validate the order of the dates', async () => {
    req.query = {
      toDate: '10/12/2020',
      fromDate: '11/12/2020',
      agencyId: 'MDI',
    }

    await controller(req, res)

    expect(adjudicationHistoryService.getAdjudications).toHaveBeenCalledWith(
      {},
      offenderNo,
      {
        agencyId: 'MDI',
      },
      0,
      10
    )

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/adjudicationHistory.njk',
      expect.objectContaining({
        errors: [
          { href: '#fromDate', text: 'Enter a from date which is not after the to date' },
          { href: '#toDate', text: 'Enter a to date which is not before the from date' },
        ],
      })
    )
  })

  it('should return a no records found message for the blank date scenario', async () => {
    adjudicationHistoryService.getAdjudications = jest.fn().mockResolvedValue({
      results: [],
      agencies: [{ agencyId: 'MDI', description: 'Moorland' }],
      findingTypes: [{ code: 'F1', description: 'finding description' }],
      pagination: {
        totalRecords: 0,
        pageOffset: 0,
      },
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/adjudicationHistory.njk',
      expect.objectContaining({
        noRecordsFoundMessage: 'Bob Doe has had no adjudications',
      })
    )
  })

  it('should return a no records found message for selected dates', async () => {
    req.query = {
      toDate: '10/12/2020',
      fromDate: '11/12/2020',
      agencyId: 'MDI',
    }
    adjudicationHistoryService.getAdjudications = jest.fn().mockResolvedValue({
      results: [],
      agencies: [{ agencyId: 'MDI', description: 'Moorland' }],
      findingTypes: [{ code: 'F1', description: 'finding description' }],
      pagination: {
        totalRecords: 0,
        pageOffset: 0,
      },
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/adjudicationHistory.njk',
      expect.objectContaining({
        noRecordsFoundMessage: 'There are no adjudications for the selections you have made',
      })
    )
  })

  it('should return a no records found message for selected finding', async () => {
    req.query = {
      finding: 'PROVED',
    }
    adjudicationHistoryService.getAdjudications = jest.fn().mockResolvedValue({
      results: [],
      agencies: [{ agencyId: 'MDI', description: 'Moorland' }],
      findingTypes: [{ code: 'F1', description: 'finding description' }],
      pagination: {
        totalRecords: 0,
        pageOffset: 0,
      },
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/adjudicationHistory.njk',
      expect.objectContaining({
        noRecordsFoundMessage: 'There are no adjudications for the selections you have made',
      })
    )
  })

  it('should return a no records found message for selected agencyId', async () => {
    req.query = {
      agencyId: 'MDI',
    }
    adjudicationHistoryService.getAdjudications = jest.fn().mockResolvedValue({
      results: [],
      agencies: [{ agencyId: 'MDI', description: 'Moorland' }],
      findingTypes: [{ code: 'F1', description: 'finding description' }],
      pagination: {
        totalRecords: 0,
        pageOffset: 0,
      },
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/adjudicationHistory.njk',
      expect.objectContaining({
        noRecordsFoundMessage: 'There are no adjudications for the selections you have made',
      })
    )
  })

  it('should list the finding types alphabetically', async () => {
    adjudicationHistoryService.getAdjudications = jest.fn().mockResolvedValue({
      ...adjudicationHistoryResponse,
      findingTypes: [
        { code: 'F1', description: 'finding description' },
        { code: 'A1', description: 'a finding description' },
      ],
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/adjudicationHistory.njk',
      expect.objectContaining({
        findingTypes: [
          {
            text: 'a finding description',
            value: 'A1',
          },
          {
            text: 'finding description',
            value: 'F1',
          },
        ],
      })
    )
  })
})
