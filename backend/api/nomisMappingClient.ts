import type { OauthApiClient } from './oauthEnabledClient'

type NomisDpsLocationMapping = {
  dpsLocationId: string
  nomisLocationId: number
}

export const nomisMappingClientFactory = (client: OauthApiClient) => {
  const processResponse = () => (response) => response.body

  const get = (systemContext, url) => client.get(systemContext, url).then(processResponse())

  const getNomisLocationMappingByDpsLocationId = (systemContext, dpsLocationId): Promise<NomisDpsLocationMapping> =>
    get(systemContext, `/api/locations/dps/${dpsLocationId}`)

  const getNomisLocationMappingByNomisLocationId = (systemContext, nomisLocationId): Promise<NomisDpsLocationMapping> =>
    get(systemContext, `/api/locations/nomis/${nomisLocationId}`)

  return {
    getNomisLocationMappingByDpsLocationId,
    getNomisLocationMappingByNomisLocationId,
  }
}

export default {
  nomisMappingClientFactory,
}
