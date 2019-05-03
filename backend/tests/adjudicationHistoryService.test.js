Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const adjudicationHistory = require('../controllers/adjudicationHistoryService')(elite2Api)

beforeEach(() => {
  elite2Api.getAdjudications = jest.fn()
  elite2Api.getAdjudicationFindingTypes = jest.fn()
})

const noAdjudications = {
  agencies: [],
  results: [],
  offences: [],
}

const adjudications = {
  results: [
    {
      adjudicationNumber: 1492249,
      reportTime: '2017-02-23T10:29:00',
      agencyIncidentId: 1470044,
      agencyId: 'MDI',
      adjudicationCharges: [
        {
          oicChargeId: '1492249/1',
          offenceCode: '51:18A',
          offenceDescription:
            'Absents himself from any place he is required to be or is present at any place where he is not authorised to be - absence without permission',
          findingCode: 'GUILTY',
        },
      ],
    },
    {
      adjudicationNumber: 554213,
      reportTime: '2012-01-05T15:42:00',
      agencyIncidentId: 548434,
      agencyId: 'ONI',
      adjudicationCharges: [
        {
          oicChargeId: '554213/2',
          offenceCode: '51:1J',
          offenceDescription: 'Commits any assault - assault on prison officer',
          findingCode: 'NOT_GUILTY',
        },
        {
          oicChargeId: '554213/1',
          offenceCode: '51:25A',
          offenceDescription:
            '(a) Attempts to commit, (b) incites another inmate to commit, or (c) assists another inmate to commit or to attempt to commit, any of the foregoing offences - attempt, incite or assist 8b',
        },
      ],
    },
    {
      adjudicationNumber: 529404,
      reportTime: '2011-11-03T15:22:00',
      agencyIncidentId: 524130,
      agencyId: 'ONI',
      adjudicationCharges: [
        {
          oicChargeId: '529404/1',
          offenceCode: '51:23AS',
          offenceDescription:
            'Disobeys or fails to comply with any rule or regulation applying to him - offence against good order and discipline',
          findingCode: 'GUILTY',
        },
      ],
    },
  ],
  offences: [
    {
      id: '142',
      code: '51:23AS',
      description:
        'Disobeys or fails to comply with any rule or regulation applying to him - offence against good order and discipline',
    },
    {
      id: '92',
      code: '51:18A',
      description:
        'Absents himself from any place he is required to be or is present at any place where he is not authorised to be - absence without permission',
    },
    {
      id: '80',
      code: '51:1J',
      description: 'Commits any assault - assault on prison officer',
    },
  ],
  agencies: [
    {
      agencyId: 'MDI',
      description: 'Moorland (HMP & YOI)',
      agencyType: 'INST',
    },
    {
      agencyId: 'ONI',
      description: 'Onley (HMP)',
      agencyType: 'INST',
    },
  ],
}

const findings = [
  {
    domain: 'OIC_FINDING',
    code: 'GUILTY',
    description: 'Guilty',
  },
  {
    domain: 'OIC_FINDING',
    code: 'NOT_GUILTY',
    description: 'Not Guilty',
  },
]

const expectedResult = {
  agencies: adjudications.agencies,
  offences: adjudications.offences,
  results: [
    {
      adjudicationNumber: 1492249,
      agencyId: 'MDI',
      agencyIncidentId: 1470044,
      establishment: 'Moorland (HMP & YOI)',
      findingCode: 'GUILTY',
      findingDescription: 'Guilty',
      offenceCode: '51:18A',
      offenceDescription:
        'Absents himself from any place he is required to be or is present at any place where he is not authorised to be - absence without permission',
      oicChargeId: '1492249/1',
      reportDate: '23/02/2017',
      reportTime: '10:02',
    },
    {
      adjudicationNumber: 554213,
      agencyId: 'ONI',
      agencyIncidentId: 548434,
      establishment: 'Onley (HMP)',
      findingCode: 'NOT_GUILTY',
      findingDescription: 'Not Guilty',
      offenceCode: '51:1J',
      offenceDescription: 'Commits any assault - assault on prison officer',
      oicChargeId: '554213/2',
      reportDate: '05/01/2012',
      reportTime: '15:01',
    },
    {
      adjudicationNumber: 529404,
      agencyId: 'ONI',
      agencyIncidentId: 524130,
      establishment: 'Onley (HMP)',
      findingCode: 'GUILTY',
      findingDescription: 'Guilty',
      offenceCode: '51:23AS',
      offenceDescription:
        'Disobeys or fails to comply with any rule or regulation applying to him - offence against good order and discipline',
      oicChargeId: '529404/1',
      reportDate: '03/11/2011',
      reportTime: '15:11',
    },
  ],
}
describe('Adjudication History Service', async () => {
  it('handles no results', async () => {
    elite2Api.getAdjudications.mockReturnValue(noAdjudications)
    elite2Api.getAdjudicationFindingTypes.mockReturnValue(findings)

    const response = await adjudicationHistory.getAdjudications({}, 'OFF-1', {})
    expect(response).toEqual({ agencies: [], offences: [], results: [] })

    expect(elite2Api.getAdjudications).toHaveBeenCalled()
    expect(elite2Api.getAdjudicationFindingTypes).toHaveBeenCalled()

    expect(elite2Api.getAdjudications.mock.calls[0]).toEqual([{}, 'OFF-1', {}])
    expect(elite2Api.getAdjudicationFindingTypes.mock.calls[0]).toEqual([{}])
  })

  it('return some results', async () => {
    elite2Api.getAdjudications.mockReturnValue(adjudications)
    elite2Api.getAdjudicationFindingTypes.mockReturnValue(findings)

    const response = await adjudicationHistory.getAdjudications({}, 'OFF-1', {})
    expect(response).toEqual(expectedResult)
  })

  /* eslint no-param-reassign: "error" */
  it('pagination is only applied to adjudication retrieval requests', async () => {
    elite2Api.getAdjudications.mockImplementation(ctx => {
      ctx.adjudicationResponseHeaders = true
      return adjudications
    })

    elite2Api.getAdjudicationFindingTypes.mockImplementation(ctx => {
      ctx.findingResponseHeaders = true
      return findings
    })

    const context = { anotherAttribute: 1, requestHeaders: { pageOffset: 1, pageLimit: 20 } }

    const response = await adjudicationHistory.getAdjudications(context, 'OFF-1', {})

    expect(response).toEqual(expectedResult)

    // Pagination Headers from request are passed through to the get adjudication call
    expect(elite2Api.getAdjudications.mock.calls[0]).toEqual([
      {
        anotherAttribute: 1,
        requestHeaders: { pageOffset: 1, pageLimit: 20 },
        adjudicationResponseHeaders: true,
      },
      'OFF-1',
      {},
    ])

    // Pagination Headers from request are not passed through to the get findings call
    expect(elite2Api.getAdjudicationFindingTypes.mock.calls[0]).toEqual([
      {
        anotherAttribute: 1,
        findingResponseHeaders: true,
      },
    ])

    // Pagination Headers from get adjudciations response would be set on the context for setting on the response to the frontend.
    expect(context).toEqual({
      anotherAttribute: 1,
      adjudicationResponseHeaders: true,
      requestHeaders: { pageOffset: 1, pageLimit: 20 },
    })
  })
})
