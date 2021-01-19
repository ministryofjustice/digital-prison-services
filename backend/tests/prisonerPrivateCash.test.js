const prisonerPrivateCash = require('../controllers/prisonerProfile/prisonerFinances/prisonerPrivateCash')

describe('Prisoner private cash', () => {
  const offenderNo = 'ABC123'
  const bookingId = 1
  const prisonApi = {}

  let req
  let res
  let controller

  const pendingTransactions = [
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
  ]

  const privateCashResponse = [
    ...pendingTransactions,
    {
      offenderId: 1,
      transactionId: 123,
      transactionEntrySequence: 1,
      entryDate: '2020-11-22',
      transactionType: 'ATOF',
      entryDescription: 'Cash To Spends Transfer',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 500,
      accountType: 'REG',
      postingType: 'DR',
      agencyId: 'MDI',
    },
    {
      offenderId: 1,
      transactionId: 456,
      transactionEntrySequence: 1,
      entryDate: '2020-10-16',
      transactionType: 'POST',
      entryDescription: 'Money Through Post',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 20000,
      accountType: 'REG',
      postingType: 'CR',
      agencyId: 'MDI',
    },
    {
      offenderId: 1,
      transactionId: 789,
      transactionEntrySequence: 1,
      entryDate: '2020-10-16',
      transactionType: 'POST',
      entryDescription: 'Bought some food',
      referenceNumber: null,
      currency: 'GBP',
      penceAmount: 10000,
      accountType: 'REG',
      postingType: 'DR',
      agencyId: 'LEI',
    },
  ]

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
    }
    res = { locals: {}, render: jest.fn() }

    prisonApi.getTransactionHistory = jest.fn().mockResolvedValue([])
    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({})
    prisonApi.getPrisonerBalances = jest.fn().mockResolvedValue({})

    controller = prisonerPrivateCash({ prisonApi })

    jest.spyOn(Date, 'now').mockImplementation(() => 1606471200000) // Friday, 27 November 2020 10:00:00
  })

  afterEach(() => {
    Date.now.mockRestore()
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    expect(prisonApi.getTransactionHistory).toHaveBeenCalledWith(res.locals, offenderNo, {
      account_code: 'cash',
      transaction_type: 'HOA',
    })
    expect(prisonApi.getTransactionHistory).toHaveBeenCalledWith(res.locals, offenderNo, {
      account_code: 'cash',
      from_date: '2020-11-01',
      to_date: '2020-11-27',
    })
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getAgencyDetails).not.toHaveBeenCalled()
  })

  describe('with data', () => {
    beforeEach(() => {
      prisonApi.getPrisonerBalances = jest.fn().mockResolvedValue({ cash: 95, damageObligations: 0 })
      prisonApi.getTransactionHistory = jest
        .fn()
        .mockResolvedValue(privateCashResponse)
        .mockResolvedValueOnce(pendingTransactions)
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
        currentBalance: '£95.00',
        dpsUrl: 'http://localhost:3000/',
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
        nonPendingRows: [
          [
            { text: '22/11/2020' },
            { text: '' },
            { text: '£5.00' },
            { text: 'Cash To Spends Transfer' },
            { text: 'Moorland' },
          ],
          [
            { text: '16/10/2020' },
            { text: '£200.00' },
            { text: '' },
            { text: 'Money Through Post' },
            { text: 'Moorland' },
          ],
          [{ text: '16/10/2020' }, { text: '' }, { text: '£100.00' }, { text: 'Bought some food' }, { text: 'Leeds' }],
        ],
        pendingBalance: '-£10.00',
        pendingRows: [
          [{ text: '27/11/2020' }, { text: '' }, { text: '£10.00' }, { text: 'HOLD' }, { text: 'Moorland' }],
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
      })
    })
  })

  describe('when there is a damage obligations balance', () => {
    beforeEach(() => {
      prisonApi.getPrisonerBalances = jest.fn().mockResolvedValue({ cash: 95, damageObligations: 101 })
    })

    it('should let the template know to display a link to the damage obligations page', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerFinance/privateCash.njk',
        expect.objectContaining({ showDamageObligationsLink: true })
      )
    })
  })

  describe('when selecting a previous date', () => {
    beforeEach(() => {
      req.query = {
        month: '6',
        year: '2020',
      }
    })

    it('should make a call for the full months worth of transaction history', async () => {
      await controller(req, res)

      expect(prisonApi.getTransactionHistory).toHaveBeenCalledTimes(2)
      expect(prisonApi.getTransactionHistory).toHaveBeenCalledWith(res.locals, offenderNo, {
        account_code: 'cash',
        from_date: '2020-07-01',
        to_date: '2020-07-31',
      })
    })
  })

  describe('when selecting a future date', () => {
    beforeEach(() => {
      req.query = {
        month: '6',
        year: '2021',
      }
    })

    it('should only make a call for pending transactions', async () => {
      await controller(req, res)

      expect(prisonApi.getTransactionHistory).toHaveBeenCalledTimes(1)
      expect(prisonApi.getTransactionHistory).toHaveBeenCalledWith(res.locals, offenderNo, {
        account_code: 'cash',
        transaction_type: 'HOA',
      })
    })
  })

  describe('when there are errors', () => {
    it('set the redirect url and throw the error', async () => {
      const error = new Error('Network error')
      prisonApi.getDetails.mockRejectedValue(error)

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
    })
  })
})
