const elite2Api = {};
const getEstablishmentRollCount = require('../controllers/establishmentRollCount').getEstablishmentRollCountFactory(
  elite2Api,
).getEstablishmentRollCount;

describe('Establishment Roll', () => {
  const context = {};
  const agencyId = 'LEI';
  const assignedBlockData = [
    {
      livingUnitId: 0,
      livingUnitDesc: 'Housing block 1',
      bedsInUse: 10,
      currentlyInCell: 20,
      currentlyOut: 30,
      operationalCapacity: 2,
      netVacancies: 3,
      maximumCapacity: 0,
      availablePhysical: 0,
      outOfOrder: 0
    },
    {
      livingUnitId: 0,
      livingUnitDesc: 'Housing block 2',
      bedsInUse: 0,
      currentlyInCell: 0,
      currentlyOut: 0,
      operationalCapacity: 0,
      netVacancies: 0,
      maximumCapacity: 0,
      availablePhysical: 0,
      outOfOrder: 0
    }
  ];

  const movements = {
    in: 1,
    out: 3
  };

  beforeEach(() => {
    elite2Api.getEstablishmentRollBlocksCount = jest.fn();
    elite2Api.getEstablishmentRollMovementsCount = jest.fn();
    elite2Api.getEstablishmentRollBlocksCount.mockImplementation(() => assignedBlockData);
    elite2Api.getEstablishmentRollMovementsCount.mockImplementation(() => movements);
  });

  it('should call the rollcount endpoint', async () => {
    await getEstablishmentRollCount(context, agencyId);

    expect(elite2Api.getEstablishmentRollBlocksCount).toHaveBeenCalledWith(context, agencyId, false);
    expect(elite2Api.getEstablishmentRollBlocksCount).toHaveBeenCalledWith(context, agencyId, true);
    expect(elite2Api.getEstablishmentRollMovementsCount).toHaveBeenCalledWith(context, agencyId);
  });

  it('should return response with block counts', async () => {
    const response = await getEstablishmentRollCount(context, agencyId);
    const returnedData = {
      movements: {
        name: 'Movements',
        numbers: [
          { name: 'Unlock roll', value: 12 },
          { name: 'In today', value: 1 },
          { name: 'Out today', value: 3 },
          { name: 'Current roll', value: 10 },
          { name: 'Unassigned', value: 20 }
        ]
      },
      blocks: [
        {
          name: 'Housing block 1',
          numbers: [
            { name: 'Beds in use', value: 10 },
            { name: 'Currently in cell', value: 20 },
            { name: 'Currently out', value: 30 },
            { name: 'Operational cap.', value: 2 },
            { name: 'Net vacancies', value: 3 },
            { name: 'Out of order', value: 0 }
          ]
        },
        {
          name: 'Housing block 2',
          numbers: [
            { name: 'Beds in use', value: 0 },
            { name: 'Currently in cell', value: 0 },
            { name: 'Currently out', value: 0 },
            { name: 'Operational cap.', value: 0 },
            { name: 'Net vacancies', value: 0 },
            { name: 'Out of order', value: 0 }
          ]
        }
      ],
      totals: {
        name: 'Totals',
        numbers: [
          { name: 'Total roll', value: 10 },
          { name: 'Total in cell', value: 20 },
          { name: 'Total out', value: 30 },
          { name: 'Total op. cap.', value: 2 },
          { name: 'Total vacancies', value: 3 },
          { name: 'Total out of order', value: 0 }
        ]
      }
    };

    expect(response).toEqual(returnedData);
  });
});
