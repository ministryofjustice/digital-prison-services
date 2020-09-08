const selectCellFactory = require('../../controllers/cellMove/selectCell')

const someOffenderNumber = 'A12345'
const someBookingId = -10
const someAgency = 'LEI'

describe('Select a cell', () => {
  const elite2Api = {}
  const whereaboutsApi = {}

  const res = { locals: {} }
  let logError
  let controller
  let req

  beforeEach(() => {
    elite2Api.getDetails = jest.fn().mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
      offenderNo: someOffenderNumber,
      bookingId: someBookingId,
      agencyId: someAgency,
      alerts: [{ expired: false, alertCode: 'PEEP' }, { expired: true, alertCode: 'DCC' }],
    })

    elite2Api.getCsraAssessments = jest.fn()
    elite2Api.getAlerts = jest.fn()
    elite2Api.getNonAssociations = jest.fn()
    elite2Api.getCellsWithCapacity = jest.fn().mockResolvedValue([])
    elite2Api.getInmatesAtLocation = jest.fn().mockResolvedValue([])
    elite2Api.getCellAttributes = jest.fn().mockResolvedValue([
      {
        description: 'Attribute 1',
        code: 'A1',
      },
    ])

    whereaboutsApi.getCellsWithCapacity = jest.fn().mockResolvedValue([])
    whereaboutsApi.searchGroups = jest.fn().mockResolvedValue([
      {
        name: 'Houseblock 1',
        key: 'hb1',
        children: [{ name: 'Sub value', key: 'sl' }],
      },
    ])

    res.render = jest.fn()
    logError = jest.fn()
    controller = selectCellFactory({ elite2Api, whereaboutsApi, logError })

    req = {
      params: {
        offenderNo: someOffenderNumber,
      },
      query: {
        location: 'ALL',
        attribute: 'A',
      },
      session: {
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
      },
    }
  })

  it('should make the correct api calls', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith({}, someOffenderNumber, true)
    expect(elite2Api.getNonAssociations).toHaveBeenCalledWith({}, someBookingId)
    expect(elite2Api.getCellAttributes).toHaveBeenCalledWith({})
    expect(whereaboutsApi.searchGroups).toHaveBeenCalledWith({}, someAgency)
  })

  it('should call get cells with capacity for leeds', async () => {
    req.query = {
      ...req.query,
      location: 'ALL',
    }
    await controller(req, res)

    expect(elite2Api.getCellsWithCapacity).toHaveBeenCalledWith({}, someAgency, 'A')
  })

  it('should call get cells with capacity for leeds and house block 1', async () => {
    req.query = {
      ...req.query,
      location: 'hb1',
      attribute: 'A',
    }
    await controller(req, res)

    expect(whereaboutsApi.getCellsWithCapacity).toHaveBeenCalledWith(
      {},
      {
        agencyId: someAgency,
        groupName: 'hb1',
        attribute: 'A',
      }
    )
  })

  it('should populate view model with active cell move specific alerts', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/selectCell.njk',
      expect.objectContaining({
        alerts: [
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

  it('should populate view model with breadcrumbs, links and offender details', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/selectCell.njk',
      expect.objectContaining({
        alerts: [
          {
            alertCodes: ['PEEP'],
            classes: 'alert-status alert-status--disability',
            img: '/images/Disability_icon.png',
            label: 'PEEP',
          },
        ],
        breadcrumbPrisonerName: 'Doe, John',
        cellAttributes: [],
        cells: false,
        csraDetailsUrl: '/prisoner/A12345/cell-move/cell-sharing-risk-assessment-details',
        dpsUrl: 'http://localhost:3000/',
        formAction: '/prisoner/A12345/cell-move/select-cell',
        formValues: { attribute: 'A', location: 'ALL', subLocation: undefined },
        locations: [{ text: 'All locations', value: 'ALL' }, { text: 'Houseblock 1', value: 'hb1' }],
        nonAssociationLink: '/prisoner/A12345/cell-move/non-associations',
        offenderDetailsUrl: '/prisoner/A12345/cell-move/offender-details',
        offenderNo: 'A12345',
        prisonerDetails: {
          agencyId: 'LEI',
          alerts: [{ alertCode: 'PEEP', expired: false }, { alertCode: 'DCC', expired: true }],
          bookingId: -10,
          firstName: 'John',
          lastName: 'Doe',
          offenderNo: 'A12345',
        },
        selectCellRootUrl: '/prisoner/A12345/cell-move/select-cell',
        selectLocationRootUrl: '/prisoner/A12345/cell-move/select-location',
        showCsraLink: undefined,
        showNonAssociationsLink: undefined,
        subLocations: [{ text: 'No areas to select', value: '' }],
      })
    )
  })

  it('should populate view model with locations', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/selectCell.njk',
      expect.objectContaining({
        locations: [{ text: 'All locations', value: 'ALL' }, { text: 'Houseblock 1', value: 'hb1' }],
      })
    )
  })

  it('should populate view model with sub locations', async () => {
    req.query = {
      ...req.query,
      location: 'hb1',
    }
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/selectCell.njk',
      expect.objectContaining({
        subLocations: [{ text: 'Select area in residential unit', value: '' }, { text: 'Sub value', value: 'sl' }],
      })
    )
  })

  it('should render subLocations template on ajax request', async () => {
    req.xhr = true
    req.query = {
      ...req.query,
      locationId: 'hb1',
    }

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/partials/subLocationsSelect.njk',
      expect.objectContaining({
        subLocations: [{ text: 'Select area in residential unit', value: '' }, { text: 'Sub value', value: 'sl' }],
      })
    )
  })

  it('should render subLocations template on ajax request when the subLocationId is ALL', async () => {
    req.xhr = true
    req.query = {
      ...req.query,
      locationId: 'ALL',
    }

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
      ...req.query,
      location: 'hb1',
      subLocation: 'sub1',
      attribute: 'A',
    }
    await controller(req, res)

    expect(whereaboutsApi.getCellsWithCapacity).toHaveBeenCalledWith(
      {},
      {
        agencyId: someAgency,
        groupName: 'hb1_sub1',
        attribute: 'A',
      }
    )
  })

  describe('Cell view model data', () => {
    beforeEach(() => {
      elite2Api.getCellsWithCapacity.mockResolvedValue([
        {
          id: 1,
          description: 'MDI-1-3',
          capacity: 4,
          noOfOccupants: 1,
          attributes: [{ description: 'Single occupancy', code: 'SO' }, { description: 'Listener Cell', code: 'LC' }],
        },
      ])
      elite2Api.getInmatesAtLocation = jest
        .fn()
        .mockResolvedValue([
          { firstName: 'bob', lastName: 'doe', offenderNo: 'A11111' },
          { firstName: 'dave', lastName: 'doe1', offenderNo: 'A22222' },
        ])

      elite2Api.getCellsWithCapacity.mockResolvedValue([
        {
          id: 1,
          description: 'MDI-1-3',
          capacity: 4,
          noOfOccupants: 1,
          attributes: [{ description: 'Single occupancy', code: 'SO' }, { description: 'Listener Cell', code: 'LC' }],
        },
        {
          id: 2,
          description: 'MDI-1-2',
          capacity: 5,
          noOfOccupants: 1,
          attributes: [{ description: 'Special Cell', code: 'SPC' }, { description: 'Gated Cell', code: 'GC' }],
        },
        {
          id: 3,
          description: 'MDI-1-1',
          capacity: 3,
          noOfOccupants: 1,
          attributes: [{ description: 'Wheelchair Access', code: 'WA' }],
        },
      ])
    })
    it('should make the relevant calls to gather cell occupant data', async () => {
      await controller(req, res)

      expect(elite2Api.getInmatesAtLocation).toHaveBeenCalledWith({}, 1, {})
      expect(elite2Api.getInmatesAtLocation).toHaveBeenCalledWith({}, 2, {})
      expect(elite2Api.getInmatesAtLocation).toHaveBeenCalledWith({}, 3, {})
      expect(elite2Api.getAlerts).toHaveBeenCalledWith(
        {},
        {
          agencyId: 'LEI',
          offenderNumbers: ['A11111', 'A22222'],
        }
      )
    })
    it('should return the correctly formatted cell details', async () => {
      elite2Api.getInmatesAtLocation.mockImplementation((context, cellId) => {
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

      elite2Api.getAlerts.mockResolvedValue([
        { offenderNo: 'A111111', alertCode: 'PEEP' },
        { offenderNo: 'A222222', alertCode: 'XEL' },
        { offenderNo: 'A333333', alertCode: 'URS' },
      ])

      elite2Api.getCsraAssessments.mockResolvedValue([
        { offenderNo: 'A111111', assessmentCode: 'TEST', assessmentComment: 'test' },
        { offenderNo: 'A222222', assessmentCode: 'CSR', assessmentComment: 'test', classification: 'High' },
        { offenderNo: 'A333333', assessmentCode: 'CSR', assessmentComment: 'test', classification: 'Standard' },
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
                      alertCodes: ['PEEP'],
                      classes: 'alert-status alert-status--disability',
                      img: '/images/Disability_icon.png',
                      label: 'PEEP',
                    },
                  ],
                  cellId: 3,
                  csra: 'Standard',
                  csraDetailsUrl: '/prisoner/A333333/cell-move/cell-sharing-risk-assessment-details',
                  name: 'Doe3, Bob3',
                  showCsraLink: true,
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
                      alertCodes: ['PEEP'],
                      classes: 'alert-status alert-status--disability',
                      img: '/images/Disability_icon.png',
                      label: 'PEEP',
                    },
                  ],
                  cellId: 2,
                  csra: 'High',
                  csraDetailsUrl: '/prisoner/A222222/cell-move/cell-sharing-risk-assessment-details',
                  name: 'Doe2, Bob2',
                  showCsraLink: true,
                },
              ],
              spaces: 4,
              type: [{ code: 'GC', description: 'Gated Cell' }, { code: 'SPC', description: 'Special Cell' }],
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
                  cellId: 1,
                  csra: undefined,
                  csraDetailsUrl: '/prisoner/A111111/cell-move/cell-sharing-risk-assessment-details',
                  name: 'Doe1, Bob1',
                  showCsraLink: false,
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
      elite2Api.getCellsWithCapacity.mockResolvedValue([
        {
          id: 1,
          description: 'MDI-1-3',
          capacity: 4,
          noOfOccupants: 1,
          attributes: [],
        },
      ])
      elite2Api.getInmatesAtLocation.mockResolvedValue([
        {
          firstName: 'bob1',
          lastName: 'doe1',
          offenderNo: 'A111111',
          assignedLivingUnitId: 1,
        },
      ])

      elite2Api.getAlerts.mockResolvedValue([])

      elite2Api.getCsraAssessments.mockResolvedValue([
        {
          offenderNo: 'A111111',
          assessmentCode: 'CSR',
          assessmentComment: 'test',
          classification: 'High',
          assessmentDate: '1980-01-01',
        },
        {
          offenderNo: 'A111111',
          assessmentCode: 'CSR',
          assessmentComment: 'test',
          classification: 'Standard',
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
                  alerts: [
                    {
                      alertCodes: ['PEEP'],
                      classes: 'alert-status alert-status--disability',
                      img: '/images/Disability_icon.png',
                      label: 'PEEP',
                    },
                  ],
                  cellId: 1,
                  csra: 'High',
                  csraDetailsUrl: '/prisoner/A111111/cell-move/cell-sharing-risk-assessment-details',
                  name: 'Doe1, Bob1',
                  showCsraLink: true,
                },
              ],
              spaces: 3,
              type: false,
            },
          ],
        })
      )
    })
  })
})
