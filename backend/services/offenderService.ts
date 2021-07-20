// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'properCase... Remove this comment to see the full error message
const { properCaseName } = require('../utils')

const OffenderServiceFactory = (prisonApi) => {
  const getOffender = async (context, offenderNo) => {
    const bookingDetails = await prisonApi.getDetails(context, offenderNo)

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
