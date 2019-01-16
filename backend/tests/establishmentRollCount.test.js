const elite2Api = {}
const { getEstablishmentRollCount } = require('../controllers/establishmentRollCount').getEstablishmentRollCountFactory(
  elite2Api
)

describe('Establishment Roll', () => {
  const context = {}
  const agencyId = 'LEI'
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
    elite2Api.getEstablishmentRollBlocksCount.mockImplementation(
      (_context, _agencyId, _unassigned) => (_unassigned ? unassignedBlockData : assignedBlockData)
    )
    elite2Api.getEstablishmentRollMovementsCount.mockImplementation(() => movements)
    elite2Api.getEstablishmentRollEnrouteCount.mockImplementation(() => 8)
  })

  it('should call the rollcount endpoint', async () => {
    await getEstablishmentRollCount(context, agencyId)

    expect(elite2Api.getEstablishmentRollBlocksCount).toHaveBeenCalledWith(context, agencyId, false)
    expect(elite2Api.getEstablishmentRollBlocksCount).toHaveBeenCalledWith(context, agencyId, true)
    expect(elite2Api.getEstablishmentRollMovementsCount).toHaveBeenCalledWith(context, agencyId)
    expect(elite2Api.getEstablishmentRollEnrouteCount).toHaveBeenCalledWith(context, agencyId)
  })

  it('should return response with block counts', async () => {
    const response = await getEstablishmentRollCount(context, agencyId)
    const returnedData = {
      movements: {
        name: "Today's movements",
        numbers: [
          { name: 'Unlock roll', value: 30 },
          { name: 'In today', value: 1 },
          { name: 'Out today', value: 3 },
          { name: 'Current roll', value: 28 },
          { name: 'In reception', value: 8 },
          { name: 'En-route', value: 8 },
        ],
      },
      blocks: [
        {
          name: 'Houseblock 1',
          livingUnitId: 0,
          numbers: [
            { name: 'Beds in use', value: 10 },
            { name: 'Currently in cell', value: 20 },
            { name: 'Currently out', value: 30 },
            { name: 'Operational cap.', value: 2 },
            { name: 'Net vacancies', value: 3 },
            { name: 'Out of order', value: 0 },
          ],
        },
        {
          name: 'Houseblock 2',
          livingUnitId: 1,
          numbers: [
            { name: 'Beds in use', value: 0 },
            { name: 'Currently in cell', value: 0 },
            { name: 'Currently out', value: 0 },
            { name: 'Operational cap.', value: 0 },
            { name: 'Net vacancies', value: 0 },
            { name: 'Out of order', value: 0 },
          ],
        },
      ],
      totals: {
        name: 'Totals',
        numbers: [
          { name: 'Total roll', value: 10 },
          { name: 'Total in cell', value: 20 },
          { name: 'Total out', value: 30 },
          { name: 'Total op. cap.', value: 2 },
          { name: 'Total vacancies', value: 3 },
          { name: 'Total out of order', value: 0 },
        ],
      },
    }

    expect(response).toEqual(returnedData)
  })

  it('should default to zero when data is undefined for blocks and totals', async () => {
    elite2Api.getEstablishmentRollBlocksCount.mockReturnValue([{ livingUnitDesc: 'livingUnitDesc1', bedsInUse: 100 }])

    const response = await getEstablishmentRollCount(context, agencyId)

    expect(response.blocks).toEqual([
      {
        name: 'Livingunitdesc1',
        numbers: [
          {
            name: 'Beds in use',
            value: 100,
          },
          {
            name: 'Currently in cell',
            value: 0,
          },
          {
            name: 'Currently out',
            value: 0,
          },
          {
            name: 'Operational cap.',
            value: 0,
          },
          {
            name: 'Net vacancies',
            value: 0,
          },
          {
            name: 'Out of order',
            value: 0,
          },
        ],
      },
    ])

    expect(response.totals).toEqual({
      name: 'Totals',
      numbers: [
        {
          name: 'Total roll',
          value: 100,
        },
        {
          name: 'Total in cell',
          value: 0,
        },
        {
          name: 'Total out',
          value: 0,
        },
        {
          name: 'Total op. cap.',
          value: 0,
        },
        {
          name: 'Total vacancies',
          value: 0,
        },
        {
          name: 'Total out of order',
          value: 0,
        },
      ],
    })
  })
})
