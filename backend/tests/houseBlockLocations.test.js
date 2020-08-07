const { getHouseblockLocationsFactory } = require('../controllers/attendance/houseblockLocations')

describe('House block locations', () => {
  const whereaboutsApi = {}
  const res = { locals: {} }
  const req = {
    query: {
      agencyId: 'LEI',
    },
    originalUrl: 'http://localhost',
  }
  let controller
  let logError

  beforeEach(() => {
    whereaboutsApi.searchGroups = jest.fn()
    res.json = jest.fn()
    logError = jest.fn()

    controller = getHouseblockLocationsFactory({ whereaboutsApi, logError })
  })

  it('should call searchGroups with the correct parameters', async () => {
    await controller.getHouseblockLocations(req, res)

    expect(whereaboutsApi.searchGroups).toHaveBeenCalledWith({}, 'LEI')
  })

  it('should pipe response out into json', async () => {
    const response = [
      {
        children: [
          {
            name: 'Landing A/1',
            key: '1',
          },
          {
            name: 'Landing A/2',
            key: '2',
          },
        ],
        key: 'A',
        name: 'Block A',
      },
    ]

    whereaboutsApi.searchGroups.mockReturnValue(response)
    await controller.getHouseblockLocations(req, res)

    expect(res.json).toHaveBeenCalledWith(response)
  })

  it('should catch and log error', async () => {
    whereaboutsApi.searchGroups.mockRejectedValue(new Error('Test error'))

    await controller.getHouseblockLocations(req, res)

    expect(logError).toHaveBeenCalledWith(
      'http://localhost',
      new Error('Test error'),
      'Error trying to retrieve groups'
    )
  })
})
