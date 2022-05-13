export const processError = (error) => {
  if (!error.response) throw error
  if (!error.response.status) throw error
  if (error.response.status !== 404) throw error // Not Found
  return false
}

export const restrictedPatientApiFactory = (client) => {
  const processResponse = (agencyIds) => (response) => {
    const { agencyId, active } = response.body.supportingPrison
    return agencyIds.includes(agencyId) && active
  }

  const get = (context, url, agencyIds) => client.get(context, url).then(processResponse(agencyIds)).catch(processError)

  const isCaseLoadRestrictedPatient = (context, prisonerNo, agencyIds) =>
    get(context, `/restricted-patient/prison-number/${prisonerNo}`, agencyIds)

  return {
    isCaseLoadRestrictedPatient,
  }
}

export default {
  restrictedPatientApiFactory,
}
