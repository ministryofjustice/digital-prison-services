import type { OauthApiClient } from './oauthEnabledClient'

export interface LocationPrefix {
  locationPrefix: string
}

export interface Location {
  key: string
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

  const getAgencyGroupLocations = (systemContext, prisonId, groupName): Promise<Location> =>
    getWith404AsNull(systemContext, `/locations/groups/${prisonId}/${groupName}`)

  return {
    getAgencyGroupLocationPrefix,
    getAgencyGroupLocations,
  }
}

export default {
  locationsInsidePrisonApiFactory,
}
