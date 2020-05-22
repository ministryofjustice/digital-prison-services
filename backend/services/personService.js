const logErrorAndContinue = require('../shared/logErrorAndContinue')

module.exports = elite2Api => {
  const getPersonContactDetails = async (context, personId) => {
    const [addresses, emails, phones] = await Promise.all(
      [
        elite2Api.getPersonAddresses(context, personId),
        elite2Api.getPersonEmails(context, personId),
        elite2Api.getPersonPhones(context, personId),
      ].map(apiCall => logErrorAndContinue(apiCall))
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
