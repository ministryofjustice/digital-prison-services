import moment from 'moment'
import log from '../log'

type StoredCachedData = {
  expiryTime: moment.Moment
  cachedData: any
}

class CacheHelper {
  private currentDateTime: moment.Moment = moment()

  private ttlInSeconds: number

  constructor(ttlInSeconds: number) {
    this.ttlInSeconds = ttlInSeconds
  }

  isExpired(cachedData: StoredCachedData): boolean {
    return this.currentDateTime.isSameOrAfter(cachedData.expiryTime)
  }

  makeValueToCache(dataToCache: any): StoredCachedData {
    return {
      expiryTime: this.currentDateTime.add(this.ttlInSeconds, 'seconds'),
      cachedData: dataToCache,
    }
  }
}

export const cacheFactory = (ttlInSeconds) => {
  let cachedValue: StoredCachedData = null
  return async (cachePopulator): Promise<any> => {
    const cacheHelper = new CacheHelper(ttlInSeconds)

    if (cachedValue === null || cacheHelper.isExpired(cachedValue)) {
      try {
        const newValue = await cachePopulator()
        cachedValue = cacheHelper.makeValueToCache(newValue)
      } catch (e) {
        log.info({}, `Failed to load cache - will retry in ${ttlInSeconds} seconds`)
        const oldValue = cachedValue?.cachedData || null
        cachedValue = cacheHelper.makeValueToCache(oldValue)
      }
    }

    return cachedValue.cachedData
  }
}

export default {
  cacheFactory,
}
