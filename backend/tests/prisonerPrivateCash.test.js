const prisonerPrivateCash = require('../controllers/prisonerProfile/prisonerFinances/prisonerPrivateCash')

describe('Prisoner private cash', () => {
  const offenderNo = 'ABC123'
  const bookingId = 1
  const prisonApi = {}

  let req
  let res
  let logError
  let controller

  const privateCashResponse = [
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

    logError = jest.fn()

    prisonApi.getTransactionHistory = jest.fn().mockResolvedValue([])
    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({})

    controller = prisonerPrivateCash({ prisonApi, logError })

    jest.spyOn(Date, 'now').mockImplementation(() => 1606471200000) // Friday, 27 November 2020 10:00:00
  })

  afterEach(() => {
    Date.now.mockRestore()
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    expect(prisonApi.getTransactionHistory).toHaveBeenCalledWith(res.locals, offenderNo, {
      account_code: 'cash',
      from_date: '2020-11-01',
    })
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getAgencyDetails).not.toHaveBeenCalled()
  })
})
