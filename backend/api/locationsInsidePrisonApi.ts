import type { OauthApiClient } from './oauthEnabledClient'
import logger from '../log'

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

export const enum ServiceType {
  APPOINTMENT = 'APPOINTMENT',
  PROGRAMMES_AND_ACTIVITIES = 'PROGRAMMES_AND_ACTIVITIES',
  VIDEO_LINK = 'VIDEO_LINK',
  HEARING_LOCATION = 'HEARING_LOCATION',
  LOCATION_OF_INCIDENT = 'LOCATION_OF_INCIDENT',
  INTERNAL_MOVEMENTS = 'INTERNAL_MOVEMENTS',
  OFFICIAL_VISITS = 'OFFICIAL_VISITS',
  USE_OF_FORCE = 'USE_OF_FORCE',
  VIDEO_ENABLED = 'VIDEO_ENABLED',
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

  async function getLocationsByServiceType(
    systemContext,
    prisonId: string,
    serviceType?: ServiceType
  ): Promise<Location[]> {
    logger.info(`getting locations for prison ${prisonId} and serviceType ${serviceType}`)
    return (
      await client.get(
        { ...systemContext, customRequestHeaders: { 'Sort-Fields': 'userDescription' } },
        `/locations/non-residential/prison/${prisonId}/service/${serviceType}`,
        {},
        'formatLocalName=true&sortByLocalName=true&filterParents=false'
      )
    ).body
  }

  const getSearchGroups = (context, prisonId): Promise<LocationGroup[]> => {
    return getWith404AsNull(context, `/locations/prison/${prisonId}/groups`)
  }

  return {
    getAgencyGroupLocationPrefix,
    getAgencyGroupLocations,
    getSearchGroups,
    getLocationById,
    getLocationByKey,
    getLocationsByServiceType,
  }
}

export default {
  locationsInsidePrisonApiFactory,
}
