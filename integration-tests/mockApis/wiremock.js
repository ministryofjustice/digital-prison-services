const superagent = require('superagent')

const url = 'http://localhost:9191/__admin'

const stubFor = (mapping) => superagent.post(`${url}/mappings`).send(mapping)

/** Makes stateful stubs */
const stubScenario = ({ scenarioName, mappings }) => {
  let previousState = 'Started'
  const promises = Object.entries(mappings)
    .map(([state, mapping]) => {
      const promise = superagent.post(`${url}/mappings`).send({
        ...mapping,
        scenarioName,
        requiredScenarioState: previousState,
        newScenarioState: state
      })
      previousState = state
      return promise
    })
  return Promise.all(promises)
}

const getRequests = () => superagent.get(`${url}/requests`)

const getMatchingRequests = (body) => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = () => Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

const resetStub = ({ requestUrl, method }) => {
  return superagent.post(`${url}/requests/remove`).send({
    method,
    url: requestUrl,
  })
}

const verifyPosts = (requestUrl, body) => {
  const bodyPatterns =
    (body && {
      bodyPatterns: [{ equalToJson: JSON.stringify(body) }],
    }) ||
    {}

  return superagent.post(`${url}/requests/count`).send({
    method: 'POST',
    url: requestUrl,
    ...bodyPatterns,
  })
}

const verifyPut = (requestUrl) =>
  superagent.post(`${url}/requests/count`).send({
    method: 'PUT',
    url: requestUrl,
  })

const verifyGet = (requestUrl) =>
  superagent.post(`${url}/requests/count`).send({
    method: 'GET',
    url: requestUrl,
  })

const getFor = ({ body, urlPattern, urlPath }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern,
      urlPath,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: body,
    },
  })

const postFor = ({ body, urlPattern, urlPath }) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern,
      urlPath,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: body,
    },
  })

module.exports = {
  stubFor,
  stubScenario,
  getRequests,
  getMatchingRequests,
  resetStubs,
  getFor,
  postFor,
  verifyPosts,
  verifyPut,
  verifyGet,
  resetStub,
}
