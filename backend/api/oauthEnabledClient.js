const superagent = require('superagent')
const { Readable } = require('stream')
const Agent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
const logger = require('../log')

const { getHeaders } = require('./axios-config-decorators')

const resultLogger = result => {
  logger.debug(`${result.req.method} ${result.req.path} ${result.status}`)
  return result
}

const errorLogger = error => {
  const status = error.response ? error.response.status : '-'
  const responseData = error.response ? error.response.body : '-'

  // Not Found 404 is a valid response when querying for data.
  // Log it for information and pass it down the line
  // in case controllers want to do something specific.
  if (status === 404) {
    logger.warn(`${error.response.req.method} ${error.response.req.path} No record found`)
    return error
  }

  if (error.response && error.response.req) {
    logger.warn(
      `API error in ${error.response.req.method} ${error.response.req.path} ${status} ${error.message} ${responseData}`
    )
  } else logger.warn(`API error with message ${error.message}`)
  return error
}

/**
 * Build a client for the supplied configuration. The client wraps axios get, post, put etc while ensuring that
 * the remote calls carry valid oauth headers.
 *
 * @param baseUrl The base url to be used with the client's get and post
 * @param timeout The timeout to apply to get and post.
 * @returns {{get: (function(*=): *), post: (function(*=, *=): *)}}
 */
const factory = ({ baseUrl, timeout }) => {
  // strip off any excess / from the required url
  const remoteUrl = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl

  const agentOptions = {
    maxSockets: 100,
    maxFreeSockets: 10,
    freeSocketTimeout: 30000,
  }
  const keepaliveAgent = remoteUrl.startsWith('https') ? new HttpsAgent(agentOptions) : new Agent(agentOptions)

  /**
   * A superagent GET request with Oauth token
   *
   * @param context A request scoped context. Holds OAuth tokens and pagination information for the request
   * @param path relative path to get, starting with /
   * @param resultLimit - the maximum number of results that a Get request should return.  Becomes the value of the 'page-limit' request header.
   *        The header isn't set if resultLimit is falsy.
   * @returns A Promise which settles to the superagent result object if the promise is resolved, otherwise to the 'error' object.
   */
  const get = (context, path, resultLimit) =>
    new Promise((resolve, reject) => {
      superagent
        .get(remoteUrl + path)
        .agent(keepaliveAgent)
        .set(getHeaders(context, resultLimit))
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout({ deadline: timeout / 3 })
        .end((error, response) => {
          if (error) reject(errorLogger(error))
          else if (response) resolve(resultLogger(response))
        })
    })

  /**
   * A superagent GET request with Oauth token with custom timeout value
   *
   * @param context A request scoped context. Holds OAuth tokens and pagination information for the request
   * @param path relative path to get, starting with /
   * @param resultLimit - the maximum number of results that a Get request should return.  Becomes the value of the 'page-limit' request header.
   *        The header isn't set if resultLimit is falsy.
   * @param customTimeout value in milliseconds to override default timeout
   * @returns A Promise which settles to the superagent result object if the promise is resolved, otherwise to the 'error' object.
   */
  const getWithCustomTimeout = (context, path, { resultLimit, customTimeout }) =>
    new Promise((resolve, reject) => {
      superagent
        .get(remoteUrl + path)
        .agent(keepaliveAgent)
        .set(getHeaders(context, resultLimit))
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout({ deadline: customTimeout || timeout })
        .end((error, response) => {
          if (error) reject(errorLogger(error))
          else if (response) resolve(resultLogger(response))
        })
    })

  /**
   * An superagent POST with Oauth token refresh and retry behaviour
   * @param context A request scoped context. Holds OAuth tokens and pagination information for the request
   * @param path relative path to post to, starting with /
   * @param body
   * @returns A Promise which resolves to the superagent result object, or the superagent error object if it is rejected
   */
  const post = (context, path, body) =>
    new Promise((resolve, reject) => {
      superagent
        .post(remoteUrl + path)
        .send(body)
        .set(getHeaders(context))
        .end((error, response) => {
          if (error) reject(errorLogger(error))
          else if (response) resolve(resultLogger(response))
        })
    })

  const put = (context, path, body) =>
    new Promise((resolve, reject) => {
      superagent
        .put(remoteUrl + path)
        .send(body)
        .set(getHeaders(context))
        .end((error, response) => {
          if (error) reject(errorLogger(error))
          else if (response) resolve(resultLogger(response))
        })
    })

  const getStream = (context, path) =>
    new Promise((resolve, reject) => {
      superagent
        .get(remoteUrl + path)
        .agent(keepaliveAgent)
        .set(getHeaders(context))
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout({ deadline: timeout / 3 })
        .end((error, response) => {
          if (error) reject(errorLogger(error))
          else if (response) {
            resultLogger(response)
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle
            s._read = () => {}
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })

  const pipe = (context, path, pipeTo, options = { retry: 2 }) => {
    const url = remoteUrl + path
    const retryHandler = (err, res) => {
      if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
      return undefined // retry handler only for logging retries, not to influence retry logic
    }
    const deadline = { deadline: timeout / (options.retry + 1) }
    return superagent
      .get(url)
      .agent(keepaliveAgent)
      .set(getHeaders(context))
      .retry(options.retry, retryHandler)
      .timeout(deadline)
      .on('response', res => {
        pipeTo.header(res.header)
      })
      .pipe(pipeTo)
  }

  return {
    get,
    getWithCustomTimeout,
    getStream,
    pipe,
    post,
    put,
  }
}

module.exports = factory
