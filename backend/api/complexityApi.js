const contextProperties = require('../contextProperties')

const complexityApiFactory = (client) => {
  const processResponse = (context) => (response) => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }

  const post = (context, url, data) => client.post(context, url, data).then(processResponse(context))

  const getComplexOffenders = (context, offenders) =>
    post(context, '/v1/complexity-of-need/multiple/offender-no', offenders)

  return {
    getComplexOffenders,
  }
}

module.exports = {
  complexityApiFactory,
}
