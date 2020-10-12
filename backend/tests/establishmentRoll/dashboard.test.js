const dashboard = require('../../controllers/establishmentRoll/dashboard')

const elite2Api = {}

describe('Establishment Roll', () => {
  const logError = jest.fn()
  let controller
  const agencyId = 'LEI'
  const req = { originalUrl: 'http://localhost' }
  const res = { locals: {} }
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
    elite2Api.getEstablishmentRollBlocksCount = jest.fn()
    elite2Api.getEstablishmentRollMovementsCount = jest.fn()
    elite2Api.getEstablishmentRollEnrouteCount = jest.fn()
    elite2Api.userCaseLoads = jest.fn().mockResolvedValue([{ currentlyActive: true, caseLoadId: 'LEI' }])
    elite2Api.getEstablishmentRollBlocksCount.mockImplementation(
      (_context, _agencyId, _unassigned) => (_unassigned ? unassignedBlockData : assignedBlockData)
    )
    elite2Api.getEstablishmentRollMovementsCount.mockImplementation(() => movements)
    elite2Api.getEstablishmentRollEnrouteCount.mockImplementation(() => 8)
    controller = dashboard({ elite2Api, logError })
    res.render = jest.fn()
  })

  it('should call the rollcount endpoint', async () => {
    await controller(req, res)

    expect(elite2Api.getEstablishmentRollBlocksCount).toHaveBeenCalledWith(res.locals, agencyId, false)
    expect(elite2Api.getEstablishmentRollBlocksCount).toHaveBeenCalledWith(res.locals, agencyId, true)
    expect(elite2Api.getEstablishmentRollMovementsCount).toHaveBeenCalledWith(res.locals, agencyId)
    expect(elite2Api.getEstablishmentRollEnrouteCount).toHaveBeenCalledWith(res.locals, agencyId)
  })

  it('should return response with block counts', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/dashboard.njk',
      expect.objectContaining({
        blocks: [
          {
            livingUnitId: 0,
            name: 'Houseblock 1',
            stats: { bedsInUse: 10, inCell: 20, netVacancies: 3, operationalCapacity: 2, out: 30, outOfOrder: 0 },
          },
          {
            livingUnitId: 1,
            name: 'Houseblock 2',
            stats: { bedsInUse: 0, inCell: 0, netVacancies: 0, operationalCapacity: 0, out: 0, outOfOrder: 0 },
          },
        ],
        notmUrl: 'http://localhost:3000/',
        todayStats: { currentRoll: 28, enroute: 8, inToday: 1, outToday: 3, unassignedIn: 8, unlockRoll: 30 },
        totalsStats: { inCell: 20, operationalCapacity: 2, out: 30, outOfOrder: 0, roll: 10, vacancies: 3 },
      })
    )
  })

  it('should default to zero when data is undefined for blocks and totals', async () => {
    elite2Api.getEstablishmentRollBlocksCount.mockReturnValue([{ livingUnitDesc: 'livingUnitDesc1', bedsInUse: 100 }])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'establishmentRoll/dashboard.njk',
      expect.objectContaining({
        blocks: [
          {
            livingUnitId: undefined,
            name: 'Livingunitdesc1',
            stats: { bedsInUse: 100, inCell: 0, netVacancies: 0, operationalCapacity: 0, out: 0, outOfOrder: 0 },
          },
        ],
        notmUrl: 'http://localhost:3000/',
        todayStats: { currentRoll: 0, enroute: 8, inToday: 1, outToday: 3, unassignedIn: 0, unlockRoll: 2 },
        totalsStats: { inCell: 0, operationalCapacity: 0, out: 0, outOfOrder: 0, roll: 100, vacancies: 0 },
      })
    )
  })
})
