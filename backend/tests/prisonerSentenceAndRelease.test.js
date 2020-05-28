const prisonerSentenceAndRelease = require('../controllers/prisonerProfile/prisonerSentenceAndRelease')
const { serviceUnavailableMessage } = require('../common-messages')

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
  const elite2Api = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = { params: { offenderNo } }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    req.originalUrl = '/sentence-and-release'
    req.get = jest.fn()
    req.get.mockReturnValue('localhost')

    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)
    elite2Api.getPrisonerSentenceDetails = jest.fn().mockResolvedValue({
      sentenceDetail: {
        sentenceStartDate: '2010-02-03',
        confirmedReleaseDate: '2020-04-20',
        releaseDate: '2020-04-01',
        nonDtoReleaseDateType: 'CRD',
        additionalDaysAwarded: 5,
        automaticReleaseOverrideDate: '2020-02-03',
        conditionalReleaseOverrideDate: '2020-02-03',
        nonParoleOverrideDate: '2020-02-03',
        postRecallReleaseOverrideDate: '2020-04-01',
        nonDtoReleaseDate: '2020-04-01',
        sentenceExpiryDate: '2020-02-03',
        automaticReleaseDate: '2020-02-03',
        conditionalReleaseDate: '2020-02-03',
        nonParoleDate: '2020-02-03',
        postRecallReleaseDate: '2020-02-03',
        licenceExpiryDate: '2020-02-03',
        homeDetentionCurfewEligibilityDate: '2020-02-03',
        paroleEligibilityDate: '2020-02-03',
        homeDetentionCurfewActualDate: '2020-02-03',
        actualParoleDate: '2020-02-03',
        releaseOnTemporaryLicenceDate: '2020-02-03',
        earlyRemovalSchemeEligibilityDate: '2020-02-03',
        earlyTermDate: '2020-02-03',
        midTermDate: '2020-02-03',
        lateTermDate: '2020-02-03',
        topupSupervisionExpiryDate: '2020-02-03',
        tariffDate: '2020-02-03',
      },
    })
    controller = prisonerSentenceAndRelease({
      prisonerProfileService,
      elite2Api,
      logError,
    })
  })

  it('should make a call for the prisoner details and render the right template', async () => {
    await controller(req, res)

    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(elite2Api.getPrisonerSentenceDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk',
      expect.objectContaining({
        prisonerProfileData,
      })
    )
  })

  describe('when there are errors with retrieving information', () => {
    it('should redirect to error page', async () => {
      prisonerProfileService.getPrisonerProfileData.mockRejectedValue(new Error('Problem retrieving prisoner data'))
      await controller(req, res)

      expect(logError).toHaveBeenCalledWith(
        '/sentence-and-release',
        new Error('Problem retrieving prisoner data'),
        serviceUnavailableMessage
      )
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/prisoner/G3878UK/sentence-and-release' })
    })
  })
})
