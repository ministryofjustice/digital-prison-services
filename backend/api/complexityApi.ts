// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'contextPro... Remove this comment to see the full error message
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
