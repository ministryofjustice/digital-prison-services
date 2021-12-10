import prisonerSpends from '../controllers/prisonerProfile/prisonerFinances/prisonerSpends'

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

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTransactionsForDateRange' does not ex... Remove this comment to see the full error message
    prisonerFinanceService.getTransactionsForDateRange = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTemplateData' does not exist on type ... Remove this comment to see the full error message
    prisonerFinanceService.getTemplateData = jest.fn().mockResolvedValue(templateDataResponse)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue({})

    controller = prisonerSpends({ prisonApi, prisonerFinanceService })
  })

  it('should make the expected calls', async () => {
    const params = [res.locals, offenderNo, 'spends', undefined, undefined]
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTransactionsForDateRange' does not ex... Remove this comment to see the full error message
    expect(prisonerFinanceService.getTransactionsForDateRange).toHaveBeenCalledWith(...params)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTemplateData' does not exist on type ... Remove this comment to see the full error message
    expect(prisonerFinanceService.getTemplateData).toHaveBeenCalledWith(...params)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    expect(prisonApi.getAgencyDetails).not.toHaveBeenCalled()
  })

  describe('with transaction data', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTransactionsForDateRange' does not ex... Remove this comment to see the full error message
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
          currentBalance: 450,
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
          currentBalance: 500,
          relatedOffenderTransactions: [
            {
              id: 40535678,
              transactionId: 314788508,
              transactionEntrySequence: 1,
              calendarDate: '2021-02-04',
              payTypeCode: 'MATERNAL',
              eventId: null,
              payAmount: 100,
              pieceWork: 0,
              bonusPay: 0,
              currentBalance: 500,
              paymentDescription: 'Maternity and Child Care Pay',
            },
            {
              id: 40470372,
              transactionId: 314682694,
              transactionEntrySequence: 1,
              calendarDate: '2021-02-03',
              payTypeCode: 'SESSION',
              eventId: 150121,
              payAmount: 100,
              pieceWork: 0,
              bonusPay: 0,
              currentBalance: 400,
              paymentDescription: 'Cleaner HB1 PM',
            },
            {
              id: 40470373,
              transactionId: 314682695,
              transactionEntrySequence: 1,
              calendarDate: '2021-02-03',
              payTypeCode: 'SESSION',
              eventId: 150122,
              payAmount: 0,
              pieceWork: 0,
              bonusPay: 0,
              currentBalance: 400,
              paymentDescription: 'Unemployment pay',
            },
          ],
        },
      ])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
      prisonApi.getAgencyDetails = jest
        .fn()
        .mockResolvedValue({ description: 'Moorland', agencyId: 'MDI' })
        .mockResolvedValueOnce({ description: 'Leeds', agencyId: 'LEI' })
    })

    it('should make additional expected API calls for agency data', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
      expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith({}, 'MDI')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
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
            { text: '-£10.00' },
            { text: '£4.50' },
            { text: 'Sub-Account Transfer' },
            { text: 'Moorland' },
          ],
          [
            { text: '01/12/2020' },
            { text: '£1.00' },
            { text: '' },
            { text: '£5.00' },
            { text: 'Maternity and Child Care Pay from 04/02/2021' },
            { text: 'Leeds' },
          ],
          [
            { text: '01/12/2020' },
            { text: '£1.00' },
            { text: '' },
            { text: '£4.00' },
            { text: 'Cleaner HB1 PM from 03/02/2021' },
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

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTransactionsForDateRange' does not ex... Remove this comment to see the full error message
      expect(prisonerFinanceService.getTransactionsForDateRange).toHaveBeenCalledWith(...params)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTemplateData' does not exist on type ... Remove this comment to see the full error message
      expect(prisonerFinanceService.getTemplateData).toHaveBeenCalledWith(...params)
    })
  })

  describe('when there are errors', () => {
    it('set the redirect url and throw the error', async () => {
      const error = new Error('Network error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTransactionsForDateRange' does not ex... Remove this comment to see the full error message
      prisonerFinanceService.getTransactionsForDateRange.mockRejectedValue(error)

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
    })
  })
})
