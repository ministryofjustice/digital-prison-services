import getOffenderService from '../services/offenderService'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const prisonApi = {}
const offenderService = getOffenderService(prisonApi)

beforeEach(() => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
  prisonApi.getDetails = jest.fn()
})

const offender = {
  firstName: 'BOB',
  lastName: 'SMITH',
  age: 18,
}

describe('Offender Service', () => {
  it('Retrieve offender details', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockReturnValue(offender)

    const response = await offenderService.getOffender({}, 'OFF-1')
    expect(response).toEqual({ firstName: 'Bob', lastName: 'Smith' })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalled()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails.mock.calls[0]).toEqual([{}, 'OFF-1'])
  })
})
