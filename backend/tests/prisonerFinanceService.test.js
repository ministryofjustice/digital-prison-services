const prisonerFinanceService = require('../services/prisonerFinanceService')

describe('Prisoner finance service', () => {
  const context = {}
  const prisonApi = {}
  const offenderNo = 'ABC123'
  const bookingId = '123'
  let service

  const allTransactionsResponse = [
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

  jest.spyOn(Date, 'now').mockImplementation(() => 1606471200000) // Friday, 27 November 2020 10:00:00

  beforeEach(() => {
    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    prisonApi.getTransactionHistory = jest.fn().mockResolvedValue([])
    prisonApi.getPrisonerBalances = jest.fn().mockResolvedValue({})

    service = prisonerFinanceService(prisonApi)
  })

  describe('getTransactionsForDateRange', () => {
    it('should make the expected API calls', async () => {
      await service.getTransactionsForDateRange(context, offenderNo, 'cash')

      expect(prisonApi.getTransactionHistory).toHaveBeenCalledWith(context, offenderNo, {
        account_code: 'cash',
        from_date: '2020-11-01',
        to_date: '2020-11-27',
      })
    })

    describe('with data', () => {
      beforeEach(() => {
        prisonApi.getTransactionHistory.mockResolvedValue(allTransactionsResponse)
      })

      it('should return the correct data', async () => {
        const transactionsForDateRange = await service.getTransactionsForDateRange(context, offenderNo, 'cash')

        expect(transactionsForDateRange).toEqual(allTransactionsResponse)
      })

      it('should make a call for the full months worth of transaction history when selecting a previous date', async () => {
        await service.getTransactionsForDateRange(context, offenderNo, 'cash', '6', '2020')

        expect(prisonApi.getTransactionHistory).toHaveBeenCalledWith(context, offenderNo, {
          account_code: 'cash',
          from_date: '2020-07-01',
          to_date: '2020-07-31',
        })
      })

      it('should not make a call for transaction history when selecting a future date', async () => {
        await service.getTransactionsForDateRange(context, offenderNo, 'cash', '6', '2021')

        expect(prisonApi.getTransactionHistory).not.toHaveBeenCalled()
      })
    })
  })

  describe('getTemplateData', () => {
    it('should make the expected API calls', async () => {
      await service.getTemplateData(context, offenderNo, 'cash')

      expect(prisonApi.getDetails).toHaveBeenCalledWith(context, offenderNo)
      expect(prisonApi.getPrisonerBalances).toHaveBeenCalledWith(context, bookingId)
    })

    it('should return the correct data', async () => {
      const templateData = await service.getTemplateData(context, offenderNo, 'cash')

      expect(templateData).toEqual({
        currentBalance: '£0.00',
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
      })
    })

    describe('when there are balances', () => {
      beforeEach(() => {
        prisonApi.getPrisonerBalances = jest.fn().mockResolvedValue({ cash: 95, damageObligations: 101 })
      })

      it('should let the template know to display a link to the damage obligations page', async () => {
        const templateData = await service.getTemplateData(context, offenderNo, 'cash')

        expect(templateData).toEqual(
          expect.objectContaining({ currentBalance: '£95.00', showDamageObligationsLink: true })
        )
      })
    })
  })
})
