const prisonerProfileService = require('../services/prisonerProfileService')

describe('prisoner profile service', () => {
  const context = {}
  const elite2Api = {}
  const keyworkerApi = {}
  let service

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.getIepSummary = jest.fn()
    elite2Api.getCaseNoteSummaryByTypes = jest.fn()
    keyworkerApi.getKeyworkerByCaseloadAndOffenderNo = jest.fn()
    service = prisonerProfileService(elite2Api, keyworkerApi)
  })

  describe('prisoner header information', () => {
    const offenderNo = 'ABC123'
    const bookingId = '123'

    beforeEach(() => {
      elite2Api.getDetails.mockReturnValue({
        activeAlertCount: 1,
        agencyId: 'MDI',
        alerts: [],
        assignedLivingUnit: {
          description: 'CELL-123',
          agencyName: 'Moorland Closed',
        },
        bookingId,
        category: 'Cat C',
        csra: 'High',
        firstName: 'TEST',
        inactiveAlertCount: 2,
        lastName: 'PRISONER',
      })
      elite2Api.getIepSummary.mockReturnValue([{ iepLevel: 'Standard' }])
      elite2Api.getCaseNoteSummaryByTypes.mockReturnValue([{ latestCaseNote: '2020-04-07T14:04:25' }])
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockReturnValue({ firstName: 'STAFF', lastName: 'MEMBER' })
    })

    it('should make a call for the full details for a prisoner', async () => {
      await service.getPrisonerHeader(context, offenderNo)

      expect(elite2Api.getDetails).toHaveBeenCalledWith(context, offenderNo, true)
    })

    it('should make calls for the additional details required for the header', async () => {
      await service.getPrisonerHeader(context, offenderNo)

      expect(elite2Api.getIepSummary).toHaveBeenCalledWith(context, [bookingId])
      expect(elite2Api.getCaseNoteSummaryByTypes).toHaveBeenCalledWith(context, {
        type: 'KA',
        subType: 'KS',
        numMonths: 1,
        bookingId,
      })
      expect(keyworkerApi.getKeyworkerByCaseloadAndOffenderNo).toHaveBeenCalledWith(context, 'MDI', offenderNo)
    })

    it('should return the correct prisoner information', async () => {
      const getPrisonerHeader = await service.getPrisonerHeader(context, offenderNo)

      expect(getPrisonerHeader).toEqual({
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
        offenderNo: 'ABC123',
      })
    })

    it('should return the correct prisoner information when some data is missing', async () => {
      elite2Api.getIepSummary.mockReturnValue([])
      elite2Api.getCaseNoteSummaryByTypes.mockReturnValue([])
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo.mockReturnValue(null)

      const getPrisonerHeader = await service.getPrisonerHeader(context, offenderNo)

      expect(getPrisonerHeader).toEqual({
        activeAlertCount: 1,
        agencyName: 'Moorland Closed',
        alerts: [],
        category: 'Cat C',
        csra: 'High',
        inactiveAlertCount: 2,
        incentiveLevel: false,
        keyWorkerLastSession: false,
        keyWorkerName: false,
        location: 'CELL-123',
        offenderName: 'Prisoner, Test',
        offenderNo: 'ABC123',
      })
    })
  })
})
