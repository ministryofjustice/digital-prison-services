// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logErrorAn... Remove this comment to see the full error message
const logErrorAndContinue = require('../shared/logErrorAndContinue')

module.exports = (prisonApi) => {
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
