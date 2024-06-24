export interface LocationGroup {
  name: string
  key: string
  children: {
    key: string
    name: string
  }[]
}

export const locationsInsidePrisonApiFactory = (client) => {
  const processResponse = () => (response) => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())

  const searchGroups = (context, prisonId): Promise<LocationGroup[]> => {
    return get(context, `/locations/prison/${prisonId}/groups`)
  }

  return {
    searchGroups,
  }
}

export default { locationsInsidePrisonApiFactory }
