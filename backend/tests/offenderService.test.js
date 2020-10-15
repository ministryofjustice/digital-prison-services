Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const prisonApi = {}
const offenderService = require('../services/offenderService')(prisonApi)

beforeEach(() => {
  prisonApi.getDetails = jest.fn()
})

const offender = {
  firstName: 'BOB',
  lastName: 'SMITH',
  age: 18,
}

describe('Offender Service', () => {
  it('Retrieve offender details', async () => {
    prisonApi.getDetails.mockReturnValue(offender)

    const response = await offenderService.getOffender({}, 'OFF-1')
    expect(response).toEqual({ firstName: 'Bob', lastName: 'Smith' })

    expect(prisonApi.getDetails).toHaveBeenCalled()

    expect(prisonApi.getDetails.mock.calls[0]).toEqual([{}, 'OFF-1'])
  })
})
