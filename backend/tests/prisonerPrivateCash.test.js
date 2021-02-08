const prisonerPrivateCash = require('../controllers/prisonerProfile/prisonerFinances/prisonerPrivateCash')

describe('Prisoner private cash', () => {
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

    prisonApi.getTransactionHistory = jest.fn().mockResolvedValue([])
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({})

    controller = prisonerPrivateCash({ prisonApi, prisonerFinanceService })
  })

  it('should make the expected calls', async () => {
    const params = [res.locals, offenderNo, 'cash', undefined, undefined]

    await controller(req, res)

    expect(prisonApi.getTransactionHistory).toHaveBeenCalledWith(res.locals, offenderNo, {
      account_code: 'cash',
      transaction_type: 'HOA',
    })
    expect(prisonApi.getTransactionHistory).toHaveBeenCalledWith(res.locals, offenderNo, {
      account_code: 'cash',
      transaction_type: 'WHF',
    })
    expect(prisonerFinanceService.getTransactionsForDateRange).toHaveBeenCalledWith(...params)
    expect(prisonerFinanceService.getTemplateData).toHaveBeenCalledWith(...params)
    expect(prisonApi.getAgencyDetails).not.toHaveBeenCalled()
  })

  describe('with transaction data', () => {
    beforeEach(() => {
      prisonerFinanceService.getTransactionsForDateRange = jest.fn().mockResolvedValue([
        {
          offenderId: 1,
          transactionId: 789,
          transactionEntrySequence: 1,
          entryDate: '2020-11-16',
          transactionType: 'POST',
          entryDescription: 'Bought some food',
          referenceNumber: null,
          currency: 'GBP',
          penceAmount: 10000,
          accountType: 'REG',
          postingType: 'DR',
          agencyId: 'LEI',
          currentBalance: 500,
        },
      ])
      prisonApi.getTransactionHistory = jest
        .fn()
        .mockResolvedValue([
          {
            offenderId: 1,
            transactionId: 234,
            transactionEntrySequence: 1,
            entryDate: '2020-11-27',
            transactionType: 'HOA',
            entryDescription: 'HOLD',
            referenceNumber: null,
            currency: 'GBP',
            penceAmount: 1000,
            accountType: 'REG',
            postingType: 'DR',
            agencyId: 'MDI',
          },
          {
            offenderId: 1,
            transactionId: 2345,
            transactionEntrySequence: 2,
            entryDate: '2020-11-27',
            transactionType: 'HOA',
            entryDescription: 'HOLD',
            referenceNumber: null,
            currency: 'GBP',
            penceAmount: 2000,
            accountType: 'REG',
            postingType: 'DR',
            agencyId: 'MDI',
            holdClearFlag: 'Y',
          },
        ])
        .mockResolvedValueOnce([
          {
            offenderId: 1,
            transactionId: 234,
            transactionEntrySequence: 1,
            entryDate: '2020-11-26',
            transactionType: 'WHF',
            entryDescription: 'WITHHELD',
            referenceNumber: null,
            currency: 'GBP',
            penceAmount: 2000,
            accountType: 'REG',
            postingType: 'DR',
            agencyId: 'MDI',
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

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerFinance/privateCash.njk', {
        ...templateDataResponse,
        nonPendingRows: [
          [
            { text: '16/11/2020' },
            { text: '' },
            { text: '£100.00' },
            { text: '£5.00' },
            { text: 'Bought some food' },
            { text: 'Leeds' },
          ],
        ],
        pendingBalance: '-£30.00',
        pendingRows: [
          [{ text: '27/11/2020' }, { text: '£10.00' }, { text: 'HOLD' }, { text: 'Moorland' }],
          [{ text: '26/11/2020' }, { text: '£20.00' }, { text: 'WITHHELD' }, { text: 'Moorland' }],
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
      const params = [res.locals, offenderNo, 'cash', '6', '2020']
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
