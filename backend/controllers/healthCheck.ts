const superagent = require('superagent')
const Agent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logger'.
const logger = require('../log')

const agentOptions = {
  maxSockets: 100,
  maxFreeSockets: 10,
  freeSocketTimeout: 30000,
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'serviceChe... Remove this comment to see the full error message
function serviceCheckFactory(name, url) {
  const keepaliveAgent = url.startsWith('https') ? new HttpsAgent(agentOptions) : new Agent(agentOptions)

  return () =>
    new Promise((resolve, reject) => {
      superagent
        .get(url)
        .agent(keepaliveAgent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout({
          response: 1000,
          deadline: 1500,
        })
        .end((error, result) => {
          if (error) {
            logger.error(error.stack, `Error calling ${name}`)
            reject(error)
          } else if (result.status === 200) {
            resolve('UP')
          } else {
            reject(result.status)
          }
        })
    })
}

module.exports = {
  serviceCheckFactory,
}
