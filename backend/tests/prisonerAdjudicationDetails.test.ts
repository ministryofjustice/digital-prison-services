import prisonerAdjudicationDetails from '../controllers/prisonerProfile/prisonerAdjudicationDetails'

describe('Prisoner adjudication details', () => {
  const offenderNo = 'ABC123'
  const adjudicationNumber = '123'
  const prisonApi = {}
  const adjudicationsApi = {}
  const systemOauthClient = {
    getClientCredentialsTokens: () => {},
  }
  const offenderSearchApi = {
    getPrisonerSearchDetails: jest
      .fn()
      .mockResolvedValue({ hospital: 'MDI', isRestrictedPatient: false, indeterminateSentence: false }),
  }
  let req
  let res
  const oauthApi = jest.fn()
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo, adjudicationNumber },
      session: {
        userDetails: { username: 'BSMITH', activeCaseLoadId: 'MDI', name: 'Bob Smith' },
      },
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'John', lastName: 'Smith ' })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationDetails' does not exist o... Remove this comment to see the full error message
    adjudicationsApi.getAdjudicationDetails = jest.fn().mockResolvedValue({})
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({})

    controller = prisonerAdjudicationDetails({
      prisonApi,
      systemOauthClient,
      adjudicationsApi,
      offenderSearchApi,
      oauthApi,
    })
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationDetails' does not exist o... Remove this comment to see the full error message
    expect(adjudicationsApi.getAdjudicationDetails).toHaveBeenCalledWith(res.locals, offenderNo, adjudicationNumber)
  })

  it('should render the template with the correctly formatted data', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAdjudicationDetails' does not exist o... Remove this comment to see the full error message
    adjudicationsApi.getAdjudicationDetails.mockResolvedValue({
      adjudicationNumber: 123,
      incidentTime: '2016-10-19T10:00:00',
      establishment: 'Moorland (HMP & YOI)',
      interiorLocation: 'Health Care',
      incidentDetails: 'Something happened',
      reportNumber: 1392002,
      reportType: "Governor's Report",
      reporterFirstName: 'DUDFSANAYE',
      reporterLastName: 'FLORENZO',
      reportTime: '2016-10-19T10:57:00',
      hearings: [
        {
          oicHearingId: 1,
          hearingType: "Governor's Hearing Adult",
          hearingTime: '2016-10-21T10:00:00',
          heardByFirstName: 'John',
          heardByLastName: 'Smith',
          establishment: 'Moorland (HMP & YOI)',
          location: 'Adj',
          results: [
            {
              oicOffenceCode: '51:16',
              offenceType: 'Prison Rule 51',
              offenceDescription:
                'Intentionally or recklessly sets fire to any part of a prison or any other property, whether or not his own',
              plea: 'Guilty',
              finding: 'Charge Proved',
              sanctions: [
                {
                  sanctionType: 'Forfeiture of Privileges',
                  sanctionDays: 14,
                  effectiveDate: '2016-10-21T00:00:00',
                  status: 'Immediate',
                  statusDate: '2016-10-21T12:00:00',
                  comment: 'No privileges comment',
                  sanctionSeq: 14,
                },
                {
                  sanctionType: 'Cellular Confinement',
                  sanctionDays: 7,
                  effectiveDate: '2016-10-23T00:00:00',
                  status: 'Immediate',
                  statusDate: '2016-10-25T15:00:00',
                  comment: 'Confinement comment',
                  sanctionSeq: 15,
                },
              ],
            },
          ],
        },
        {
          oicHearingId: 2,
          hearingType: "Governor's Hearing Adult",
          hearingTime: '2018-10-25T10:00:00',
          heardByFirstName: 'Steve',
          heardByLastName: 'Jones',
          establishment: 'Moorland (HMP & YOI)',
          location: 'Adj',
          results: [],
        },
      ],
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerAdjudicationDetails.njk', {
      adjudicationDetails: expect.objectContaining({
        adjudicationNumber: 123,
        establishment: 'Moorland (HMP & YOI)',
        hearings: [
          expect.objectContaining({
            comments: [],
            establishment: 'Moorland (HMP & YOI)',
            heardBy: 'Jones, Steve',
            hearingTime: '25 October 2018 - 10:00',
            hearingType: "Governor's Hearing Adult",
            location: 'Adj',
            oicHearingId: 2,
            results: [],
          }),
          expect.objectContaining({
            comments: ['No privileges comment', 'Confinement comment'],
            establishment: 'Moorland (HMP & YOI)',
            heardBy: 'Smith, John',
            hearingTime: '21 October 2016 - 10:00',
            hearingType: "Governor's Hearing Adult",
            location: 'Adj',
            oicHearingId: 1,
            results: [
              {
                finding: 'Charge Proved',
                offenceDescription:
                  'Intentionally or recklessly sets fire to any part of a prison or any other property, whether or not his own',
                offenceType: 'Prison Rule 51',
                oicOffenceCode: '51:16',
                plea: 'Guilty',
                sanctions: [
                  {
                    comment: 'No privileges comment',
                    effectiveDate: '21/10/2016',
                    sanctionDays: 14,
                    sanctionSeq: 14,
                    sanctionType: 'Forfeiture of Privileges',
                    status: 'Immediate',
                    statusDate: '21/10/2016',
                  },
                  {
                    comment: 'Confinement comment',
                    effectiveDate: '23/10/2016',
                    sanctionDays: 7,
                    sanctionSeq: 15,
                    sanctionType: 'Cellular Confinement',
                    status: 'Immediate',
                    statusDate: '25/10/2016',
                  },
                ],
              },
            ],
          }),
        ],
        incidentDetails: 'Something happened',
        incidentTime: '19/10/2016 - 10:00',
        interiorLocation: 'Health Care',
        reportNumber: 1392002,
        reportTime: '19/10/2016 - 10:57',
        reportType: "Governor's Report",
        reportedBy: 'Florenzo, Dudfsanaye',
      }),
      breadcrumbPrisonerName: 'Smith , John',
      profileUrl: '/prisoner/ABC123',
    })
  })

  describe('Errors', () => {
    it('should render the error template with a link to the prisoner profile page if there is a problem retrieving prisoner details', async () => {
      const error = new Error('Network error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe('/prisoner/ABC123')
    })
  })
})
