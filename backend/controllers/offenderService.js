const { capitalise } = require('../utils')

const OffenderServiceFactory = elite2Api => {
  const getOffender = async (context, offenderNo) => {
    const bookingDetails = await elite2Api.getDetails(context, offenderNo)

    return {
      bookingId: bookingDetails.bookingId,
      firstName: capitalise(bookingDetails.firstName),
      lastName: capitalise(bookingDetails.lastName),
    }
  }

  return {
    getOffender,
  }
}

module.exports = OffenderServiceFactory
