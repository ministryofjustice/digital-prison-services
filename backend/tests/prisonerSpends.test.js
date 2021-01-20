const prisonerSpends = require('../controllers/prisonerProfile/prisonerFinances/prisonerSpends')

describe('Prisoner spends', () => {
  const offenderNo = 'ABC123'
  const prisonApi = {}
  const prisonerFinanceService = {}

  let req
  let res
  let controller

  const templateDataResponse = {
    currentBalance: '£95.00',
    formValues: {
      selectedMonth: 10,
      selectedYear: 2020,
    },
    monthOptions: [
      { text: 'January', value: 0 },
      { text: 'February', value: 1 },
      { text: 'March', value: 2 },
      { text: 'April', value: 3 },
      { text: 'May', value: 4 },
      { text: 'June', value: 5 },
      { text: 'July', value: 6 },
      { text: 'August', value: 7 },
      { text: 'September', value: 8 },
      { text: 'October', value: 9 },
      { text: 'November', value: 10 },
      { text: 'December', value: 11 },
    ],
    prisoner: {
      name: 'John Smith',
      nameForBreadcrumb: 'Smith, John',
      offenderNo: 'ABC123',
    },
    showDamageObligationsLink: false,
    yearOptions: [
      { text: 2017, value: 2017 },
      { text: 2018, value: 2018 },
      { text: 2019, value: 2019 },
      { text: 2020, value: 2020 },
    ],
  }

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
    }
    res = { locals: {}, render: jest.fn() }

    prisonerFinanceService.getTransactionsForDateRange = jest.fn().mockResolvedValue([])
    prisonerFinanceService.getTemplateData = jest.fn().mockResolvedValue(templateDataResponse)

    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({})

    controller = prisonerSpends({ prisonApi, prisonerFinanceService })
  })

  it('should make the expected calls', async () => {
    const params = [res.locals, offenderNo, 'spends', undefined, undefined]
    await controller(req, res)

    expect(prisonerFinanceService.getTransactionsForDateRange).toHaveBeenCalledWith(...params)
    expect(prisonerFinanceService.getTemplateData).toHaveBeenCalledWith(...params)
    expect(prisonApi.getAgencyDetails).not.toHaveBeenCalled()
  })

  describe('with transaction data', () => {
    beforeEach(() => {
      prisonerFinanceService.getTransactionsForDateRange = jest.fn().mockResolvedValue([
        {
          offenderId: 1,
          transactionId: 456,
          transactionEntrySequence: 1,
          entryDate: '2020-12-02',
          transactionType: 'OT',
          entryDescription: 'Sub-Account Transfer',
          referenceNumber: null,
          currency: 'GBP',
          penceAmount: 1000,
          accountType: 'SPND',
          postingType: 'DR',
          offenderNo,
          agencyId: 'MDI',
          relatedOffenderTransactions: [],
        },
        {
          offenderId: 1,
          transactionId: 123,
          transactionEntrySequence: 1,
          entryDate: '2020-12-01',
          transactionType: 'A_EARN',
          entryDescription: 'Offender Payroll From:01/12/2020 To:01/12/2020',
          referenceNumber: null,
          currency: 'GBP',
          penceAmount: 50,
          accountType: 'SPND',
          postingType: 'CR',
          offenderNo,
          agencyId: 'LEI',
          relatedOffenderTransactions: [],
        },
      ])

      prisonApi.getAgencyDetails = jest
        .fn()
        .mockResolvedValue({ description: 'Moorland', agencyId: 'MDI' })
        .mockResolvedValueOnce({ description: 'Leeds', agencyId: 'LEI' })
    })

    it('should make additional expected API calls for agency data', async () => {
      await controller(req, res)

      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith({}, 'MDI')
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith({}, 'LEI')
    })

    it('should render the correct template with the correct information', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerFinance/spends.njk', {
        ...templateDataResponse,
        spendsRows: [
          [
            { text: '02/12/2020' },
            { text: '' },
            { text: '£10.00' },
            { text: 'Sub-Account Transfer' },
            { text: 'Moorland' },
          ],
          [
            { text: '01/12/2020' },
            { text: '£0.50' },
            { text: '' },
            { text: 'Offender Payroll From:01/12/2020 To:01/12/2020' },
            { text: 'Leeds' },
          ],
        ],
      })
    })
  })

  describe('when selecting a month and year', () => {
    beforeEach(() => {
      req.query = {
        month: '6',
        year: '2020',
      }
    })

    it('should pass make the correct calls to prisonerFinanceService', async () => {
      const params = [res.locals, offenderNo, 'spends', '6', '2020']
      await controller(req, res)

      expect(prisonerFinanceService.getTransactionsForDateRange).toHaveBeenCalledWith(...params)
      expect(prisonerFinanceService.getTemplateData).toHaveBeenCalledWith(...params)
    })
  })

  describe('when there are errors', () => {
    it('set the redirect url and throw the error', async () => {
      const error = new Error('Network error')
      prisonerFinanceService.getTransactionsForDateRange.mockRejectedValue(error)

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
    })
  })
})
