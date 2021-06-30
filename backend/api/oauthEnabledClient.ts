import superagent from 'superagent'
import { Response } from 'express'
import Agent, { HttpsAgent } from 'agentkeepalive'
import * as stream from 'stream'
import { ClientRequest } from 'http'
import logger from '../log'
import { getHeaders } from './axios-config-decorators'

type RequestOptions = {
  resultsLimit?: number
  customTimeout?: number
}

type OauthApiClientOptions = {
  /**
   * @description baseUrl The base url to be used with the client's get and post
   */
  baseUrl: string
  /**
   * @description timeout The timeout to apply to get and post.
   */
  timeout?: number
}

type ClientResponse<T = never> = {
  body: T
  req: ClientRequest
} & superagent.Response

export interface ClientContext {
  // eslint-disable-next-line camelcase
  access_token?: string
  // eslint-disable-next-line camelcase
  refresh_token?: string
}

const isClientResponse = (res: superagent.Response): res is ClientResponse => !!(res as any).res

const resultLogger = (result: superagent.Response) => {
  if (isClientResponse(result)) {
    logger.debug(`${result.req.method} ${result.req.path} ${result.status}`)
  }
  return result as ClientResponse
}

export class OauthApiClient {
  private readonly remoteUrl: string

  private readonly timeout: number

  private readonly keepaliveAgent: Agent

  constructor({ baseUrl, timeout = 30000 }: OauthApiClientOptions) {
    this.remoteUrl = this.sanitizeUrl(baseUrl)
    this.timeout = timeout

    const agentOptions = {
      maxSockets: 100,
      maxFreeSockets: 10,
      freeSocketTimeout: 30000,
    }

    this.keepaliveAgent = this.remoteUrl.startsWith('https') ? new HttpsAgent(agentOptions) : new Agent(agentOptions)
  }

  /**
   * A superagent GET request with Oauth token
   *
   * @param context A request scoped context. Holds OAuth tokens and pagination information for the request
   * @param path relative path to get, starting with /
   * @param options - the maximum number of results that a Get request should return.  Becomes the value of the 'page-limit' request header.
   *        The header isn't set if resultsLimit is falsy.
   * @returns A Promise which settles to the superagent result object if the promise is resolved, otherwise to the 'error' object.
   */
  get = <T = any>(context: ClientContext, path: string, options: RequestOptions = {}): Promise<ClientResponse<T>> => {
    return superagent
      .get(this.createUrl(path))
      .agent(this.keepaliveAgent)
      .set(getHeaders(context, options.resultsLimit))
      .retry(2, this.retryHandler)
      .timeout({ deadline: options.customTimeout ?? this.timeout / 3 })
      .catch(errorLogger)
      .then(resultLogger)
  }

  /**
   * A superagent GET request with Oauth token with custom timeout value
   *
   * @Deprecated use {OauthApiClient#get} and set `customTimeout` in the request options
   *
   * @param context A request scoped context. Holds OAuth tokens and pagination information for the request
   * @param path relative path to get, starting with /
   * @param resultsLimit - the maximum number of results that a Get request should return.  Becomes the value of the 'page-limit' request header.
   *        The header isn't set if resultsLimit is falsy.
   * @param customTimeout value in milliseconds to override default timeout
   * @returns A Promise which settles to the superagent result object if the promise is resolved, otherwise to the 'error' object.
   */
  getWithCustomTimeout = <T>(context, path, { resultsLimit, customTimeout }): Promise<ClientResponse<T>> => {
    return superagent
      .get(this.createUrl(path))
      .agent(this.keepaliveAgent)
      .set(getHeaders(context, resultsLimit))
      .retry(2, this.retryHandler)
      .timeout({ deadline: customTimeout || this.timeout })
      .catch(errorLogger)
      .then(resultLogger)
  }

  /**
   * An superagent POST with Oauth token refresh and retry behaviour
   * @param context A request scoped context. Holds OAuth tokens and pagination information for the request
   * @param path relative path to post to, starting with /
   * @param body
   * @returns A Promise which resolves to the superagent result object, or the superagent error object if it is rejected
   */
  post = <T>(context: ClientContext, path: string, body: never): Promise<ClientResponse<T>> => {
    return superagent
      .post(this.createUrl(path))
      .send(body)
      .type('json')
      .set(getHeaders(context))
      .set('Accept', 'application/json')
      .catch(errorLogger)
      .then(resultLogger)
  }

  /**
   * An superagent PUT with Oauth token refresh and retry behaviour
   * @param context A request scoped context. Holds OAuth tokens and pagination information for the request
   * @param path relative path to post to, starting with /
   * @param body
   * @returns A Promise which resolves to the superagent result object, or the superagent error object if it is rejected
   */
  put = <T>(context: ClientContext, path: string, body: never): Promise<ClientResponse<T>> => {
    return superagent
      .put(this.createUrl(path))
      .send(body)
      .type('json')
      .set(getHeaders(context))
      .set('Accept', 'application/json')
      .catch(errorLogger)
      .then(resultLogger)
  }

  getStream = (context: ClientContext, path: string): Promise<stream.Readable> => {
    return superagent
      .get(this.createUrl(path))
      .agent(this.keepaliveAgent)
      .set(getHeaders(context))
      .retry(2, this.retryHandler)
      .timeout({ deadline: this.timeout / 3 })
      .catch(errorLogger)
      .then((response) => {
        resultLogger(response)
        const s = new stream.Readable()
        // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-empty-function
        s._read = () => {}
        s.push(response.body)
        s.push(null)
        return s
      })
  }

  pipe = (context: ClientContext, path: string, pipeTo: Response, options = { retry: 2 }): stream.Writable => {
    return superagent
      .get(this.createUrl(path))
      .agent(this.keepaliveAgent)
      .set(getHeaders(context))
      .retry(options.retry, this.retryHandler)
      .timeout({ deadline: this.timeout / (options.retry + 1) })
      .on('response', (res) => pipeTo.header(res.header))
      .pipe(pipeTo)
  }

  sendDelete = <T>(context, path): Promise<ClientResponse<T>> => {
    return superagent.get(this.createUrl(path)).set(getHeaders(context)).catch(errorLogger).then(resultLogger)
  }

  private retryHandler = (err) => {
    if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
    return undefined // retry handler only for logging retries, not to influence retry logic
  }

  private createUrl = (path) => `${this.remoteUrl}${path}`

  private sanitizeUrl = (url: string) => (url?.endsWith('/') ? url.substring(0, url.length - 1) : url)
}

const errorLogger = (error) => {
  const status = error.response ? error.response.status : '-'
  const responseData = error.response ? error.response.body : '-'
  const payload = responseData && typeof responseData === 'object' ? JSON.stringify(responseData) : responseData

  // Not Found 404 is a valid response when querying for data.
  // Log it for information and pass it down the line
  // in case controllers want to do something specific.
  if (status === 404) {
    logger.warn(`${error.response.req.method} ${error.response.req.path} No record found`)
    return Promise.reject(error)
  }

  if (error?.response?.req) {
    logger.warn(
      `API error in ${error.response.req.method} ${error.response.req.path} ${status} ${error.message} ${payload}`
    )
  } else logger.warn(`API error with message ${error.message}`)
  return Promise.reject(error)
}

/**
 * Build a client for the supplied configuration. The client wraps axios get, post, put etc while ensuring that
 * the remote calls carry valid oauth headers.
 *
 * @param options {OauthApiClientOptions} configuration options for the api client
 * @returns {OauthApiClient}
 */
const factory = (options: OauthApiClientOptions): OauthApiClient => new OauthApiClient(options)

export default factory
