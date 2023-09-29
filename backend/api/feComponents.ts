import { OauthApiClient } from './oauthEnabledClient'

export type AvailableComponent = 'header' | 'footer'
export interface Component {
  html: string
  css: string[]
  javascript: string[]
}

export const feComponentsApiFactory = (client: OauthApiClient) => {
  const get = async (context, url, options, query) => {
    const response = await client.get(context, url, options, query)
    return response.body
  }

  const getComponents = <T extends AvailableComponent[]>(
    context,
    components: T
  ): Promise<Record<T[number], Component>> =>
    get(
      { ...context, customRequestHeaders: { 'x-user-token': context.access_token } },
      `/components`,
      {},
      `component=${components.join('&component=')}`
    )

  return {
    getComponents,
  }
}
