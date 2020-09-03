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
    elite2Api.getNonAssociations = jest.fn()
    elite2Api.getCellsWithCapacity = jest.fn()
    whereaboutsApi.getCellsWithCapacity = jest.fn()
    elite2Api.getCellAttributes = jest.fn().mockResolvedValue([
      {
        description: 'Attribute 1',
        code: 'A1',
      },
    ])
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

  it('should populate view model with active cell move specific ones', async () => {
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
        breadcrumbPrisonerName: 'Doe, John',
        cellAttributes: [],
        cells: undefined,
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

  it('should return the correctly formatted cell details', async () => {
    elite2Api.getCellsWithCapacity.mockResolvedValue([
      {
        description: 'MDI-1-3',
        capacity: 4,
        noOfOccupants: 1,
        attributes: [{ description: 'Single occupancy', code: 'SO' }, { description: 'Listener Cell', code: 'LC' }],
      },
      {
        description: 'MDI-1-2',
        capacity: 5,
        noOfOccupants: 1,
        attributes: [{ description: 'Special Cell', code: 'SPC' }, { description: 'Gated Cell', code: 'GC' }],
      },
      {
        description: 'MDI-1-1',
        capacity: 3,
        noOfOccupants: 1,
        attributes: [{ description: 'Wheelchair Access', code: 'WA' }],
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
            noOfOccupants: 1,
            spaces: 2,
            type: [{ code: 'WA', description: 'Wheelchair Access' }],
          },
          {
            attributes: [{ code: 'GC', description: 'Gated Cell' }, { code: 'SPC', description: 'Special Cell' }],
            capacity: 5,
            description: 'MDI-1-2',
            noOfOccupants: 1,
            spaces: 4,
            type: [{ code: 'GC', description: 'Gated Cell' }, { code: 'SPC', description: 'Special Cell' }],
          },
          {
            attributes: [{ code: 'LC', description: 'Listener Cell' }, { code: 'SO', description: 'Single occupancy' }],
            capacity: 4,
            description: 'MDI-1-3',
            noOfOccupants: 1,
            spaces: 3,
            type: [{ code: 'LC', description: 'Listener Cell' }, { code: 'SO', description: 'Single occupancy' }],
          },
        ],
      })
    )
  })
})
