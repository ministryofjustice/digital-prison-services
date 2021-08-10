import logErrorAndContinue from '../shared/logErrorAndContinue'

export default (prisonApi) => {
  const getPersonContactDetails = async (context, personId) => {
    const [addresses, emails, phones] = await Promise.all(
      [
        prisonApi.getPersonAddresses(context, personId),
        prisonApi.getPersonEmails(context, personId),
        prisonApi.getPersonPhones(context, personId),
      ].map((apiCall) => logErrorAndContinue(apiCall))
    )

    return {
      addresses,
      emails,
      phones,
    }
  }

  return {
    getPersonContactDetails,
  }
}
