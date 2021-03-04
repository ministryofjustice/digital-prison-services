const dashboard = require('../../controllers/establishmentRoll/dashboard')

const prisonApi = {}

describe('Establishment Roll', () => {
  const logError = jest.fn()
  let controller
  const agencyId = 'LEI'
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: { user: { activeCaseLoad: { caseLoadId: 'LEI', description: 'Leeds' } } } }
  const unassignedBlockData = [
    {
      livingUnitId: 0,
      livingUnitDesc: 'Reception',
      bedsInUse: 0,
      currentlyInCell: 5,
      currentlyOut: 0,
      operationalCapacity: 0,
      netVacancies: 0,
      maximumCapacity: 0,
      availablePhysical: 0,
      outOfOrder: 0,
    },
    {
      livingUnitId: 0,
      livingUnitDesc: 'TAP',
      bedsInUse: 0,
      currentlyInCell: 3,
      currentlyOut: 0,
      operationalCapacity: 0,
      netVacancies: 0,
      maximumCapacity: 0,
      availablePhysical: 0,
      outOfOrder: 0,
    },
  ]
  const assignedBlockData = [
    {
      livingUnitId: 0,
      livingUnitDesc: 'HOUSEBLOCK 1',
      bedsInUse: 10,
      currentlyInCell: 20,
      currentlyOut: 30,
      operationalCapacity: 2,
      netVacancies: 3,
      maximumCapacity: 0,
      availablePhysical: 0,
      outOfOrder: 0,
    },
    {
      livingUnitId: 1,
      livingUnitDesc: 'HOUSEBLOCK 2',
      bedsInUse: 0,
      currentlyInCell: 0,
      currentlyOut: 0,
      operationalCapacity: 0,
      netVacancies: 0,
      maximumCapacity: 0,
      availablePhysical: 0,
      outOfOrder: 0,
    },
  ]

  const movements = {
    in: 1,
    out: 3,
  }

  beforeEach(() => {
    prisonApi.getEstablishmentRollBlocksCount = jest.fn()
    prisonApi.getEstablishmentRollMovementsCount = jest.fn()
    prisonApi.getEstablishmentRollEnrouteCount = jest.fn()
    prisonApi.getLocationsForAgency = jest.fn()
    prisonApi.getAttributesForLocation = jest.fn()

    prisonApi.getEstablishmentRollBlocksCount.mockImplementation(
      (_context, _agencyId, _unassigned) => (_unassigned ? unassignedBlockData : assignedBlockData)
    )
    prisonApi.getEstablishmentRollMovementsCount.mockImplementation(() => movements)
    prisonApi.getEstablishmentRollEnrouteCount.mockImplementation(() => 8)
    prisonApi.getLocationsForAgency.mockImplementation(() => [
      { description: '1-1', locationId: 1 },
      { description: 'CSWAP', locationId: 2 },
    ])

    controller = dashboard({ prisonApi, logError })
    res.render = jest.fn()
  })

  it('should call the correct endpoints', async () => {
    await controller(req, res)

    expect(prisonApi.getEstablishmentRollBlocksCount).toHaveBeenCalledWith(res.locals, agencyId, false)
    expect(prisonApi.getEstablishmentRollBlocksCount).toHaveBeenCalledWith(res.locals, agencyId, true)
    expect(prisonApi.getEstablishmentRollMovementsCount).toHaveBeenCalledWith(res.locals, agencyId)
    expect(prisonApi.getEstablishmentRollEnrouteCount).toHaveBeenCalledWith(res.locals, agencyId)
    expect(prisonApi.getLocationsForAgency).toHaveBeenCalledWith(res.locals, agencyId)
    expect(prisonApi.getAttributesForLocation).toHaveBeenCalledWith(res.locals, 2)
  })

  it('should render the template with the correct data', async () => {
    prisonApi.getAttributesForLocation.mockImplementation(() => ({ noOfOccupants: 3 }))

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/dashboard.njk',
      expect.objectContaining({
        rows: [
          [
            { text: 'Houseblock 1' },
            { text: 10 },
            { text: 20 },
            {
              html: '<a class="govuk-link" href="/establishment-roll/0/currently-out">30</a>',
              text: 30,
            },
            { text: 2 },
            { text: 3 },
            { text: 0 },
          ],
          [
            { text: 'Houseblock 2' },
            { text: 0 },
            { text: 0 },
            { html: false, text: 0 },
            { text: 0 },
            { text: 0 },
            { text: 0 },
          ],
          [
            { text: 'Leeds' },
            { text: 10 },
            { text: 20 },
            { html: '<a class="govuk-link" href="/establishment-roll/total-currently-out">30</a>', text: 30 },
            { text: 2 },
            { text: 3 },
            { text: 0 },
          ],
        ],
        todayStats: {
          currentRoll: 28,
          enroute: 8,
          inToday: 1,
          outToday: 3,
          unassignedIn: 8,
          unlockRoll: 30,
          noCellAllocated: 3,
        },
      })
    )
  })

  it('should default to zero when data is undefined for blocks and totals', async () => {
    prisonApi.getEstablishmentRollBlocksCount.mockReturnValue([{ livingUnitDesc: 'livingUnitDesc1', bedsInUse: 100 }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/dashboard.njk',
      expect.objectContaining({
        rows: [
          [
            { text: 'Livingunitdesc1' },
            { text: 100 },
            { text: 0 },
            { html: false, text: 0 },
            { text: 0 },
            { text: 0 },
            { text: 0 },
          ],
          [
            { text: 'Leeds' },
            { text: 100 },
            { text: 0 },
            { html: false, text: 0 },
            { text: 0 },
            { text: 0 },
            { text: 0 },
          ],
        ],
        todayStats: {
          currentRoll: 0,
          enroute: 8,
          inToday: 1,
          outToday: 3,
          unassignedIn: 0,
          unlockRoll: 2,
          noCellAllocated: 0,
        },
      })
    )
  })

  it('should render the template with the correctly formatted date', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/dashboard.njk',
      expect.objectContaining({ date: 'Friday 29 March 2019' })
    )

    Date.now.mockRestore()
  })
})
