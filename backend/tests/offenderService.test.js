Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const offenderService = require('../services/offenderService')(elite2Api)

beforeEach(() => {
  elite2Api.getDetails = jest.fn()
})

const offender = {
  firstName: 'BOB',
  lastName: 'SMITH',
  age: 18,
}

describe('Offender Service', () => {
  it('Retrieve offender details', async () => {
    elite2Api.getDetails.mockReturnValue(offender)

    const response = await offenderService.getOffender({}, 'OFF-1')
    expect(response).toEqual({ firstName: 'Bob', lastName: 'Smith' })

    expect(elite2Api.getDetails).toHaveBeenCalled()

    expect(elite2Api.getDetails.mock.calls[0]).toEqual([{}, 'OFF-1'])
  })
})
