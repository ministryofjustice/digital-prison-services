import type { OauthApiClient } from './oauthEnabledClient'

export interface LocationPrefix {
  locationPrefix: string
}

export interface Location {
  id: string
  key: string
}

export interface LocationGroup {
  name: string
  key: string
  children: {
    key: string
    name: string
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const locationsInsidePrisonApiFactory = (client: OauthApiClient) => {
  const processResponse = () => (response) => response.body

  const map404ToNull = (error) => {
    if (!error.response) throw error
    if (!error.response.status) throw error
    if (error.response.status !== 404) throw error
    return null
  }

  const getWith404AsNull = (systemContext, url) =>
    client.get(systemContext, url).then(processResponse()).catch(map404ToNull)

  const getAgencyGroupLocationPrefix = (systemContext, prisonId, group): Promise<LocationPrefix> =>
    getWith404AsNull(systemContext, `/locations/prison/${prisonId}/group/${group}/location-prefix`)

  const getAgencyGroupLocations = (systemContext, prisonId, groupName): Promise<Location[]> =>
    getWith404AsNull(systemContext, `/locations/groups/${prisonId}/${groupName}`)

  const getLocationById = (systemContext, locationId): Promise<Location> =>
    getWith404AsNull(systemContext, `/locations/${locationId}`)

  const getLocationByKey = (systemContext, locationKey): Promise<Location> =>
    getWith404AsNull(systemContext, `/locations/key/${locationKey}`)

  const getSearchGroups = (context, prisonId): Promise<LocationGroup[]> => {
    return getWith404AsNull(context, `/locations/prison/${prisonId}/groups`)
  }

  return {
    getAgencyGroupLocationPrefix,
    getAgencyGroupLocations,
    getSearchGroups,
    getLocationById,
    getLocationByKey,
  }
}

export default {
  locationsInsidePrisonApiFactory,
}
