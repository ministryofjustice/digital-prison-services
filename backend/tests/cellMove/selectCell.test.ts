import selectCellFactory from '../../controllers/cellMove/selectCell'

const someOffenderNumber = 'A12345'
const someBookingId = -10
const someAgency = 'LEI'

describe('Select a cell', () => {
  const prisonApi = {
    userCaseLoads: jest.fn(),
    getDetails: jest.fn(),
    getCsraAssessments: jest.fn(),
    getAlerts: jest.fn(),
    getLocation: jest.fn(),
    getCellsWithCapacity: jest.fn(),
    getInmatesAtLocation: jest.fn(),
  }

  const nonAssociationsApi = {
    getNonAssociationsLegacy: jest.fn(),
  }

  const whereaboutsApi = {
    getCellsWithCapacity: jest.fn(),
    searchGroups: jest.fn(),
  }
  const oauthApi = {
    userRoles: jest.fn(),
  }
  const systemOauthClient = {
    getClientCredentialsTokens: jest.fn(),
  }

  const res = { locals: {}, render: jest.fn() }
  let controller
  let req

  const cellLocationData = {
    parentLocationId: 2,
  }

  const parentLocationData = {
    parentLocationId: 3,
  }

  const superParentLocationData = {
    locationPrefix: 'MDI-1',
  }

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1594900800000) // Thursday, 16 July 2020 12:00:00
  })

  afterAll(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  beforeEach(() => {
    oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'CELL_MOVE' }])
    prisonApi.userCaseLoads = jest.fn().mockResolvedValue([{ caseLoadId: 'LEI' }])
    prisonApi.getDetails = jest.fn().mockImplementation((_, offenderNo) => ({
      firstName: 'John',
      lastName: 'Doe',
      offenderNo,
      bookingId: someBookingId,
      agencyId: someAgency,
      alerts: [
        { expired: false, alertCode: 'PEEP' },
        { expired: true, alertCode: 'DCC' },
        { expired: false, alertCode: 'HA' },
        { expired: false, alertCode: 'HA1' },
      ],
      assignedLivingUnit: {
        agencyId: someAgency,
        locationId: 12345,
        description: '1-2-012',
        agencyName: 'ye olde prisone',
      },
    }))

    prisonApi.getCsraAssessments = jest.fn()
    prisonApi.getAlerts = jest.fn()
    nonAssociationsApi.getNonAssociationsLegacy = jest.fn()
    prisonApi.getLocation = jest.fn().mockResolvedValue({})
    prisonApi.getCellsWithCapacity = jest.fn().mockResolvedValue([])
    prisonApi.getInmatesAtLocation = jest.fn().mockResolvedValue([])

    whereaboutsApi.getCellsWithCapacity = jest.fn().mockResolvedValue([])
    whereaboutsApi.searchGroups = jest.fn().mockResolvedValue([
      {
        name: 'Houseblock 1',
        key: 'hb1',
        children: [{ name: 'Sub value', key: 'sl' }],
      },
    ])

    res.render = jest.fn()
    controller = selectCellFactory({ oauthApi, systemOauthClient, prisonApi, whereaboutsApi, nonAssociationsApi })

    req = {
      params: {
        offenderNo: someOffenderNumber,
      },
      query: {},
      session: {
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
      },
    }
  })

  describe('Default page state', () => {
    it('should make the correct api calls to display default data', async () => {
      await controller(req, res)

      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, someOffenderNumber, true)
      expect(nonAssociationsApi.getNonAssociationsLegacy).toHaveBeenCalledWith({}, someOffenderNumber)
      expect(whereaboutsApi.searchGroups).toHaveBeenCalledWith({}, someAgency)
    })

    it('Redirects when offender not in user caseloads', async () => {
      prisonApi.userCaseLoads = jest.fn().mockResolvedValue([{ caseLoadId: 'BWY' }])
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/prisoner-search' })
    })

    it('should call get cells with capacity for leeds', async () => {
      await controller(req, res)

      expect(prisonApi.getCellsWithCapacity).toHaveBeenCalledWith({}, someAgency)
    })

    it('should call get cells with capacity for leeds and house block 1', async () => {
      req.query = { location: 'hb1' }

      await controller(req, res)

      expect(whereaboutsApi.getCellsWithCapacity).toHaveBeenCalledWith(
        {},
        {
          agencyId: someAgency,
          groupName: 'hb1',
        }
      )
    })

    it('should populate view model with active cell move specific alerts', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          alerts: [
            { alertCodes: ['HA'], classes: 'alert-status alert-status--acct', label: 'ACCT open' },
            {
              alertCodes: ['HA1'],
              classes: 'alert-status alert-status--acct-post-closure',
              label: 'ACCT post closure',
            },
            {
              alertCodes: ['PEEP'],
              classes: 'alert-status alert-status--disability',
              img: '/images/Disability_icon.png',
              label: 'PEEP',
            },
          ],
        })
      )
    })

    it('should populate view model with form values', async () => {
      req.query = { cellType: 'SO' }
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          formValues: { cellType: 'SO', location: 'ALL', subLocation: undefined },
        })
      )
    })

    it('should populate view model with urls', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          backUrl: '/prisoner/A12345/cell-move/search-for-cell',
          csraDetailsUrl: '/prisoner/A12345/cell-move/cell-sharing-risk-assessment-details',
          formAction: '/prisoner/A12345/cell-move/select-cell',
          nonAssociationLink: '/prisoner/A12345/cell-move/non-associations',
          offenderDetailsUrl: '/prisoner/A12345/cell-move/prisoner-details',
          searchForCellRootUrl: '/prisoner/A12345/cell-move/search-for-cell',
          selectCellRootUrl: '/prisoner/A12345/cell-move/select-cell',
          showNonAssociationsLink: false,
        })
      )
    })

    it('should populate view model with breadcrumbs offender details', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          breadcrumbPrisonerName: 'Doe, John',
          prisonerName: 'John Doe',
          offenderNo: 'A12345',
          prisonerDetails: {
            agencyId: 'LEI',
            alerts: [
              { alertCode: 'PEEP', expired: false },
              { alertCode: 'DCC', expired: true },
              { alertCode: 'HA', expired: false },
              { alertCode: 'HA1', expired: false },
            ],
            bookingId: -10,
            firstName: 'John',
            lastName: 'Doe',
            offenderNo: 'A12345',
            assignedLivingUnit: {
              agencyId: someAgency,
              locationId: 12345,
              description: '1-2-012',
              agencyName: 'ye olde prisone',
            },
          },
        })
      )
    })

    it('should populate view model with locations', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          locations: [
            { text: 'All residential units', value: 'ALL' },
            { text: 'Houseblock 1', value: 'hb1' },
          ],
        })
      )
    })

    it('should populate view model with sub locations', async () => {
      req.query = { location: 'hb1' }
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          subLocations: [
            { text: 'Select area in residential unit', value: '' },
            { text: 'Sub value', value: 'sl' },
          ],
        })
      )
    })

    it('should render subLocations template on ajax request', async () => {
      req.xhr = true
      req.query = { locationId: 'hb1' }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/partials/subLocationsSelect.njk',
        expect.objectContaining({
          subLocations: [
            { text: 'Select area in residential unit', value: '' },
            { text: 'Sub value', value: 'sl' },
          ],
        })
      )
    })

    it('should render subLocations template on ajax request when the subLocationId is ALL', async () => {
      req.xhr = true
      req.query = { locationId: 'ALL' }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/partials/subLocationsSelect.njk',
        expect.objectContaining({
          subLocations: [{ text: 'No areas to select', value: '' }],
        })
      )
    })

    it('should make a call to retrieve sub locations', async () => {
      req.query = {
        location: 'hb1',
        subLocation: 'sub1',
        cellType: 'SO',
      }
      await controller(req, res)

      expect(whereaboutsApi.getCellsWithCapacity).toHaveBeenCalledWith(
        {},
        {
          agencyId: someAgency,
          groupName: 'hb1_sub1',
        }
      )
    })
  })

  describe('Cell types', () => {
    beforeEach(() => {
      prisonApi.getCellsWithCapacity.mockResolvedValue([
        {
          id: 1,
          description: 'MDI-1-1',
          capacity: 1,
          noOfOccupants: 0,
          attributes: [
            { description: 'Single occupancy', code: 'SO' },
            { description: 'Listener Cell', code: 'LC' },
          ],
        },
        {
          id: 2,
          description: 'MDI-1-2',
          capacity: 2,
          noOfOccupants: 0,
          attributes: [
            { description: 'Special Cell', code: 'SPC' },
            { description: 'Gated Cell', code: 'GC' },
          ],
        },
      ])
    })

    describe('when Single occupancy cell type is selected', () => {
      it('should only show cells with a capacity of 1', async () => {
        req.query = { cellType: 'SO' }

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'cellMove/selectCell.njk',
          expect.objectContaining({
            cells: [
              {
                attributes: [
                  { code: 'LC', description: 'Listener Cell' },
                  { code: 'SO', description: 'Single occupancy' },
                ],
                capacity: 1,
                description: 'MDI-1-1',
                id: 1,
                noOfOccupants: 0,
                occupants: [],
                spaces: 1,
                type: [
                  { code: 'LC', description: 'Listener Cell' },
                  { code: 'SO', description: 'Single occupancy' },
                ],
              },
            ],
          })
        )
      })
    })

    describe('when Multiple occupancy cell type is selected', () => {
      it('should only show cells with a capacity of 2 or more', async () => {
        req.query = { cellType: 'MO' }

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'cellMove/selectCell.njk',
          expect.objectContaining({
            cells: [
              {
                attributes: [
                  { code: 'GC', description: 'Gated Cell' },
                  { code: 'SPC', description: 'Special Cell' },
                ],
                capacity: 2,
                description: 'MDI-1-2',
                id: 2,
                noOfOccupants: 0,
                occupants: [],
                spaces: 2,
                type: [
                  { code: 'GC', description: 'Gated Cell' },
                  { code: 'SPC', description: 'Special Cell' },
                ],
              },
            ],
          })
        )
      })
    })
  })

  describe('Cell view model data', () => {
    beforeEach(() => {
      prisonApi.getLocation
        .mockResolvedValueOnce(cellLocationData)
        .mockResolvedValueOnce(parentLocationData)
        .mockResolvedValueOnce(superParentLocationData)
      prisonApi.getInmatesAtLocation = jest.fn().mockResolvedValue([
        { firstName: 'bob', lastName: 'doe', offenderNo: 'A11111' },
        { firstName: 'dave', lastName: 'doe1', offenderNo: 'A22222' },
      ])

      prisonApi.getCellsWithCapacity.mockResolvedValue([
        {
          id: 1,
          description: 'MDI-1-3',
          capacity: 4,
          noOfOccupants: 1,
          attributes: [
            { description: 'Single occupancy', code: 'SO' },
            { description: 'Listener Cell', code: 'LC' },
          ],
        },
        {
          id: 2,
          description: 'MDI-1-2',
          capacity: 5,
          noOfOccupants: 1,
          attributes: [
            { description: 'Special Cell', code: 'SPC' },
            { description: 'Gated Cell', code: 'GC' },
          ],
        },
        {
          id: 3,
          description: 'MDI-1-1',
          capacity: 3,
          noOfOccupants: 1,
          attributes: [{ description: 'Wheelchair Access', code: 'WA' }],
        },
      ])
      systemOauthClient.getClientCredentialsTokens.mockResolvedValue({})
    })
    it('should make the relevant calls to gather cell occupant data', async () => {
      await controller(req, res)

      expect(prisonApi.getInmatesAtLocation).toHaveBeenCalledWith({}, 1, {})
      expect(prisonApi.getInmatesAtLocation).toHaveBeenCalledWith({}, 2, {})
      expect(prisonApi.getInmatesAtLocation).toHaveBeenCalledWith({}, 3, {})
      expect(prisonApi.getAlerts).toHaveBeenCalledWith(
        {},
        {
          agencyId: 'LEI',
          offenderNumbers: ['A11111', 'A22222'],
        }
      )
    })

    it('should return the correctly formatted cell details', async () => {
      prisonApi.getInmatesAtLocation.mockImplementation((context, cellId) => {
        if (cellId === 1)
          return Promise.resolve([
            {
              firstName: 'bob1',
              lastName: 'doe1',
              offenderNo: 'A111111',
              assignedLivingUnitId: cellId,
            },
          ])
        if (cellId === 2)
          return Promise.resolve([
            {
              firstName: 'bob2',
              lastName: 'doe2',
              offenderNo: 'A222222',
              assignedLivingUnitId: cellId,
            },
          ])

        return Promise.resolve([
          {
            firstName: 'bob3',
            lastName: 'doe3',
            offenderNo: 'A333333',
            assignedLivingUnitId: cellId,
          },
        ])
      })

      prisonApi.getAlerts.mockResolvedValue([
        { offenderNo: 'A111111', alertCode: 'PEEP' },
        { offenderNo: 'A222222', alertCode: 'XEL' },
        { offenderNo: 'A333333', alertCode: 'URS' },
      ])

      prisonApi.getCsraAssessments.mockResolvedValue([
        { offenderNo: 'A111111', assessmentDescription: 'TEST', assessmentCode: 'TEST', assessmentComment: 'test' },
        {
          offenderNo: 'A222222',
          assessmentDescription: 'CSR',
          assessmentCode: 'CSR',
          assessmentComment: 'test',
          classification: 'High',
          classificationCode: 'HI',
        },
        {
          offenderNo: 'A333333',
          assessmentDescription: 'CSR',
          assessmentCode: 'CSR',
          assessmentComment: 'test',
          classification: 'Standard',
          classificationCode: 'STANDARD',
        },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          cells: [
            {
              attributes: [{ code: 'WA', description: 'Wheelchair Access' }],
              capacity: 3,
              description: 'MDI-1-1',
              id: 3,
              noOfOccupants: 1,
              occupants: [
                {
                  alerts: [
                    {
                      alertCodes: ['URS'],
                      classes: 'alert-status alert-status--refusing-to-shield',
                      label: 'Refusing to shield',
                    },
                  ],
                  nonAssociation: false,
                  cellId: 3,
                  csra: 'Standard',
                  csraDetailsUrl: '/prisoner/A333333/cell-move/cell-sharing-risk-assessment-details',
                  name: 'Doe3, Bob3',
                  viewOffenderDetails: '/prisoner/A333333/cell-move/prisoner-details',
                },
              ],
              spaces: 2,
              type: [{ code: 'WA', description: 'Wheelchair Access' }],
            },
            {
              attributes: [
                { code: 'GC', description: 'Gated Cell' },
                {
                  code: 'SPC',
                  description: 'Special Cell',
                },
              ],
              capacity: 5,
              description: 'MDI-1-2',
              id: 2,
              noOfOccupants: 1,
              occupants: [
                {
                  alerts: [
                    {
                      alertCodes: ['XEL'],
                      classes: 'alert-status alert-status--elist',
                      label: 'E-list',
                    },
                  ],
                  nonAssociation: false,
                  cellId: 2,
                  csra: 'High',
                  csraDetailsUrl: '/prisoner/A222222/cell-move/cell-sharing-risk-assessment-details',
                  name: 'Doe2, Bob2',
                  viewOffenderDetails: '/prisoner/A222222/cell-move/prisoner-details',
                },
              ],
              spaces: 4,
              type: [
                { code: 'GC', description: 'Gated Cell' },
                { code: 'SPC', description: 'Special Cell' },
              ],
            },
            {
              attributes: [
                { code: 'LC', description: 'Listener Cell' },
                {
                  code: 'SO',
                  description: 'Single occupancy',
                },
              ],
              capacity: 4,
              description: 'MDI-1-3',
              id: 1,
              noOfOccupants: 1,
              occupants: [
                {
                  alerts: [
                    {
                      alertCodes: ['PEEP'],
                      classes: 'alert-status alert-status--disability',
                      img: '/images/Disability_icon.png',
                      label: 'PEEP',
                    },
                  ],
                  nonAssociation: false,
                  cellId: 1,
                  csra: 'Not entered',
                  csraDetailsUrl: '/prisoner/A111111/cell-move/cell-sharing-risk-assessment-details',
                  name: 'Doe1, Bob1',
                  viewOffenderDetails: '/prisoner/A111111/cell-move/prisoner-details',
                },
              ],
              spaces: 3,
              type: [
                { code: 'LC', description: 'Listener Cell' },
                {
                  code: 'SO',
                  description: 'Single occupancy',
                },
              ],
            },
          ],
        })
      )
    })

    it('should select the latest csra rating for each occupant', async () => {
      prisonApi.getCellsWithCapacity.mockResolvedValue([
        {
          id: 1,
          description: 'MDI-1-3',
          capacity: 4,
          noOfOccupants: 1,
          attributes: [],
        },
      ])
      prisonApi.getInmatesAtLocation.mockResolvedValue([
        {
          firstName: 'bob1',
          lastName: 'doe1',
          offenderNo: 'A111111',
          assignedLivingUnitId: 1,
        },
      ])

      prisonApi.getAlerts.mockResolvedValue([])

      prisonApi.getCsraAssessments.mockResolvedValue([
        {
          offenderNo: 'A111111',
          assessmentCode: 'CSR',
          assessmentDescription: 'CSR',
          assessmentComment: 'test',
          classification: 'High',
          classificationCode: 'HI',
          assessmentDate: '1980-01-01',
        },
        {
          offenderNo: 'A111111',
          assessmentCode: 'CSR',
          assessmentDescription: 'CSR',
          assessmentComment: 'test',
          classification: 'Standard',
          classificationCode: 'STANDARD',
          assessmentDate: '2020-01-01',
        },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          cells: [
            {
              attributes: [],
              capacity: 4,
              description: 'MDI-1-3',
              id: 1,
              noOfOccupants: 1,
              occupants: [
                {
                  alerts: [],
                  nonAssociation: false,
                  cellId: 1,
                  csra: 'High',
                  csraDetailsUrl: '/prisoner/A111111/cell-move/cell-sharing-risk-assessment-details',
                  name: 'Doe1, Bob1',
                  viewOffenderDetails: '/prisoner/A111111/cell-move/prisoner-details',
                },
              ],
              spaces: 3,
              type: false,
            },
          ],
        })
      )
    })

    it('should not make a call for assessments or alerts when there are no cell occupants', async () => {
      prisonApi.getCellsWithCapacity.mockResolvedValue([
        {
          id: 1,
          description: 'MDI-1-3',
          capacity: 4,
          noOfOccupants: 1,
          attributes: [],
        },
      ])
      prisonApi.getInmatesAtLocation.mockResolvedValue([])

      await controller(req, res)

      expect(prisonApi.getCsraAssessments.mock.calls.length).toBe(0)
      expect(prisonApi.getAlerts.mock.calls.length).toBe(0)
    })
  })

  describe('Non associations', () => {
    beforeEach(() => {
      nonAssociationsApi.getNonAssociationsLegacy = jest.fn().mockResolvedValue({
        offenderNo: 'G6123VU',
        firstName: 'JOHN',
        lastName: 'SAUNDERS',
        agencyDescription: 'MOORLAND (HMP & YOI)',
        assignedLivingUnitDescription: 'MDI-1-1-015',
        nonAssociations: [
          {
            reasonCode: 'RIV',
            reasonDescription: 'Rival Gang',
            typeCode: 'LAND',
            typeDescription: 'Do Not Locate on Same Landing',
            effectiveDate: '2020-06-17T00:00:00',
            expiryDate: '2020-07-17T00:00:00',
            comments: 'Gang violence',
            offenderNonAssociation: {
              offenderNo: 'A111111',
              firstName: 'bob1',
              lastName: 'doe1',
              reasonCode: 'RIV',
              reasonDescription: 'Rival Gang',
              agencyDescription: 'MOORLAND (HMP & YOI)',
              assignedLivingUnitDescription: 'MDI-1-3-026',
            },
          },
        ],
      })

      prisonApi.getCellsWithCapacity.mockResolvedValue([
        {
          id: 1,
          description: 'MDI-1-3',
          capacity: 4,
          noOfOccupants: 1,
          attributes: [],
        },
      ])
      prisonApi.getInmatesAtLocation.mockResolvedValue([
        {
          firstName: 'bob1',
          lastName: 'doe1',
          offenderNo: 'A111111',
          assignedLivingUnitId: 1,
        },
      ])
      prisonApi.getAlerts.mockResolvedValue([])
      prisonApi.getCsraAssessments.mockResolvedValue([])

      req.query = {
        location: 'Houseblock 1',
      }
    })

    it('should render the template with the correct number of non associations', async () => {
      req.query = { location: 'ALL' }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          numberOfNonAssociations: 1,
          showNonAssociationsLink: true,
        })
      )
    })

    it('should mark an occupant with the no association badge', async () => {
      req.query = { location: 'ALL' }

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          cells: [
            {
              attributes: [],
              capacity: 4,
              description: 'MDI-1-3',
              id: 1,
              noOfOccupants: 1,
              occupants: [
                {
                  alerts: [],
                  nonAssociation: true,
                  cellId: 1,
                  csra: 'Not entered',
                  csraDetailsUrl: '/prisoner/A111111/cell-move/cell-sharing-risk-assessment-details',
                  name: 'Doe1, Bob1',
                  viewOffenderDetails: '/prisoner/A111111/cell-move/prisoner-details',
                },
              ],
              spaces: 3,
              type: false,
            },
          ],
        })
      )
    })

    it('should not request the location prefix when there are no non-associations', async () => {
      nonAssociationsApi.getNonAssociationsLegacy = jest.fn().mockResolvedValue(null)
      await controller(req, res)

      expect(prisonApi.getLocation.mock.calls.length).toBe(0)
    })

    it('should set show non association value to true when there are res unit level non-associations', async () => {
      prisonApi.getLocation
        .mockResolvedValueOnce(cellLocationData)
        .mockResolvedValueOnce(parentLocationData)
        .mockResolvedValueOnce(superParentLocationData)
      whereaboutsApi.getCellsWithCapacity.mockResolvedValue([
        {
          id: 1,
          description: 'MDI-1-3',
          capacity: 4,
          noOfOccupants: 1,
          attributes: [
            { description: 'Single occupancy', code: 'SO' },
            { description: 'Listener Cell', code: 'LC' },
          ],
        },
      ])

      req.query = { location: 'Houseblock 1' }
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          showNonAssociationWarning: true,
        })
      )
    })

    it('should set show non association value to true when there are non-associations within the establishment', async () => {
      prisonApi.userCaseLoads = jest.fn().mockResolvedValue([{ caseLoadId: 'MDI' }])
      prisonApi.getDetails = jest.fn().mockImplementation((_, offenderNo) => ({
        firstName: 'John',
        lastName: 'Doe',
        offenderNo,
        bookingId: someBookingId,
        agencyId: 'MDI',
        alerts: [
          { expired: false, alertCode: 'PEEP' },
          { expired: true, alertCode: 'DCC' },
          { expired: false, alertCode: 'HA' },
          { expired: false, alertCode: 'HA1' },
        ],
        assignedLivingUnit: {
          agencyId: 'MDI',
          locationId: 12345,
          description: '1-2-012',
          agencyName: 'ye olde prisone',
        },
      }))

      req.query = {}

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          showNonAssociationWarning: true,
        })
      )
    })

    it('should set show non association value to false', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          showNonAssociationWarning: false,
        })
      )
    })

    it('should set show non association value to false when non association offender does not have assigned living unit', async () => {
      nonAssociationsApi.getNonAssociationsLegacy = jest.fn().mockResolvedValue({
        offenderNo: 'G6123VU',
        firstName: 'JOHN',
        lastName: 'SAUNDERS',
        agencyDescription: 'MOORLAND (HMP & YOI)',
        assignedLivingUnitDescription: 'MDI-1-1-015',
        nonAssociations: [
          {
            reasonCode: 'RIV',
            reasonDescription: 'Rival Gang',
            typeCode: 'LAND',
            typeDescription: 'Do Not Locate on Same Landing',
            effectiveDate: '2020-06-17T00:00:00',
            expiryDate: '2020-07-17T00:00:00',
            comments: 'Gang violence',
            offenderNonAssociation: {
              offenderNo: 'A111111',
              firstName: 'bob1',
              lastName: 'doe1',
              reasonCode: 'RIV',
              reasonDescription: 'Rival Gang',
              agencyDescription: 'OUTSIDE',
            },
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          showNonAssociationWarning: false,
        })
      )
    })
  })

  describe('Current location is not a cell', () => {
    it('shows the CSWAP description as the location', async () => {
      prisonApi.userCaseLoads = jest.fn().mockResolvedValue([{ caseLoadId: 'MDI' }])
      prisonApi.getDetails = jest.fn().mockResolvedValue({
        firstName: 'John',
        lastName: 'Doe',
        offenderNo: someOffenderNumber,
        bookingId: someBookingId,
        agencyId: 'MDI',
        alerts: [],
        assignedLivingUnit: {
          description: 'CSWAP',
        },
      })

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectCell.njk',
        expect.objectContaining({
          prisonerDetails: {
            agencyId: 'MDI',
            alerts: [],
            bookingId: -10,
            firstName: 'John',
            lastName: 'Doe',
            offenderNo: 'A12345',
            assignedLivingUnit: {
              description: 'No cell allocated',
            },
          },
        })
      )
    })
  })
})
