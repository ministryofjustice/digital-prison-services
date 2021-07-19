// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'contextPro... Remove this comment to see the full error message
const contextProperties = require('../contextProperties')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'processRes... Remove this comment to see the full error message
const processResponse = (context) => (response) => {
  contextProperties.setResponsePagination(context, response.headers)
  return response.body
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'processErr... Remove this comment to see the full error message
const processError = (error) => {
  if (!error.response) throw error
  if (!error.response.status) throw error
  if (error.response.status !== 404) throw error // Not Found
  return {}
}

const allocationManagerApiFactory = (client) => {
  const get = (context, url) => client.get(context, url).then(processResponse(context)).catch(processError)

  const getPomByOffenderNo = (context, offenderNo) => get(context, `/api/allocation/${offenderNo}`)

  return {
    getPomByOffenderNo,
  }
}

module.exports = { allocationManagerApiFactory }
