import { cacheFactory } from './singleValueInMemoryCache'

describe('Cache with 10 second TTL', () => {
  let inMemoryCache

  beforeEach(() => {
    inMemoryCache = cacheFactory(10)
    Date.now = jest.fn(() => new Date('2020-05-13T12:33:37.000Z').getTime())
  })

  it('should make call to populator on first request', async () => {
    const populator = async (): Promise<string> => {
      return 'test string'
    }

    const returnValue = await inMemoryCache(populator)
    expect(returnValue).toEqual('test string')
  })

  it('should use cached value on second request', async () => {
    const populatorOnFirstCall = async (): Promise<string> => {
      return 'test string 1'
    }
    const populatorOnSecondCall = async (): Promise<string> => {
      return 'test string 2'
    }
    await inMemoryCache(populatorOnFirstCall).then((data) => {
      console.log(`Read value ${data}`)
    })

    const returnValue = await inMemoryCache(populatorOnSecondCall)
    expect(returnValue).toEqual('test string 1')
  })

  it('should re-populate the cache after the given time', async () => {
    const populatorOnFirstCall = async (): Promise<string> => {
      return 'test string 1'
    }
    const populatorOnSecondCall = async (): Promise<string> => {
      return 'test string 2'
    }
    await inMemoryCache(populatorOnFirstCall).then((data) => {
      console.log(`Read value ${data}`)
    })

    // a minute later
    Date.now = jest.fn(() => new Date('2020-05-13T12:34:37.000Z').getTime())

    const returnValue = await inMemoryCache(populatorOnSecondCall)
    expect(returnValue).toEqual('test string 2')
  })

  it('should use the old value if the re-population fails', async () => {
    const populatorOnFirstCall = async (): Promise<string> => {
      return 'test string 1'
    }
    const populatorOnSecondCall = async (): Promise<string> => {
      throw Error // Any error will do
    }
    const populatorOnThirdCall = async (): Promise<string> => {
      return 'test string 3'
    }
    await inMemoryCache(populatorOnFirstCall).then((data) => {
      console.log(`Read value ${data}`)
    })

    // a minute later
    Date.now = jest.fn(() => new Date('2020-05-13T12:34:37.000Z').getTime())

    const returnValue = await inMemoryCache(populatorOnSecondCall)
    expect(returnValue).toEqual('test string 1')

    // Check it caches the old value - it doesn't retry
    const returnValueAfterFailure = await inMemoryCache(populatorOnThirdCall)
    expect(returnValueAfterFailure).toEqual('test string 1')
  })

  it('should make another call after the given time if the re-population fails', async () => {
    const populatorOnFirstCall = async (): Promise<string> => {
      return 'test string 1'
    }
    const populatorOnSecondCall = async (): Promise<string> => {
      throw Error // Any error will do
    }
    const populatorOnThirdCall = async (): Promise<string> => {
      return 'test string 3'
    }
    await inMemoryCache(populatorOnFirstCall).then((data) => {
      console.log(`Read value ${data}`)
    })

    // a minute later
    Date.now = jest.fn(() => new Date('2020-05-13T12:34:37.000Z').getTime())
    await inMemoryCache(populatorOnSecondCall).then((data) => {
      console.log(`Read value ${data}`)
    })

    // another minute later
    Date.now = jest.fn(() => new Date('2020-05-13T12:35:37.000Z').getTime())
    const returnValue = await inMemoryCache(populatorOnThirdCall)
    expect(returnValue).toEqual('test string 3')
  })

  it('should return null then eventually set if population fails on the first call', async () => {
    const populator = async (): Promise<string> => {
      throw Error // Any error will do
    }
    const populatorOnLaterCall = async (): Promise<string> => {
      return 'test string 4'
    }

    const returnValue = await inMemoryCache(populator)
    expect(returnValue).toEqual(null)

    // a minute later
    Date.now = jest.fn(() => new Date('2020-05-13T12:34:37.000Z').getTime())
    const laterReturnValue = await inMemoryCache(populatorOnLaterCall)
    expect(laterReturnValue).toEqual('test string 4')
  })
})
