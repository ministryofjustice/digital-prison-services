import nock from 'nock'
import clientFactory from './oauthEnabledClient'
import { cellAllocationApiFactory } from './cellAllocationApi'

const url = 'http://localhost:8080'

describe('cell allocation Api', () => {
  const client = clientFactory({ baseUrl: url, timeout: 2000 })
  const cellAllocationApi = cellAllocationApiFactory(client)
  const mock = nock(url)

  beforeEach(() => {
    nock.cleanAll()
  })

  it('calls /api/bookings/{bookingId}/move-to-cell-swap correctly', async () => {
    mock.put('/api/bookings/123456/move-to-cell-swap').reply(200, { test: 'test' })

    const response = await cellAllocationApi.moveToCellSwap(
      {},
      {
        bookingId: 123456,
      }
    )

    expect(response).toEqual({ test: 'test' })
  })

  it('throws unauthorized error', async () => {
    mock.put('/api/bookings/123456/move-to-cell-swap').reply(401)
    await expect(cellAllocationApi.moveToCellSwap({}, { bookingId: 123456 })).rejects.toThrow('Unauthorized')
  })
})
