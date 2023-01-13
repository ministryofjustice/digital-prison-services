export const processError = (error) => {
  if (!error.response) throw error
  if (!error.response.status) throw error
  if (error.response.status !== 404) throw error // Not Found
  return undefined
}

export const restrictedPatientApiFactory = (client) => {
  const processResponse = (agencyIds) => (response) => {
    const { agencyId, active } = response.body.supportingPrison
    return {
      isCaseLoadRestrictedPatient: agencyIds.includes(agencyId) && active,
      hospital: response.body.hospitalLocation,
    }
  }

  const get = (context, url, agencyIds) => client.get(context, url).then(processResponse(agencyIds)).catch(processError)

  const getRestrictedPatientDetails = (context, prisonerNo, agencyIds) =>
    get(context, `/restricted-patient/prison-number/${prisonerNo}`, agencyIds)

  return {
    getRestrictedPatientDetails,
  }
}

export default {
  restrictedPatientApiFactory,
}
