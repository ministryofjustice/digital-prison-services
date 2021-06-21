const prisonerSentenceAndRelease = require('../controllers/prisonerProfile/prisonerSentenceAndRelease')

describe('prisoner sentence and release', () => {
  const offenderNo = 'G3878UK'
  const prisonerProfileData = {
    activeAlertCount: 1,
    agencyName: 'Moorland Closed',
    alerts: [],
    category: 'Cat C',
    csra: 'High',
    inactiveAlertCount: 2,
    incentiveLevel: 'Standard',
    keyWorkerLastSession: '07/04/2020',
    keyWorkerName: 'Member, Staff',
    location: 'CELL-123',
    offenderName: 'Prisoner, Test',
    offenderNo,
  }
  const prisonerProfileService = {}
  const prisonApi = {}
  const systemOauthClient = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = { params: { offenderNo }, session: { userDetails: { username: 'ITAG_USER' } } }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    req.originalUrl = '/sentence-and-release'
    req.get = jest.fn()
    req.get.mockReturnValue('localhost')
    res.status = jest.fn()

    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {
        sentenceStartDate: '2010-02-03',
        confirmedReleaseDate: '2020-04-20',
        releaseDate: '2020-04-01',
        nonDtoReleaseDateType: 'CRD',
        additionalDaysAwarded: 5,
        automaticReleaseOverrideDate: '2020-02-02',
        conditionalReleaseOverrideDate: '2020-02-03',
        nonParoleOverrideDate: '2020-10-03',
        postRecallReleaseOverrideDate: '2020-04-01',
        nonDtoReleaseDate: '2020-04-01',
        sentenceExpiryDate: '2020-02-19',
        automaticReleaseDate: '2020-01-01',
        conditionalReleaseDate: '2020-02-01',
        nonParoleDate: '2019-02-03',
        postRecallReleaseDate: '2021-02-03',
        licenceExpiryDate: '2020-02-04',
        homeDetentionCurfewEligibilityDate: '2019-07-03',
        paroleEligibilityDate: '2022-02-03',
        homeDetentionCurfewActualDate: '2021-06-02',
        actualParoleDate: '2020-04-03',
        releaseOnTemporaryLicenceDate: '2025-02-03',
        earlyRemovalSchemeEligibilityDate: '2018-11-12',
        tariffEarlyRemovalSchemeEligibilityDate: '2017-10-10',
        earlyTermDate: '2019-08-09',
        midTermDate: '2020-08-10',
        lateTermDate: '2021-08-11',
        topupSupervisionExpiryDate: '2020-10-14',
        tariffDate: '2021-05-07',
        dtoPostRecallReleaseDate: '2020-10-16',
        dtoPostRecallReleaseDateOverride: '2021-10-16',
      },
    })

    prisonApi.getPrisonerDetails = jest.fn().mockResolvedValue([{ latestBookingId: 1 }])
    prisonApi.getSentenceAdjustments = jest.fn()
    prisonApi.getOffenceHistory = jest.fn().mockResolvedValue([])
    prisonApi.getCourtCases = jest.fn().mockResolvedValue([])
    prisonApi.getSentenceTerms = jest.fn().mockResolvedValue([])
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({})

    controller = prisonerSentenceAndRelease({
      prisonerProfileService,
      prisonApi,
      systemOauthClient,
      logError,
    })
  })

  it('should make a call for the prisoner details and the sentence details and render the right template', async () => {
    await controller(req, res)

    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getPrisonerSentenceDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        prisonerProfileData,
        releaseDates: {
          currentExpectedReleaseDates: [
            {
              label: 'Automatic release',
              value: '2 February 2020',
            },
            { label: 'Conditional release', value: '3 February 2020' },
            {
              label: 'Post recall release',
              value: '1 April 2020',
            },
            { label: 'Mid transfer', value: '10 August 2020' },
            {
              label: 'Non parole',
              value: '3 October 2020',
            },
            {
              label: 'Approved for home detention curfew',
              value: '2 June 2021',
            },
            { label: 'Detention training post recall', value: '16 October 2021' },
          ],
          earlyAndTemporaryReleaseEligibilityDates: [
            {
              label: 'Tariff early removal scheme',
              value: '10 October 2017',
            },
            { label: 'Early removal scheme', value: '12 November 2018' },
            {
              label: 'Home detention curfew',
              value: '3 July 2019',
            },
            { label: 'Early transfer', value: '9 August 2019' },
            {
              label: 'Approved for parole',
              value: '3 April 2020',
            },
            {
              label: 'Parole eligibility',
              value: '3 February 2022',
            },
            { label: 'Release on temporary licence', value: '3 February 2025' },
          ],
          licenceDates: [
            { label: 'Licence expiry', value: '4 February 2020' },
            {
              label: 'Sentence expiry',
              value: '19 February 2020',
            },
            { label: 'Top up supervision expiry', value: '14 October 2020' },
          ],
          otherReleaseDates: [
            { label: 'Tariff', value: '7 May 2021' },
            {
              label: 'Late transfer',
              value: '11 August 2021',
            },
          ],
        },
      })
    )
  })

  it('should only return sentence, offences and court cases where they result in imprisonment', async () => {
    prisonApi.getCourtCases.mockResolvedValue([
      { id: 1, caseInfoNumber: 'T12345', agency: { description: 'Leeds' } },
      { id: 2, caseInfoNumber: 'T56789' },
      { id: 3, caseInfoNumber: 'T56799', agency: { description: 'Leeds' } },
      { id: 4, caseInfoNumber: 'T56800', agency: { description: 'Leeds' } },
      { id: 5, caseInfoNumber: 'T56801', agency: { description: 'Leeds' } },
    ])

    prisonApi.getOffenceHistory.mockResolvedValue([
      {
        offenceDescription: 'Offence 1',
        primaryResultCode: '1002',
        caseId: 1,
      },
      {
        offenceDescription: 'Offence 2',
        primaryResultCode: '4560',
        caseId: 2,
      },
      {
        offenceDescription: 'Offence 3',
        primaryResultCode: '1501',
        caseId: 3,
      },
      {
        offenceDescription: 'Offence 4',
        primaryResultCode: '1510',
        caseId: 4,
      },
      {
        offenceDescription: 'Offence 5',
        primaryResultCode: '1024',
        caseId: 5,
      },
    ])

    prisonApi.getSentenceTerms.mockResolvedValue([
      {
        lineSeq: 1,
        sentenceSequence: 1,
        termSequence: 1,
        consecutiveTo: 3,
        sentenceStartDate: '2018-12-31',
        years: 11,
        months: 0,
        weeks: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 1',
      },
      {
        lineSeq: 2,
        sentenceSequence: 3,
        termSequence: 1,
        sentenceStartDate: '2018-12-31',
        years: 11,
        months: 0,
        weeks: 0,
        days: 0,
        caseId: 2,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 2',
      },
      {
        lineSeq: 3,
        sentenceSequence: 4,
        termSequence: 1,
        sentenceStartDate: '2018-12-31',
        years: 0,
        months: 12,
        weeks: 0,
        days: 0,
        caseId: 3,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 3',
      },
      {
        lineSeq: 4,
        sentenceSequence: 5,
        termSequence: 1,
        sentenceStartDate: '2018-12-31',
        years: 0,
        months: 0,
        weeks: 50,
        days: 0,
        caseId: 4,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 4',
      },
      {
        lineSeq: 5,
        sentenceSequence: 6,
        termSequence: 1,
        sentenceStartDate: '2018-12-31',
        years: 2,
        months: 0,
        weeks: 0,
        days: 0,
        caseId: 5,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 5',
      },
    ])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        showSentences: true,
        courtCases: [
          {
            caseInfoNumber: 'T12345',
            offences: ['Offence 1'],
            sentenceDate: '31 December 2018',
            courtName: 'Leeds',
            sentenceTerms: [
              {
                sentenceHeader: 'Sentence 1',
                sentenceTypeDescription: 'Some sentence info 1',
                summaryDetailRows: [
                  { label: 'Start date', value: '31 December 2018' },
                  { label: 'Imprisonment', value: '11 years' },
                  { label: 'Consecutive to', value: 2 },
                ],
              },
            ],
          },
          {
            caseInfoNumber: 'T56799',
            offences: ['Offence 3'],
            sentenceDate: '31 December 2018',
            courtName: 'Leeds',
            sentenceTerms: [
              {
                sentenceHeader: 'Sentence 3',
                sentenceTypeDescription: 'Some sentence info 3',
                summaryDetailRows: [
                  { label: 'Start date', value: '31 December 2018' },
                  { label: 'Imprisonment', value: '12 months' },
                ],
              },
            ],
          },
          {
            caseInfoNumber: 'T56800',
            offences: ['Offence 4'],
            sentenceDate: '31 December 2018',
            courtName: 'Leeds',
            sentenceTerms: [
              {
                sentenceHeader: 'Sentence 4',
                sentenceTypeDescription: 'Some sentence info 4',
                summaryDetailRows: [
                  { label: 'Start date', value: '31 December 2018' },
                  { label: 'Imprisonment', value: '50 weeks' },
                ],
              },
            ],
          },
          {
            caseInfoNumber: 'T56801',
            offences: ['Offence 5'],
            sentenceDate: '31 December 2018',
            courtName: 'Leeds',
            sentenceTerms: [
              {
                sentenceHeader: 'Sentence 5',
                sentenceTypeDescription: 'Some sentence info 5',
                summaryDetailRows: [
                  { label: 'Start date', value: '31 December 2018' },
                  { label: 'Imprisonment', value: '2 years' },
                ],
              },
            ],
          },
        ],
      })
    )
  })
  it('should set showSentence to false', async () => {
    prisonApi.getCourtCases.mockResolvedValue([
      { id: 1, caseInfoNumber: 'T12345', agency: { description: 'Leeds' } },
      { id: 2, caseInfoNumber: 'T56789' },
    ])

    prisonApi.getOffenceHistory.mockResolvedValue([])
    prisonApi.getSentenceTerms.mockResolvedValue([])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        showSentences: false,
      })
    )
  })

  it('should show fine amount with sentence terms', async () => {
    prisonApi.getCourtCases.mockResolvedValue([{ id: 1, caseInfoNumber: 'T12345' }])

    prisonApi.getOffenceHistory.mockResolvedValue([
      { offenceDescription: 'Offence 1', primaryResultCode: '1002', caseId: 1 },
    ])

    prisonApi.getSentenceTerms.mockResolvedValue([
      {
        lineSeq: 1,
        termSequence: 1,
        sentenceStartDate: '2018-12-31',
        years: 11,
        months: 0,
        weeks: 0,
        days: 0,
        caseId: 1,
        fineAmount: 200,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 1',
      },
    ])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        courtCases: [
          {
            caseInfoNumber: 'T12345',
            offences: ['Offence 1'],
            sentenceDate: '31 December 2018',
            sentenceTerms: [
              {
                sentenceHeader: 'Sentence 1',
                sentenceTypeDescription: 'Some sentence info 1',
                summaryDetailRows: [
                  { label: 'Start date', value: '31 December 2018' },
                  { label: 'Imprisonment', value: '11 years' },
                  { label: 'Fine', value: '£200.00' },
                ],
              },
            ],
          },
        ],
      })
    )
  })

  it('should show licence length with sentence terms', async () => {
    prisonApi.getCourtCases.mockResolvedValue([{ id: 1, caseInfoNumber: 'T12345' }])

    prisonApi.getOffenceHistory.mockResolvedValue([
      { offenceDescription: 'Offence 1', primaryResultCode: '1002', caseId: 1 },
      { offenceDescription: 'Offence 1', primaryResultCode: '1002', caseId: 1 },
    ])

    prisonApi.getSentenceTerms.mockResolvedValue([
      {
        lineSeq: 1,
        sentenceSequence: 1,
        termSequence: 1,
        consecutiveTo: 2,
        sentenceStartDate: '2018-12-31',
        years: 11,
        months: 0,
        weeks: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 1',
      },
      {
        lineSeq: 1,
        termSequence: 2,
        consecutiveTo: 2,
        sentenceStartDate: '2018-12-31',
        years: 5,
        months: 0,
        weeks: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'LIC',
      },

      {
        lineSeq: 2,
        sentenceSequence: 2,
        termSequence: 1,
        sentenceStartDate: '2018-12-31',
        years: 20,
        months: 0,
        weeks: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 3',
      },
    ])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        courtCases: [
          {
            caseInfoNumber: 'T12345',
            offences: ['Offence 1'],
            sentenceDate: '31 December 2018',
            sentenceTerms: [
              {
                sentenceHeader: 'Sentence 2',
                sentenceTypeDescription: 'Some sentence info 3',
                summaryDetailRows: [
                  { label: 'Start date', value: '31 December 2018' },
                  { label: 'Imprisonment', value: '20 years' },
                ],
              },
              {
                sentenceHeader: 'Sentence 1',
                sentenceTypeDescription: 'Some sentence info 1',
                summaryDetailRows: [
                  { label: 'Start date', value: '31 December 2018' },
                  { label: 'Imprisonment', value: '11 years' },
                  { label: 'Consecutive to', value: 2 },
                  { label: 'Licence', value: '5 years' },
                ],
              },
            ],
          },
        ],
      })
    )
  })

  it('should order sentences by sentence date, then by sentence length', async () => {
    prisonApi.getCourtCases.mockResolvedValue([{ id: 1, caseInfoNumber: 'T12345' }])

    prisonApi.getOffenceHistory.mockResolvedValue([
      { offenceDescription: 'Offence 1', primaryResultCode: '1002', caseId: 1 },
    ])

    prisonApi.getSentenceTerms.mockResolvedValue([
      {
        lineSeq: 2,
        termSequence: 1,
        sentenceStartDate: '2018-02-01',
        years: 11,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 2',
      },
      {
        lineSeq: 3,
        termSequence: 1,
        sentenceStartDate: '2018-03-01',
        years: 11,
        months: 1,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 3',
      },
      {
        lineSeq: 1,
        termSequence: 1,
        sentenceStartDate: '2018-01-01',
        years: 11,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 1',
      },
      {
        lineSeq: 6,
        termSequence: 1,
        sentenceStartDate: '2018-01-01',
        years: 12,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 6',
      },
      {
        lineSeq: 5,
        termSequence: 1,
        sentenceStartDate: '2018-01-01',
        years: 11,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 5',
      },
      {
        lineSeq: 4,
        termSequence: 1,
        sentenceStartDate: '2018-03-01',
        years: 11,
        months: 1,
        days: 10,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 4',
      },
      {
        lineSeq: 10,
        termSequence: 1,
        sentenceStartDate: '2018-03-01',
        years: 11,
        months: 1,
        weeks: 1,
        days: 10,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 10',
      },
    ])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        courtCases: [
          {
            caseInfoNumber: 'T12345',
            offences: ['Offence 1'],
            sentenceDate: '1 January 2018',
            sentenceTerms: [
              {
                sentenceHeader: 'Sentence 6',
                sentenceTypeDescription: 'Some sentence info 6',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 January 2018' },
                  { label: 'Imprisonment', value: '12 years' },
                ],
              },
              {
                sentenceHeader: 'Sentence 5',
                sentenceTypeDescription: 'Some sentence info 5',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 January 2018' },
                  { label: 'Imprisonment', value: '11 years' },
                ],
              },
              {
                sentenceHeader: 'Sentence 1',
                sentenceTypeDescription: 'Some sentence info 1',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 January 2018' },
                  { label: 'Imprisonment', value: '11 years' },
                ],
              },
              {
                sentenceHeader: 'Sentence 2',
                sentenceTypeDescription: 'Some sentence info 2',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 February 2018' },
                  { label: 'Imprisonment', value: '11 years' },
                ],
              },
              {
                sentenceHeader: 'Sentence 10',
                sentenceTypeDescription: 'Some sentence info 10',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 March 2018' },
                  { label: 'Imprisonment', value: '11 years, 1 month, 1 week, 10 days' },
                ],
              },
              {
                sentenceHeader: 'Sentence 4',
                sentenceTypeDescription: 'Some sentence info 4',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 March 2018' },
                  { label: 'Imprisonment', value: '11 years, 1 month, 10 days' },
                ],
              },
              {
                sentenceHeader: 'Sentence 3',
                sentenceTypeDescription: 'Some sentence info 3',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 March 2018' },
                  { label: 'Imprisonment', value: '11 years, 1 month' },
                ],
              },
            ],
          },
        ],
      })
    )
  })

  it('should order offences alphabetically', async () => {
    prisonApi.getCourtCases.mockResolvedValue([{ id: 1, caseInfoNumber: 'T12345' }])

    prisonApi.getOffenceHistory.mockResolvedValue([
      { offenceDescription: 'C', primaryResultCode: '1002', caseId: 1 },
      { offenceDescription: 'b', primaryResultCode: '1002', caseId: 1 },
      { offenceDescription: 'a', primaryResultCode: '1002', caseId: 1 },
    ])

    prisonApi.getSentenceTerms.mockResolvedValue([
      {
        lineSeq: 6,
        termSequence: 1,
        sentenceStartDate: '2018-01-01',
        years: 12,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 6',
      },
    ])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        courtCases: [
          {
            caseInfoNumber: 'T12345',
            offences: ['a', 'b', 'C'],
            sentenceDate: '1 January 2018',
            sentenceTerms: [
              {
                sentenceHeader: 'Sentence 6',
                sentenceTypeDescription: 'Some sentence info 6',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 January 2018' },
                  { label: 'Imprisonment', value: '12 years' },
                ],
              },
            ],
          },
        ],
      })
    )
  })

  it('should not show court cases and offences when there are no active sentences', async () => {
    prisonApi.getCourtCases.mockResolvedValue([{ id: 1, caseInfoNumber: 'T12345' }])

    prisonApi.getOffenceHistory.mockResolvedValue([
      { offenceDescription: 'C', primaryResultCode: '1002', caseId: 1 },
      { offenceDescription: 'b', primaryResultCode: '1002', caseId: 1 },
      { offenceDescription: 'a', primaryResultCode: '1002', caseId: 1 },
    ])

    prisonApi.getSentenceTerms.mockResolvedValue([])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        courtCases: [],
      })
    )
  })

  it('should return the sentence date using the oldest sentence start date', async () => {
    prisonApi.getCourtCases.mockResolvedValue([{ id: 1, caseInfoNumber: 'T12345' }])

    prisonApi.getOffenceHistory.mockResolvedValue([
      { offenceDescription: 'C', primaryResultCode: '1002', caseId: 1 },
      { offenceDescription: 'b', primaryResultCode: '1002', caseId: 1 },
      { offenceDescription: 'a', primaryResultCode: '1002', caseId: 1 },
    ])

    prisonApi.getSentenceTerms.mockResolvedValue([
      {
        lineSeq: 6,
        termSequence: 1,
        sentenceStartDate: '2018-01-01',
        years: 12,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 6',
      },
      {
        lineSeq: 1,
        termSequence: 1,
        sentenceStartDate: '2017-01-01',
        years: 12,
        months: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'IMP',
        sentenceTypeDescription: 'Some sentence info 1',
      },
    ])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        courtCases: [
          {
            caseInfoNumber: 'T12345',
            offences: ['a', 'b', 'C'],
            sentenceDate: '1 January 2017',
            sentenceTerms: [
              {
                sentenceHeader: 'Sentence 1',
                sentenceTypeDescription: 'Some sentence info 1',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 January 2017' },
                  { label: 'Imprisonment', value: '12 years' },
                ],
              },
              {
                sentenceHeader: 'Sentence 6',
                sentenceTypeDescription: 'Some sentence info 6',
                summaryDetailRows: [
                  { label: 'Start date', value: '1 January 2018' },
                  { label: 'Imprisonment', value: '12 years' },
                ],
              },
            ],
          },
        ],
      })
    )
  })

  it('should make a system to system call when requesting offences', async () => {
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({ system: true })

    await controller(req, res)

    expect(systemOauthClient.getClientCredentialsTokens).toHaveBeenCalledWith('ITAG_USER')
    expect(prisonApi.getOffenceHistory).toHaveBeenCalledWith({ system: true }, 'G3878UK')
  })

  it('should return the right data when no overrides', async () => {
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {
        sentenceStartDate: '2010-02-03',
        confirmedReleaseDate: '2020-04-20',
        releaseDate: '2020-04-01',
        nonDtoReleaseDateType: 'CRD',
        additionalDaysAwarded: 5,
        nonDtoReleaseDate: '2020-04-01',
        sentenceExpiryDate: '2020-02-19',
        automaticReleaseDate: '2020-01-01',
        conditionalReleaseDate: '2020-02-01',
        nonParoleDate: '2019-02-03',
        postRecallReleaseDate: '2021-02-03',
        licenceExpiryDate: '2020-02-04',
        homeDetentionCurfewEligibilityDate: '2019-07-03',
        paroleEligibilityDate: '2022-02-03',
        homeDetentionCurfewActualDate: '2021-06-02',
        actualParoleDate: '2020-04-03',
        releaseOnTemporaryLicenceDate: '2025-02-03',
        earlyRemovalSchemeEligibilityDate: '2018-11-12',
        earlyTermDate: '2019-08-09',
        midTermDate: '2020-08-10',
        lateTermDate: '2021-08-11',
        topupSupervisionExpiryDate: '2020-10-14',
        tariffDate: '2021-05-07',
        dtoPostRecallReleaseDate: '2020-10-16',
      },
    })
    await controller(req, res)

    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getPrisonerSentenceDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        prisonerProfileData,
        releaseDates: {
          currentExpectedReleaseDates: [
            { label: 'Non parole', value: '3 February 2019' },
            { label: 'Automatic release', value: '1 January 2020' },
            { label: 'Conditional release', value: '1 February 2020' },
            { label: 'Mid transfer', value: '10 August 2020' },
            { label: 'Detention training post recall', value: '16 October 2020' },
            { label: 'Post recall release', value: '3 February 2021' },
            { label: 'Approved for home detention curfew', value: '2 June 2021' },
          ],
          earlyAndTemporaryReleaseEligibilityDates: [
            { label: 'Early removal scheme', value: '12 November 2018' },
            { label: 'Home detention curfew', value: '3 July 2019' },
            { label: 'Early transfer', value: '9 August 2019' },
            { label: 'Approved for parole', value: '3 April 2020' },
            { label: 'Parole eligibility', value: '3 February 2022' },
            { label: 'Release on temporary licence', value: '3 February 2025' },
          ],
          licenceDates: [
            { label: 'Licence expiry', value: '4 February 2020' },
            { label: 'Sentence expiry', value: '19 February 2020' },
            { label: 'Top up supervision expiry', value: '14 October 2020' },
          ],
          otherReleaseDates: [
            { label: 'Tariff', value: '7 May 2021' },
            { label: 'Late transfer', value: '11 August 2021' },
          ],
        },
      })
    )
  })

  it('should return the right data when sections are empty', async () => {
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {
        sentenceStartDate: '2010-02-03',
        confirmedReleaseDate: '2020-04-20',
        releaseDate: '2020-04-01',
        nonDtoReleaseDateType: 'CRD',
        additionalDaysAwarded: 5,
      },
    })
    await controller(req, res)

    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getPrisonerSentenceDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        prisonerProfileData,
        releaseDates: {
          currentExpectedReleaseDates: [],
          earlyAndTemporaryReleaseEligibilityDates: [],
          licenceDates: [],
          otherReleaseDates: [],
        },
      })
    )
  })

  it('should make a call to retrieve an offenders booking id', async () => {
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {},
    })
    prisonApi.getSentenceAdjustments = jest.fn().mockResolvedValue({})

    await controller(req, res)

    expect(prisonApi.getPrisonerDetails).toHaveBeenCalledWith({}, offenderNo)
  })

  it('should make a call for sentence adjustments', async () => {
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {},
    })
    prisonApi.getSentenceAdjustments = jest.fn().mockResolvedValue({})

    await controller(req, res)

    expect(prisonApi.getSentenceAdjustments).toHaveBeenCalledWith({}, 1)
  })

  it('should return the right data when values are available', async () => {
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {},
    })
    prisonApi.getSentenceAdjustments = jest.fn().mockResolvedValue({
      additionalDaysAwarded: 1,
      lawfullyAtLarge: 2,
      recallSentenceRemand: 3,
      recallSentenceTaggedBail: 4,
      remand: 5,
      restoredAdditionalDaysAwarded: 6,
      specialRemission: 7,
      taggedBail: 8,
      unlawfullyAtLarge: 9,
      unusedRemand: 10,
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        sentenceAdjustments: {
          daysRemovedFromSentence: [
            { label: 'Remand', value: 5 },
            { label: 'Recall remand', value: 3 },
            { label: 'Recall tagged bail', value: 4 },
            { label: 'Restored additional days awarded', value: 6 },
            { label: 'Special remission', value: 7 },
            { label: 'Tagged bail', value: 8 },
          ],
          daysAddedToSentence: [
            { label: 'Additional days awarded', value: 1 },
            { label: 'Unlawfully at large', value: 9 },
          ],
          unusedRemandTime: [{ label: 'Unused remand time', value: 10 }],
          noSentenceAdjustments: false,
        },
      })
    )
  })

  it('should return the right data when no values are available', async () => {
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {},
    })
    prisonApi.getSentenceAdjustments = jest.fn().mockResolvedValue({
      additionalDaysAwarded: 0,
      lawfullyAtLarge: 0,
      recallSentenceRemand: 0,
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        sentenceAdjustments: {
          daysRemovedFromSentence: [],
          daysAddedToSentence: [],
          unusedRemandTime: [],
          noSentenceAdjustments: true,
        },
      })
    )
  })

  it('should not trigger an undefined exception when a license comes first in the sentence terms data set', async () => {
    prisonApi.getCourtCases.mockResolvedValue([{ id: 1, caseInfoNumber: 'T12345', agency: { description: 'Leeds' } }])

    prisonApi.getOffenceHistory.mockResolvedValue([
      {
        offenceDescription: 'Offence 1',
        primaryResultCode: '1002',
        caseId: 1,
      },
    ])

    prisonApi.getSentenceTerms.mockResolvedValue([
      {
        lineSeq: 1,
        sentenceSequence: 1,
        termSequence: 1,
        consecutiveTo: 3,
        sentenceStartDate: '2018-12-31',
        years: 11,
        months: 0,
        weeks: 0,
        days: 0,
        caseId: 1,
        sentenceTermCode: 'LIC',
        sentenceTypeDescription: 'Some sentence info 1',
      },
    ])

    await controller(req, res)
  })

  it('Should show Life Sentence in Effective Sentence End Date if the end date doesnt exist and it is a life sentence', async () => {
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {
        sentenceStartDate: '2010-02-03',
        confirmedReleaseDate: '2020-04-20',
        releaseDate: '2020-04-01',
      },
    })
    prisonApi.getPrisonerDetails = jest.fn().mockResolvedValue([{ latestBookingId: 1, imprisonmentStatus: 'LIFE' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        effectiveSentenceEndDate: 'Life sentence',
      })
    )
  })

  it('Should return nothing in Effective Sentence End Date if the end date doesnt exist and it is not a life sentence', async () => {
    prisonApi.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {
        sentenceStartDate: '2010-02-03',
        confirmedReleaseDate: '2020-04-20',
        releaseDate: '2020-04-01',
      },
    })
    prisonApi.getPrisonerDetails = jest.fn().mockResolvedValue([{ latestBookingId: 1, imprisonmentStatus: 'OTHER' }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        effectiveSentenceEndDate: undefined,
      })
    )
  })
})
