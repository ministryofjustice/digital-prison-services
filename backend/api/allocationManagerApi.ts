import contextProperties from '../contextProperties'

export const processResponse = (context) => (response) => {
  contextProperties.setResponsePagination(context, response.headers)
  return response.body
}

export const processError = (error) => {
  if (!error.response) throw error
  if (!error.response.status) throw error
  if (error.response.status !== 404) throw error // Not Found
  return {}
}

export const allocationManagerApiFactory = (client) => {
  const get = (context, url) => client.get(context, url).then(processResponse(context)).catch(processError)

  const getPomByOffenderNo = (context, offenderNo) => get(context, `/api/allocation/${offenderNo}`)

  return {
    getPomByOffenderNo,
  }
}

export default { allocationManagerApiFactory }
