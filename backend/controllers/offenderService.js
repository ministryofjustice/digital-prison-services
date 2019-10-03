const { properCaseName } = require('../utils')

const OffenderServiceFactory = elite2Api => {
  const getOffender = async (context, offenderNo) => {
    const bookingDetails = await elite2Api.getDetails(context, offenderNo)

    return {
      bookingId: bookingDetails.bookingId,
      firstName: properCaseName(bookingDetails.firstName),
      lastName: properCaseName(bookingDetails.lastName),
    }
  }

  return {
    getOffender,
  }
}

module.exports = OffenderServiceFactory
