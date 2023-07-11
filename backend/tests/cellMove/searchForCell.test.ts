import moment from 'moment'
import searchForCell from '../../controllers/cellMove/searchForCell'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

describe('select location', () => {
  let req
  let res
  let controller

  const prisonApi = {
    getDetails: jest.fn(),
    userCaseLoads: jest.fn(),
  }

  const nonAssociationsApi = {
    getNonAssociations: jest.fn(),
  }

  const whereaboutsApi = {
    searchGroups: jest.fn(),
  }
  const oauthApi = {
    userRoles: jest.fn(),
  }

  const offenderNo = 'ABC123'

  const getDetailsResponse = {
    bookingId: 1234,
    offenderNo,
    firstName: 'Test',
    lastName: 'User',
    csra: 'High',
    csraClassificationCode: 'HI',
    agencyId: 'MDI',
    assessments: [],
    assignedLivingUnit: {},
    alerts: [
      {
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
        alertCode: 'XC',
        alertCodeDescription: 'Risk to females',
        alertId: 1,
        alertType: 'X',
        alertTypeDescription: 'Security',
        bookingId: 14,
        comment: 'has a large poster on cell wall',
        dateCreated: '2019-08-20',
        dateExpires: null,
        expired: false,
        expiredByFirstName: 'John',
        expiredByLastName: 'Smith',
        offenderNo,
      },
      {
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
        alertCode: 'XGANG',
        alertCodeDescription: 'Gang member',
        alertId: 1,
        alertType: 'X',
        alertTypeDescription: 'Security',
        bookingId: 14,
        comment: 'has a large poster on cell wall',
        dateCreated: '2019-08-20',
        dateExpires: null,
        expired: false,
        expiredByFirstName: 'John',
        expiredByLastName: 'Smith',
        offenderNo,
      },
      {
        alertId: 3,
        alertType: 'V',
        alertTypeDescription: 'Vulnerability',
        alertCode: 'VIP',
        alertCodeDescription: 'Isolated Prisoner',
        comment: 'test',
        dateCreated: '2020-08-20',
        expired: false,
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
      },
      {
        alertId: 4,
        alertType: 'H',
        alertTypeDescription: 'Self Harm',
        alertCode: 'HA',
        alertCodeDescription: 'ACCT open',
        comment: 'Test comment',
        dateCreated: '2021-02-18',
        expired: false,
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
      },
      {
        alertId: 5,
        alertType: 'H',
        alertTypeDescription: 'Self Harm',
        alertCode: 'HA1',
        alertCodeDescription: 'ACCT post closure',
        comment: '',
        dateCreated: '2021-02-19',
        expired: false,
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
      },
    ],
  }

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    prisonApi.getDetails = jest.fn().mockResolvedValue(getDetailsResponse)
    nonAssociationsApi.getNonAssociations = jest.fn().mockResolvedValue({ nonAssociations: [] })

    whereaboutsApi.searchGroups = jest.fn().mockResolvedValue([
      { name: 'Casu', key: 'Casu', children: [] },
      {
        name: 'Houseblock 1',
        key: 'Houseblock 1',
        children: [],
      },
      {
        name: 'Houseblock 2',
        key: 'Houseblock 2',
      },
      {
        name: 'Houseblock 3',
        key: 'Houseblock 3',
        children: [],
      },
    ])

    oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'CELL_MOVE' }])
    prisonApi.userCaseLoads = jest.fn().mockResolvedValue([{ caseLoadId: 'MDI' }])

    controller = searchForCell({ oauthApi, prisonApi, whereaboutsApi, nonAssociationsApi })
  })

  it('Makes the expected API calls', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo, true)
    expect(nonAssociationsApi.getNonAssociations).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(whereaboutsApi.searchGroups).toHaveBeenCalledWith(res.locals, 'MDI')
  })

  it('Redirects when offender not in user caseloads', async () => {
    prisonApi.userCaseLoads = jest.fn().mockResolvedValue([{ caseLoadId: 'BWY' }])
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/prisoner-search' })
  })

  it('Should render error template when there is an API error', async () => {
    const error = new Error('Network error')
    prisonApi.getDetails.mockImplementation(() => Promise.reject(error))

    await expect(controller(req, res)).rejects.toThrowError(error)

    expect(res.locals.homeUrl).toBe(`/prisoner/${offenderNo}`)
  })

  describe('Header data', () => {
    it('populates the data correctly when no non-associations and no assessments', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/searchForCell.njk',
        expect.objectContaining({
          prisonerDetails: getDetailsResponse,
          breadcrumbPrisonerName: 'User, Test',
          prisonerName: 'Test User',
          numberOfNonAssociations: 0,
          showNonAssociationsLink: false,
          alerts: [
            { alertCodes: ['HA'], classes: 'alert-status alert-status--acct', label: 'ACCT open' },
            {
              alertCodes: ['HA1'],
              classes: 'alert-status alert-status--acct-post-closure',
              label: 'ACCT post closure',
            },
            { alertCodes: ['XGANG'], classes: 'alert-status alert-status--gang-member', label: 'Gang member' },
            { alertCodes: ['VIP'], classes: 'alert-status alert-status--isolated-prisoner', label: 'Isolated' },
          ],
          offenderNo,
        })
      )
    })

    it('shows the CSWAP description as the location', async () => {
      prisonApi.getDetails = jest.fn().mockResolvedValue({
        ...getDetailsResponse,
        assignedLivingUnit: {
          ...getDetailsResponse.assignedLivingUnit,
          description: 'CSWAP',
        },
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/searchForCell.njk',
        expect.objectContaining({
          prisonerDetails: {
            ...getDetailsResponse,
            assignedLivingUnit: {
              ...getDetailsResponse.assignedLivingUnit,
              description: 'No cell allocated',
            },
          },
        })
      )
    })

    it('shows the correct CSRA rating', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/searchForCell.njk',
        expect.objectContaining({
          convertedCsra: 'High',
        })
      )
    })

    it('populates the data correctly when some non-associations, but not in the same establishment', async () => {
      nonAssociationsApi.getNonAssociations = jest.fn().mockResolvedValue({
        agencyDescription: 'MOORLAND',
        nonAssociations: [
          {
            offenderNonAssociation: {
              agencyDescription: 'LEEDS',
            },
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/searchForCell.njk',
        expect.objectContaining({
          numberOfNonAssociations: 0,
          showNonAssociationsLink: false,
        })
      )
    })

    it('populates the data correctly when some non-associations, but not effective yet', async () => {
      nonAssociationsApi.getNonAssociations = jest.fn().mockResolvedValue({
        agencyDescription: 'MOORLAND',
        nonAssociations: [
          {
            effectiveDate: moment().add(1, 'days'),
            offenderNonAssociation: {
              agencyDescription: 'MOORLAND',
            },
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/searchForCell.njk',
        expect.objectContaining({
          numberOfNonAssociations: 0,
          showNonAssociationsLink: false,
        })
      )
    })

    it('populates the data correctly when some non-associations, but expired', async () => {
      nonAssociationsApi.getNonAssociations = jest.fn().mockResolvedValue({
        agencyDescription: 'MOORLAND',
        nonAssociations: [
          {
            effectiveDate: moment().subtract(10, 'days'),
            expiryDate: moment().subtract(1, 'days'),
            offenderNonAssociation: {
              agencyDescription: 'MOORLAND',
            },
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/searchForCell.njk',
        expect.objectContaining({
          numberOfNonAssociations: 0,
          showNonAssociationsLink: false,
        })
      )
    })

    it('populates the data correctly when some non-associations in the same establishment', async () => {
      nonAssociationsApi.getNonAssociations = jest.fn().mockResolvedValue({
        agencyDescription: 'MOORLAND',
        nonAssociations: [
          {
            effectiveDate: moment(),
            offenderNonAssociation: {
              agencyDescription: 'MOORLAND',
            },
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/searchForCell.njk',
        expect.objectContaining({
          numberOfNonAssociations: 1,
          showNonAssociationsLink: true,
        })
      )
    })

    it('populates the dropdowns correctly', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/searchForCell.njk',
        expect.objectContaining({
          locations: [
            { text: 'All residential units', value: 'ALL' },
            { text: 'Casu', value: 'Casu' },
            { text: 'Houseblock 1', value: 'Houseblock 1' },
            { text: 'Houseblock 2', value: 'Houseblock 2' },
            { text: 'Houseblock 3', value: 'Houseblock 3' },
          ],
          cellAttributes: [
            { text: 'Single occupancy', value: 'SO' },
            { text: 'Multiple occupancy', value: 'MO' },
          ],
        })
      )
    })
  })
})
