export const processError = (error) => {
  if (!error.response) throw error
  if (!error.response.status) throw error
  if (error.response.status !== 404) throw error // Not Found
  return false
}

export const restrictedPatientApiFactory = (client) => {
  const processResponse = (activeCaseLoad) => (response) => {
    console.log(response.body)
    return activeCaseLoad === response.body.supportingPrison.agencyId
  }

  const get = (context, url, activeCaseLoad) =>
    client.get(context, url).then(processResponse(activeCaseLoad)).catch(processError)

  const isCaseLoadRestrictedPatient = (context, prisonerNo, activeCaseLoad) =>
    get(context, `/restricted-patient/prison-number/${prisonerNo}`, activeCaseLoad)

  return {
    isCaseLoadRestrictedPatient,
  }
}

export default {
  restrictedPatientApiFactory,
}
