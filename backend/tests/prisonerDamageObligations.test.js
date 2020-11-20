const prisonerDamageObligations = require('../controllers/prisonerProfile/prisonerFinances/prisonerDamageObligations')

describe('Prisoner damage obligations', () => {
  const offenderNo = 'ABC123'
  const bookingId = 1
  const prisonApi = {}

  let req
  let res
  let logError
  let controller

  const damageObligationsResponse = {
    damageObligations: [
      {
        id: 1,
        offenderNo,
        referenceNumber: '123',
        startDateTime: '2018-11-10T00:00:00',
        endDateTime: '2020-12-10T00:00:00',
        prisonId: 'MDI',
        amountToPay: 300,
        amountPaid: 85.41,
        status: 'ACTIVE',
        comment: 'Damage of Pool table',
        currency: 'GBP',
      },
      {
        id: 2,
        offenderNo,
        referenceNumber: '456',
        startDateTime: '2019-01-10T00:00:00',
        endDateTime: '2020-01-10T00:00:00',
        prisonId: 'LEI',
        amountToPay: 100,
        amountPaid: 40,
        status: 'ACTIVE',
        currency: 'GBP',
      },
      {
        id: 3,
        offenderNo,
        referenceNumber: '789',
        startDateTime: '2018-11-10T00:00:00',
        endDateTime: '2022-12-10T00:00:00',
        prisonId: 'MDI',
        amountToPay: 200,
        amountPaid: 200,
        status: 'INACTIVE',
        comment: 'Damage to cell',
        currency: 'GBP',
      },
    ],
  }

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
    }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    prisonApi.getOffenderDamageObligations = jest.fn().mockResolvedValue({ damageObligations: [] })
    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    prisonApi.getAgencyDetails = jest.fn()

    controller = prisonerDamageObligations({ prisonApi, logError })
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    expect(prisonApi.getOffenderDamageObligations).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getAgencyDetails).not.toHaveBeenCalled()
  })

  it('should render the template with the correct data', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerFinance/damageObligations.njk', {
      dpsUrl: 'http://localhost:3000/',
      prisoner: {
        nameForBreadcrumb: 'Smith, John',
        name: 'John Smith',
        offenderNo,
      },
      rows: [],
      totalOwed: '£0.00',
    })
  })

  describe('with data', () => {
    beforeEach(() => {
      prisonApi.getOffenderDamageObligations.mockResolvedValue(damageObligationsResponse)
      prisonApi.getAgencyDetails
        .mockResolvedValueOnce({ description: 'Leeds', agencyId: 'LEI' })
        .mockResolvedValueOnce({ description: 'Moorland', agencyId: 'MDI' })
    })

    it('should render the correct template with the correct data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerFinance/damageObligations.njk', {
        dpsUrl: 'http://localhost:3000/',
        prisoner: {
          nameForBreadcrumb: 'Smith, John',
          name: 'John Smith',
          offenderNo,
        },
        rows: [
          [
            { text: 2 },
            { text: '456' },
            { text: '10/01/2019 to 10/01/2020' },
            { text: '£100.00' },
            { text: '£40.00' },
            { text: '£60.00' },
            { text: 'Leeds' },
          ],
          [
            { text: 1 },
            { text: '123' },
            { text: '10/11/2018 to 10/12/2020' },
            { text: '£300.00' },
            { text: '£85.41' },
            { text: '£214.59' },
            { text: 'Moorland - Damage of Pool table' },
          ],
        ],
        totalOwed: '£274.59',
      })
    })
  })

  describe('when there are errors', () => {
    it('should render the error template with a link to the prisoner profile if there is a problem retrieving prisoner details', async () => {
      prisonApi.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

      await controller(req, res)

      expect(logError).toHaveBeenCalledWith(
        req.originalUrl,
        new Error('Network error'),
        'Damage obligations page - Prisoner finances'
      )
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: `/prisoner/${offenderNo}` })
    })

    it('should render the error template with a link to the prisoner profile if there is a problem retrieving agency details', async () => {
      prisonApi.getOffenderDamageObligations.mockResolvedValue(damageObligationsResponse)
      prisonApi.getAgencyDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

      await controller(req, res)

      expect(logError).toHaveBeenCalledWith(
        req.originalUrl,
        new Error('Network error'),
        'Damage obligations page - Prisoner finances'
      )
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: `/prisoner/${offenderNo}` })
    })
  })
})
